# 🛣️ Road Damage Detection Mobile App for LGU Road Surveys Using YOLOv5

**A computer vision thesis project** — Real-time road damage detection using deep learning and mobile technology.

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-ee4c2c.svg)](https://pytorch.org/)
[![YOLOv5](https://img.shields.io/badge/YOLOv5-Latest-green.svg)](https://github.com/ultralytics/yolov5)
[![React Native](https://img.shields.io/badge/React%20Native-0.73+-61dafb.svg)](https://reactnative.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Overview

This is a **full-stack mobile + AI solution** for detecting and mapping road damage in real-time. Local government units (LGUs) can use this app during road surveys to automatically identify and classify road damage, generating detailed reports with GPS coordinates and confidence scores.

### ✨ Key Features

- **📱 Mobile App** (React Native + Expo)
  - Live camera feed with real-time detection overlay
  - Automatic 2-second frame capture & analysis
  - GPS tagging for each detection
  - Detection history with filtering & export
  - Interactive map view of all detected damages

- **🤖 AI Backend** (Flask + YOLOv5)
  - Real-time YOLOv5s inference
  - 4-class damage detection (cracks & potholes)
  - Confidence scoring & bounding box output
  - SQLite persistence for detection records
  - RESTful API for mobile client

- **🎯 Damage Classification**
  - **D00**: Longitudinal Crack
  - **D10**: Transverse Crack
  - **D20**: Alligator Crack
  - **D40**: Pothole

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App (React Native)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Camera     │  │   Location   │  │   Map View   │       │
│  │   (Live)     │  │   (GPS)      │  │   (History)  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│           ↓ (every 2 seconds)                                │
│      JPEG Frame + GPS Coords (HTTP/JSON)                    │
└─────────────────────────────────────────────────────────────┘
                         ↓ ↑
                    Flask API Server
                         ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Flask + YOLOv5)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Image      │  │   YOLOv5s    │  │   SQLite     │       │
│  │   Upload     │  │   Inference  │  │   Database   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│           ↓ (returns detections in 500-800ms)               │
│    Bounding Boxes + Confidence + Class + Severity           │
└─────────────────────────────────────────────────────────────┘
```

**Why client-server?** Running YOLOv5 directly on a mobile phone is complex and computationally expensive. Our approach:
- ✅ Offloads heavy inference to a desktop/server
- ✅ Keep phone code simple (React Native)
- ✅ Works over local WiFi (no cloud cost)
- ✅ Faster detection times

---

## 📂 Project Structure

```
road-damage-detection/
├── README.md                          ← You are here
├── training_notebook.ipynb            ← Train YOLOv5s locally (VS Code + Apple M1)
│
├── backend/
│   ├── .gitignore
│   ├── requirements.txt               ← Python dependencies
│   ├── app.py                         ← Flask API server (main)
│   ├── download_dataset.py            ← RDD2022 dataset helper
│   ├── train.py                       ← Training script
│   ├── models/
│   │   └── best.pt                    ← Trained weights (generated)
│   ├── data/
│   │   ├── images/
│   │   │   ├── train/                 ← Training images
│   │   │   └── val/                   ← Validation images
│   │   └── labels/
│   │       ├── train/                 ← YOLO format labels
│   │       └── val/
│   └── uploads/                       ← Captured images (generated)
│
├── mobile/
│   ├── .gitignore
│   ├── App.js                         ← Root component + navigation
│   ├── app.json                       ← Expo config
│   ├── babel.config.js
│   ├── package.json
│   └── src/
│       ├── config.js                  ← API URL + constants
│       ├── utils/
│       │   └── api.js                 ← Axios HTTP client
│       ├── screens/
│       │   ├── HomeScreen.js          ← Stats dashboard
│       │   ├── CameraScreen.js        ← Live detection (core)
│       │   ├── HistoryScreen.js       ← Detection log
│       │   ├── MapScreen.js           ← GPS map view
│       │   └── ResultScreen.js        ← Detection details
│       └── components/
│           ├── BoundingBox.js         ← Bounding box overlay
│           ├── DetectionCard.js       ← Detection card component
│           └── DamageLabel.js         ← Damage badge component
│
└── TOPICS/
    └── POTHOLE_DETECTION_INTRODUCTION.txt  ← Thesis introduction & references
```

---

## �️ Training Options

## 🚀 Training with Google Colab (Free GPU)

**Best way to train:** Open the notebook in Google Colab - No installation needed, free GPU!

### Quick Start:

1. **Open notebook:** [training_notebook_colab.ipynb](./training_notebook_colab.ipynb)
2. **Click:** "Open in Google Colab" button (in notebook)
3. **Set GPU:** Runtime → Change runtime type → **GPU** ✅ Select T4
4. **Run cells:** Runtime → Run all
5. **Download:** After ~2-4 hours, download `best.pt`

### What the notebook does:
- ✅ Mounts your Google Drive
- ✅ Downloads RDD2022 dataset automatically
- ✅ Trains YOLOv5s model
- ✅ Saves model to Google Drive backup
- ✅ Provides download button

📖 **Full Guide:** [COLAB_QUICKSTART.md](./COLAB_QUICKSTART.md)

---

## Step 1: Download Trained Model

After training in Colab:
1. Download `best.pt` from notebook
2. Place in: `backend/models/best.pt`

### Step 2: Start the Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
# Server starts on http://localhost:5000
```

Check health: `curl http://localhost:5000/` → `{"status": "running"}`

### Step 3: Configure Mobile App

Edit `mobile/src/config.js`:

```javascript
// Find your machine's IP address where Flask runs
// Windows: ipconfig → IPv4 Address
// Mac: System Preferences → Network → Wi-Fi → IP Address

const API_URL = "http://192.168.1.100:5000";  // ← Update this
```

### Step 4: Start the Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your iPhone/Android (same WiFi as your server).

---

## 📊 API Endpoints

### Core Detection Endpoint

**POST** `/detect`

Upload an image for detection.

```bash
curl -X POST http://localhost:5000/detect \
  -F "image=@road_photo.jpg" \
  -F "latitude=14.2833" \
  -F "longitude=120.9567"
```

**Response:**
```json
{
  "success": true,
  "detections": [
    {
      "damage_code": "D00",
      "damage_type": "Longitudinal Crack",
      "confidence": 0.87,
      "color": "#FF6B6B",
      "severity": "medium",
      "bbox": { "x1": 100, "y1": 50, "x2": 250, "y2": 180 }
    }
  ],
  "count": 1,
  "image_filename": "20260218_123456.jpg",
  "image_size": { "width": 640, "height": 480 }
}
```

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/history?limit=50&offset=0` | Get detection history |
| GET | `/history/map` | Get GPS-tagged detections (for map) |
| GET | `/history/stats` | Get summary statistics |
| DELETE | `/history/<id>` | Delete a detection record |
| GET | `/uploads/<filename>` | Download captured image |

---

## 🔧 Configuration

### Backend (`backend/app.py`)

Edit these constants in `app.py`:

```python
DAMAGE_LABELS = {
    0: {"code": "D00", "name": "Longitudinal Crack", "color": "#FF6B6B"},
    1: {"code": "D10", "name": "Transverse Crack", "color": "#FFA500"},
    2: {"code": "D20", "name": "Alligator Crack", "color": "#FF4444"},
    3: {"code": "D40", "name": "Pothole", "color": "#CC0000"},
}

# Inference settings
CONFIDENCE_THRESHOLD = 0.40  # Min confidence to report detection
IOU_THRESHOLD = 0.45        # IoU threshold for NMS
MAX_DETECTIONS = 20         # Max objects per image
```

### Mobile (`mobile/src/config.js`)

```javascript
export const API_URL = "http://192.168.1.100:5000";
export const DETECTION_INTERVAL = 2000;        // Capture every 2 seconds
export const CONFIDENCE_THRESHOLD = 0.4;       // Filter results by confidence
```

---

## 📈 Performance Metrics

**Model Size:** ~22 MB (`yolov5s.pt`)

**Inference Speed:** ~200-400ms per image on:
- Apple M1 MPS: ~250ms
- NVIDIA GPU (RTX 4090): ~50ms
- CPU: ~800ms

**Training Time:**
- Apple M1 (8GB RAM): 1-3 hours / 50 epochs
- NVIDIA GPU (16GB VRAM): 20-40 minutes / 50 epochs

**Expected Accuracy on RDD2022:**
- mAP@0.5: 0.75-0.85
- Recall: 0.80-0.90
- Precision: 0.70-0.80

---

## 🎓 Thesis Details

**Title:** Road Damage Detection Mobile App for LGU Road Surveys Using YOLOv5

**Dataset:** [RDD2022](https://github.com/sekilab/RoadDamageDetector)
- 47,420 images
- 6 countries (India, Japan, Czech Republic, Norway, USA, China)
- 55,000+ road damage annotations
- 4 damage classes

**References:**
1. Arya et al. (2022) - "Real-time Road Damage Detection and Classification using YOLO"
2. Bustria (2025) - "YOLOv11 for Road Damage Detection"
3. Fortin & EyeWay (2024) - "Automated Road Damage Inventory Systems"
4. Pham et al. (2022, 2024) - "Efficient CNNs for Mobile Road Assessment"
5. Roy et al. (2023) - "Deep Learning for Infrastructure Monitoring"
6. Sarmiento (2021) - "Philippine Road Network Condition Survey"
7. Terven & Cordova (2023) - "Comprehensive Review of YOLO Architectures"

---

## 🐛 Troubleshooting

### Backend Issues

**"MPS not available"** (on Mac)
```python
# Fallback to CPU in training_notebook.ipynb Step 1
device = "cpu"
```

**"Out of memory" during training**
```bash
# Reduce batch size in training cell
--batch 4  # instead of 8
```

**App can't reach backend**
```bash
# Check IP address:
ifconfig | grep "inet "

# Update mobile/src/config.js with correct IP
API_URL = "http://192.168.1.XXX:5000"
```

### Mobile Issues

**"Camera permission denied"**
- iOS: Settings → Road Damage Detector → Camera/Location → Allow
- Android: App → Permissions → Camera/Location

**"QR code not scanning"**
- Ensure phone is on the same WiFi network
- Check IP address in config.js matches your computer

---

## 📝 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) file.

The YOLOv5 model is from [Ultralytics](https://github.com/ultralytics/yolov5) (AGPL-3.0).

---

## 👨‍💻 Development

### Local Setup for Contributing

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/road-damage-detection.git
cd road-damage-detection

# Backend development
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# Mobile development
cd ../mobile
npm install
npx expo start
```

### Adding New Damage Classes

1. Update `DAMAGE_LABELS` in `backend/app.py`
2. Modify `DAMAGE_COLORS` in `mobile/src/config.js`
3. Retrain the model with new class labels
4. Update `data.yaml` with new class count

---

## 📞 Support & Contact

For questions or issues:
- 📧 Email: your.email@example.com
- 🐙 GitHub Issues: [Create an issue](../../issues)
- 📖 Read: [POTHOLE_DETECTION_INTRODUCTION.txt](TOPICS/POTHOLE_DETECTION_INTRODUCTION.txt)

---

## 🎉 Acknowledgments

- **Ultralytics** for YOLOv5
- **RDD2022 Dataset** creators for the comprehensive road damage dataset
- **De La Salle University - Dasmariñas** for thesis guidance

---

**Last Updated:** February 18, 2026  
**Status:** ✅ Active Development
