# 🆘 Troubleshooting & FAQ

## Google Colab-Specific Issues

### GPU not available in Colab

**Problem:** Training runs on CPU (slow)

**Solution:**
1. Click: `Runtime → Change runtime type`
2. Select: `GPU` (or **TPU** for ultra-fast training)
3. Click: `Save`
4. Restart and re-run cells

---

### Out of memory in Colab

**Problem:** Tensor allocation failed / OOM

**Solution:**
```python
# In training cell, reduce batch
batch = 8  # From 16
```

Or restart Colab runtime:
```
Runtime → Restart runtime
```

---

### Kaggle authentication in Colab

**Problem:** `PermissionError: [Errno 13] Permission denied: '/root/.kaggle'`

**Solution:**
```python
from google.colab import files
uploaded = files.upload()  # Upload kaggle.json

!mkdir -p ~/.kaggle
!mv kaggle.json ~/.kaggle/
!chmod 600 ~/.kaggle/kaggle.json

# Now try download
!kaggle datasets download -d chitholian/road-damage-detection-rdd2022 -p . --unzip
```

---

### Model download timeout in Colab

**Problem:** Training finishes but can't download model

**Solution:**
```python
# Instead of files.download(), use Google Drive
import shutil
!cp models/best.pt '/content/drive/MyDrive/your_backup.pt'
# Then download from Google Drive manually
```

---

## Training Issues

### Training stuck / no progress

**Problem:** Training starts but no output / hangs

**Solution:**
```python
# Add verbose output
verbose=True
```

Check GPU is being used:
```
# In another terminal
nvidia-smi
```

Check disk space:
```
# Windows PowerShell
Get-Volume

# Ensure at least 50GB free
```

---

### Loss not decreasing

**Problem:** Training results in poor accuracy (loss doesn't improve)

**Causes & fixes:**
1. **Wrong data format** → Verify YOLO format labels
2. **Poor dataset quality** → Check # of images (need 1000+)
3. **Wrong classes** → Verify 4 classes (D00, D10, D20, D40)
4. **Learning rate too high** → YOLOv5 auto-adjusts, check lr
5. **Imbalanced classes** → Some classes have fewer samples

**Debug:**
```python
# Check dataset
import os
num_images = len(os.listdir('backend/data/images/train'))
num_labels = len(os.listdir('backend/data/labels/train'))
print(f"Images: {num_images}, Labels: {num_labels}")

# Must be equal!
```

---

### Model accuracy too low

**Problem:** Detection results show 30-40% confidence (want 70%+)

**Causes:**
1. **Too few training images** → Train on more (>5000 recommended)
2. **Too few epochs** → Increase to 100+
3. **Wrong model size** → Try `yolov5m.pt` instead of `yolov5s.pt`
4. **Poor image quality** → Original RDD2022 images should be good

**Fix:**
```python
# Retrain with better settings
epochs = 100        # Not 50
model = YOLO('yolov5m.pt')  # Larger model
batch = 16
imgsz = 832
```

---

## Performance Tips

### Training speed in Colab

**Speed comparison:**
- **GPU (T4)**: ~1.5 epochs/min → 50 epochs = ~2-3 hours  
- **GPU (V100)**: ~3 epochs/min → 50 epochs = ~1.5 hours

To speed up training in Colab:
1. Use faster GPU runtime: `Runtime → Change runtime type → V100` (Colab Pro)
2. Reduce batch size: `batch=8`
3. Reduce image size: `imgsz=416`
4. Reduce epochs: Start with `epochs=30` for testing

---

## Common Errors & Quick Fixes

| Error | Quick Fix |
|-------|-----------|
| `ModuleNotFoundError: No module named 'torch'` | Re-run first cell with `!pip install torch` |
| `RuntimeError: CUDA out of memory` | Set `batch=8` and restart runtime |
| `FileNotFoundError: models/best.pt not found` | Model not trained yet - run training cells first |
| `PermissionError: [Errno 13] Permission denied` in Kaggle | Upload kaggle.json in Colab |
| No detections in results | Model confidence too high, increase conf=0.1 |

---

## Getting Help

If none of these solutions work:

1. **Check Colab cell output** for error messages

2. **YOLOv5 Documentation:**
   - Docs: https://docs.ultralytics.com/yolov5/
   - GitHub Issues: https://github.com/ultralytics/yolov5/issues

3. **Colab Guide:**
   - See `COLAB_QUICKSTART.md`

4. **Stack Overflow:**
   - Tag: `yolov5`, `pytorch`, `google-colab`

---

## Debugging - Collect System Info

In a Colab cell, run:

```python
import torch
print(f"PyTorch: {torch.__version__}")
print(f"CUDA: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
```

---

Good luck! 🚀
