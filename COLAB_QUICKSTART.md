# 🚀 Google Colab Quick Start Guide

## The Easiest Way: Use the Colab Notebook

Click this link to open in Google Colab:
**[Open in Google Colab](https://colab.research.google.com)**

Then:
1. File → Open notebook → GitHub tab
2. Paste your repo URL: `https://github.com/YOUR_USERNAME/road-damage-detection`
3. Select `training_notebook_colab.ipynb`
4. Click "Open notebook"
5. Go to Runtime → Change runtime type → Select **GPU** → Save
6. Run all cells: Runtime → Run all

---

## Manual Setup in Colab

If you prefer to set it up manually:

### Cell 1: Connect Google Drive

```python
from google.colab import drive
drive.mount('/content/drive')
print("✅ Google Drive mounted!")
```

### Cell 2: Clone Your Repository

```python
import os
os.chdir('/content')
!git clone https://github.com/YOUR_USERNAME/road-damage-detection.git
os.chdir('road-damage-detection')
print("✅ Repository cloned!")
```

### Cell 3: Check GPU

```python
import torch
print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'Not available'}")
print(f"CUDA: {torch.cuda.is_available()}")
```

### Cell 4: Install Dependencies

```python
!pip install -q ultralytics torch torchvision opencv-python-headless Pillow pyyaml
print("✅ Dependencies installed!")
```

### Cell 5: Download Dataset from Kaggle

```python
# First: Get kaggle.json from https://www.kaggle.com/settings/account
# Then upload it when this runs:

from google.colab import files
uploaded = files.upload()

# Setup Kaggle
!mkdir -p ~/.kaggle
!mv kaggle.json ~/.kaggle/
!chmod 600 ~/.kaggle/kaggle.json

# Download dataset
!kaggle datasets download -d chitholian/road-damage-detection-rdd2022 -p /content/road-damage-detection/backend/data --unzip
print("✅ Dataset downloaded!")
```

### Cell 6: Setup Data Structure

```python
import os
import sys
os.chdir('/content/road-damage-detection/backend')
sys.path.insert(0, '.')

from download_dataset import setup_directory_structure, create_data_yaml
setup_directory_structure()
create_data_yaml()
print("✅ Data structure ready!")
```

### Cell 7: Train Model

```python
from ultralytics import YOLO
import torch

print("🚀 Starting training...")
model = YOLO('yolov5s.pt')

results = model.train(
    data='data/data.yaml',
    epochs=50,
    imgsz=640,
    batch=16,
    patience=10,
    device=0,  # Use GPU
    amp=True,
    cache='disk',
    verbose=True,
    project='runs',
    name='road_damage'
)

print("✅ Training complete!")
```

### Cell 8: Save Model to Google Drive

```python
import shutil

# Copy to models folder
!mkdir -p models
!cp runs/road_damage/weights/best.pt models/best.pt

# Also copy to Google Drive for backup
!cp models/best.pt '/content/drive/MyDrive/road-damage-detection/best.pt'

print("✅ Model saved to Google Drive!")
```

### Cell 9: Download Model

```python
from google.colab import files
files.download('models/best.pt')
print("📥 Download started!")
```

---

## Kaggle Dataset Setup

### Get Kaggle API Key

1. Go to: https://www.kaggle.com/settings/account
2. Scroll to "API" section
3. Click "Create New API Token"
4. This downloads `kaggle.json`
5. Keep it safe!

### First Time Only

In Colab, upload kaggle.json:

```python
from google.colab import files
uploaded = files.upload()  # Select kaggle.json
```

### Automatic Download

```python
!pip install kaggle -q
!mkdir -p ~/.kaggle
!cp kaggle.json ~/.kaggle/
!chmod 600 ~/.kaggle/kaggle.json
!kaggle datasets download -d chitholian/road-damage-detection-rdd2022 -p dataset --unzip
```

---

## Google Drive Alternative

If you prefer using Google Drive instead of Kaggle:

1. **Upload dataset to Google Drive:**
   - Create folder: `My Drive → road-damage-detection → data`
   - Upload `images` and `labels` folders there

2. **In Colab, copy from Drive:**

```python
import shutil

drive_path = '/content/drive/MyDrive/road-damage-detection/data'
local_path = 'backend/data'

shutil.copytree(drive_path, local_path, dirs_exist_ok=True)
print("✅ Dataset copied from Google Drive!")
```

---

## Troubleshooting in Colab

### Out of Memory (OOM)

Reduce batch size in training:
```python
batch=8  # Instead of 16
```

### GPU Not Available

```python
# Check GPU
import torch
if torch.cuda.is_available():
    print("✅ GPU available")
else:
    print("⚠️ No GPU - go to Runtime → Change runtime type → GPU")
```

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
