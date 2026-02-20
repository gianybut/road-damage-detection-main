# 🚀 Google Colab Quick Start Guide

## ⚡ Fastest Way: Use the Pre-Built Notebook

Just open and run the notebook!

**Steps:**
1. Go to [Google Colab](https://colab.research.google.com)
2. File → Open notebook → GitHub tab
3. Paste: `https://github.com/YOUR_USERNAME/road-damage-detection`
4. Select: `training_notebook_colab.ipynb`
5. Runtime → Change runtime type → Select **GPU** → Save
6. Run all cells: Runtime → Run all

Done!

---

## 📥 Dataset Download - Method 1: kagglehub (Recommended)

Simplest method - **no setup needed**:

```python
!pip install -q kagglehub

import kagglehub
path = kagglehub.dataset_download("aliabdelmenam/rdd-2022")
print(f"✅ Dataset downloaded to: {path}")
```

**Why this is best:**
- No kaggle.json upload
- No authentication setup
- Works everywhere (local, Colab, etc.)
- Fastest download

---

## Dataset Download - Method 2: Kaggle CLI (Alternative)

If you prefer Kaggle CLI:

```python
# Step 1: Get kaggle.json from https://www.kaggle.com/settings/account
from google.colab import files
uploaded = files.upload()  # Select kaggle.json

# Step 2: Setup
!mkdir -p ~/.kaggle
!mv kaggle.json ~/.kaggle/
!chmod 600 ~/.kaggle/kaggle.json

# Step 3: Download
!pip install -q kaggle
!kaggle datasets download -d aliabdelmenam/rdd-2022 -p . --unzip

print("✅ Dataset downloaded!")
```

---

## Dataset Download - Method 3: Google Drive (Manual)

1. Download from: https://github.com/sekilab/RoadDamageDetector
2. Upload to Google Drive
3. Copy in Colab:

```python
from google.colab import drive
import shutil

drive.mount('/content/drive')

shutil.copytree(
    '/content/drive/MyDrive/road-damage-detection/images',
    'backend/data/images',
    dirs_exist_ok=True
)
```

---

## ⚙️ Manual Step-by-Step Setup

---

## 🆘 Troubleshooting

### Out of Memory

```python
batch=8  # Instead of 16
```

### No GPU

Runtime → Change runtime type → Select **GPU**

### Dataset Download Fails

```python
!pip install --upgrade kagglehub
```

---

Good luck! 🚀

### Kaggle Download Failed

```python
# Use this command instead to check authentication
!kaggle datasets list -v
```

### Timeout During Download

For large files, use gdown instead:

```python
!pip install gdown -q
!gdown "https://drive.google.com/YOUR_FILE_ID" -O dataset.zip --quiet
!unzip dataset.zip -q
```

---

## Performance Tips

### Faster Training
```python
epochs = 30        # Instead of 50
imgsz = 416       # Instead of 640  
batch = 8         # Smaller batches = faster but less accurate
```

### Better Accuracy
```python
epochs = 100      # More training
imgsz = 832       # Larger images
batch = 32        # If you have Colab Pro
model = YOLO('yolov5m.pt')  # Larger model
```

---

## Save Everything Before Disconnecting

```python
# Create zip for download
!zip -r /tmp/training_results.zip runs/ models/
from google.colab import files
files.download('/tmp/training_results.zip')

# Also save to Google Drive
!cp -r runs /content/drive/MyDrive/road-damage-detection/
!cp -r models /content/drive/MyDrive/road-damage-detection/
print("✅ All results backed up!")
```

---

## Next Steps After Training

1. **Download `best.pt`** from Colab
2. **Place in local project**: `backend/models/best.pt`
3. **Test Flask API**: `python backend/app.py`
4. **Deploy to mobile app** or production server

---

## Useful Colab Features

### Use GPU

```
Runtime → Change runtime type → GPU (or TPU for mega training)
```

### Install System Packages

```python
!apt-get install -y package-name
```

### Run Bash Commands

```python
!git clone https://github.com/...
!ls -la
!wget https://...
```

### Monitor Resources

```python
!nvidia-smi  # GPU usage
!htop       # CPU usage
```

---

## Expected Training Time

| Hardware | Batch | Time |
|----------|-------|------|
| T4 GPU (Free) | 16 | 2-3 hours |
| V100 GPU (Pro) | 32 | 1-2 hours |
| A100 GPU (Pro) | 64 | 30 mins - 1 hour |
| CPU Only | 4 | 12+ hours |

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| GPU not found | Go to Runtime → Change runtime type → GPU |
| Out of memory | Reduce batch size to 4 or 8 |
| Dataset not found | Re-run Kaggle download cell |
| Training too slow | Check if GPU is being used: `nvidia-smi` |
| Colab disconnected | Enable "stay connected" in settings |
| Download failed | Use smaller batch size or reduce epochs |

---

## Getting Help

- **YOLOv5 Docs**: https://docs.ultralytics.com/yolov5/
- **Colab Docs**: https://colab.research.google.com/notebooks/
- **GitHub Issues**: https://github.com/ultralytics/yolov5/issues
- **Kaggle Dataset**: https://www.kaggle.com/datasets/chitholian/road-damage-detection-rdd2022

---

Happy Training! 🚀
