"""
Road Damage Detection API Server
Flask backend that receives images from the mobile app,
runs YOLOv5 detection, and returns bounding box results.
"""

import os
import uuid
import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from PIL import Image
import io
import torch
import numpy as np

# ============================================================
# APP CONFIGURATION
# ============================================================

app = Flask(__name__)
CORS(app)  # Allow mobile app to connect

# Database
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'database', 'detections.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Upload folder
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "database"), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)

db = SQLAlchemy(app)

# ============================================================
# DAMAGE TYPE LABELS (from RDD2022 dataset)
# ============================================================

DAMAGE_LABELS = {
    0: {"code": "D00", "name": "Longitudinal Crack", "color": "#FF6B6B", "severity": "moderate"},
    1: {"code": "D10", "name": "Transverse Crack", "color": "#FFA500", "severity": "moderate"},
    2: {"code": "D20", "name": "Alligator Crack", "color": "#FF4444", "severity": "severe"},
    3: {"code": "D40", "name": "Pothole", "color": "#CC0000", "severity": "severe"},
}

# ============================================================
# DATABASE MODEL
# ============================================================

class Detection(db.Model):
    """Stores each detection record with location and damage info."""
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    image_filename = db.Column(db.String(255), nullable=True)
    damage_type = db.Column(db.String(50), nullable=False)
    damage_code = db.Column(db.String(10), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    bbox_x1 = db.Column(db.Float, nullable=False)
    bbox_y1 = db.Column(db.Float, nullable=False)
    bbox_x2 = db.Column(db.Float, nullable=False)
    bbox_y2 = db.Column(db.Float, nullable=False)
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat(),
            "latitude": self.latitude,
            "longitude": self.longitude,
            "image_filename": self.image_filename,
            "damage_type": self.damage_type,
            "damage_code": self.damage_code,
            "confidence": round(self.confidence, 4),
            "bbox": {
                "x1": round(self.bbox_x1, 2),
                "y1": round(self.bbox_y1, 2),
                "x2": round(self.bbox_x2, 2),
                "y2": round(self.bbox_y2, 2),
            },
            "notes": self.notes,
        }

# ============================================================
# LOAD YOLOV5 MODEL
# ============================================================

MODEL_PATH = os.path.join(BASE_DIR, "models", "best.pt")

def load_model():
    """
    Load the trained YOLOv5 model.
    If no custom model exists, it downloads the default YOLOv5s as fallback.
    Replace 'best.pt' with your trained weights after training.
    """
    if os.path.exists(MODEL_PATH):
        print(f"✅ Loading custom model from {MODEL_PATH}")
        model = torch.hub.load("ultralytics/yolov5", "custom", path=MODEL_PATH, force_reload=False)
    else:
        print("⚠️  No custom model found at models/best.pt")
        print("   Using default YOLOv5s. Train your model first for road damage detection.")
        print("   Run: python train.py")
        model = torch.hub.load("ultralytics/yolov5", "yolov5s", force_reload=False)

    model.conf = 0.40  # Confidence threshold (40%)
    model.iou = 0.45   # NMS IoU threshold
    model.max_det = 20  # Max detections per image
    return model

print("🔄 Loading YOLOv5 model...")
model = load_model()
print("✅ Model loaded successfully!")

# ============================================================
# API ROUTES
# ============================================================

@app.route("/", methods=["GET"])
def index():
    """Health check endpoint."""
    return jsonify({
        "status": "running",
        "app": "Road Damage Detection API",
        "version": "1.0.0",
        "model_loaded": model is not None,
        "custom_model": os.path.exists(MODEL_PATH),
        "damage_types": list(DAMAGE_LABELS.values()),
    })


@app.route("/detect", methods=["POST"])
def detect():
    """
    Main detection endpoint.
    Receives an image, runs YOLOv5, returns bounding boxes.

    Request:
        - image: file (JPEG/PNG)
        - latitude: float (optional)
        - longitude: float (optional)
        - save: bool (optional, default True — saves to database)

    Response:
        {
            "success": true,
            "detections": [...],
            "count": 3,
            "image_filename": "abc123.jpg"
        }
    """
    if "image" not in request.files:
        return jsonify({"success": False, "error": "No image provided"}), 400

    file = request.files["image"]
    latitude = request.form.get("latitude", type=float)
    longitude = request.form.get("longitude", type=float)
    save_to_db = request.form.get("save", "true").lower() == "true"

    try:
        # Read and process image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Save uploaded image
        filename = f"{uuid.uuid4().hex[:12]}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        image.save(filepath, "JPEG", quality=85)

        # Run YOLOv5 detection
        results = model(image)
        predictions = results.pandas().xyxy[0]  # DataFrame with columns: xmin, ymin, xmax, ymax, confidence, class, name

        detections = []
        for _, row in predictions.iterrows():
            class_id = int(row["class"])
            label_info = DAMAGE_LABELS.get(class_id, {
                "code": f"D{class_id}",
                "name": row.get("name", f"Class {class_id}"),
                "color": "#999999",
                "severity": "unknown",
            })

            detection = {
                "damage_type": label_info["name"],
                "damage_code": label_info["code"],
                "confidence": round(float(row["confidence"]), 4),
                "color": label_info["color"],
                "severity": label_info["severity"],
                "bbox": {
                    "x1": round(float(row["xmin"]), 2),
                    "y1": round(float(row["ymin"]), 2),
                    "x2": round(float(row["xmax"]), 2),
                    "y2": round(float(row["ymax"]), 2),
                },
            }
            detections.append(detection)

            # Save each detection to database
            if save_to_db:
                record = Detection(
                    latitude=latitude,
                    longitude=longitude,
                    image_filename=filename,
                    damage_type=label_info["name"],
                    damage_code=label_info["code"],
                    confidence=float(row["confidence"]),
                    bbox_x1=float(row["xmin"]),
                    bbox_y1=float(row["ymin"]),
                    bbox_x2=float(row["xmax"]),
                    bbox_y2=float(row["ymax"]),
                )
                db.session.add(record)

        if save_to_db and detections:
            db.session.commit()

        return jsonify({
            "success": True,
            "detections": detections,
            "count": len(detections),
            "image_filename": filename,
            "image_size": {"width": image.width, "height": image.height},
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/history", methods=["GET"])
def history():
    """
    Get detection history.
    Query params: limit (int), offset (int)
    """
    limit = request.args.get("limit", 50, type=int)
    offset = request.args.get("offset", 0, type=int)

    records = (
        Detection.query
        .order_by(Detection.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    total = Detection.query.count()

    return jsonify({
        "success": True,
        "records": [r.to_dict() for r in records],
        "total": total,
        "limit": limit,
        "offset": offset,
    })


@app.route("/history/map", methods=["GET"])
def map_data():
    """
    Get all detections with GPS coordinates for map visualization.
    Returns only records that have latitude and longitude.
    """
    records = (
        Detection.query
        .filter(Detection.latitude.isnot(None), Detection.longitude.isnot(None))
        .order_by(Detection.timestamp.desc())
        .all()
    )
    return jsonify({
        "success": True,
        "markers": [r.to_dict() for r in records],
        "total": len(records),
    })


@app.route("/history/stats", methods=["GET"])
def stats():
    """Get summary statistics of all detections."""
    total = Detection.query.count()

    # Count by damage type
    type_counts = {}
    for code, info in DAMAGE_LABELS.items():
        count = Detection.query.filter_by(damage_code=info["code"]).count()
        type_counts[info["name"]] = count

    # Average confidence
    from sqlalchemy import func
    avg_conf = db.session.query(func.avg(Detection.confidence)).scalar() or 0

    return jsonify({
        "success": True,
        "total_detections": total,
        "by_type": type_counts,
        "average_confidence": round(float(avg_conf), 4),
    })


@app.route("/uploads/<filename>", methods=["GET"])
def serve_upload(filename):
    """Serve uploaded images."""
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route("/history/<detection_id>", methods=["DELETE"])
def delete_detection(detection_id):
    """Delete a detection record."""
    record = Detection.query.get(detection_id)
    if not record:
        return jsonify({"success": False, "error": "Not found"}), 404
    db.session.delete(record)
    db.session.commit()
    return jsonify({"success": True, "message": "Deleted"})


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("✅ Database initialized")

    print("\n" + "=" * 50)
    print("🚀 Road Damage Detection API")
    print("=" * 50)
    print(f"📡 Server: http://0.0.0.0:5000")
    print(f"📂 Uploads: {UPLOAD_FOLDER}")
    print(f"🧠 Model: {'Custom (best.pt)' if os.path.exists(MODEL_PATH) else 'Default YOLOv5s'}")
    print("=" * 50 + "\n")

    app.run(host="0.0.0.0", port=5000, debug=True)
