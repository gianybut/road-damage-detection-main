"""
Download the RDD2022 dataset for training.
Supports multiple download methods via kagglehub, Kaggle CLI, and manual download.

Full dataset: https://github.com/sekilab/RoadDamageDetector
Kaggle dataset: https://www.kaggle.com/datasets/aliabdelmenam/rdd-2022

Recommended method (all platforms, requires Kaggle account):
    python backend/download_dataset.py --kagglehub

For Google Colab (simplest):
    !pip install kagglehub
    !python backend/download_dataset.py --kagglehub
"""

import os
import requests
import zipfile
import shutil
import yaml
import argparse
import sys
from pathlib import Path

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")


def create_data_yaml():
    """
    Create the data.yaml file required by YOLOv5 for training.
    This defines the dataset paths and class names.
    """
    data_config = {
        "path": DATA_DIR,
        "train": "images/train",
        "val": "images/val",
        "nc": 4,  # number of classes
        "names": [
            "D00",  # Longitudinal Crack
            "D10",  # Transverse Crack
            "D20",  # Alligator Crack
            "D40",  # Pothole
        ],
    }

    yaml_path = os.path.join(DATA_DIR, "data.yaml")
    with open(yaml_path, "w") as f:
        yaml.dump(data_config, f, default_flow_style=False)

    print(f"✅ Created {yaml_path}")
    return yaml_path


def setup_directory_structure():
    """Create the directory structure expected by YOLOv5."""
    dirs = [
        os.path.join(DATA_DIR, "images", "train"),
        os.path.join(DATA_DIR, "images", "val"),
        os.path.join(DATA_DIR, "labels", "train"),
        os.path.join(DATA_DIR, "labels", "val"),
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        print(f"📁 Created: {d}")


def download_from_kaggle_cli(dataset_name="chitholian/road-damage-detection-rdd2022"):
    """
    Download dataset using Kaggle CLI.
    Requires: pip install kaggle
    Setup: Place kaggle.json in ~/.kaggle/
    """
    print(f"📥 Downloading from Kaggle: {dataset_name}")
    try:
        import subprocess
        download_path = os.path.join(BASE_DIR, "temp_kaggle")
        os.makedirs(download_path, exist_ok=True)
        
        subprocess.run([
            "kaggle", "datasets", "download", "-d", dataset_name, 
            "-p", download_path, "--unzip"
        ], check=True)
        
        print("✅ Kaggle download completed!")
        return download_path
    except Exception as e:
        print(f"❌ Kaggle download failed: {e}")
        return None


def download_from_kagglehub():
    """
    Download dataset using kagglehub (simplest method).
    Requires: pip install kagglehub
    No setup needed - uses your Kaggle account automatically.
    """
    print("📥 Downloading from Kaggle using kagglehub...")
    try:
        import kagglehub
        
        # Download latest version of the dataset
        dataset_path = kagglehub.dataset_download("aliabdelmenam/rdd-2022")
        print(f"✅ Dataset downloaded to: {dataset_path}")
        
        # Organize into backend/data structure
        for folder in ["images", "labels"]:
            src = os.path.join(dataset_path, folder)
            dst = os.path.join(DATA_DIR, folder, "train")
            
            if os.path.exists(src):
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                # Copy files
                for item in os.listdir(src):
                    src_file = os.path.join(src, item)
                    dst_file = os.path.join(dst, item)
                    if os.path.isfile(src_file):
                        os.makedirs(os.path.dirname(dst_file), exist_ok=True)
                        shutil.copy2(src_file, dst_file)
                print(f"✅ Organized {folder} to {dst}")
        
        return DATA_DIR
    except Exception as e:
        print(f"❌ kagglehub download failed: {e}")
        print("   Install with: pip install kagglehub")
        return None


def download_sample_dataset():
    """
    Download a small sample dataset from Google Drive or similar service.
    This is for quick testing and validation.
    """
    print("📥 Downloading sample RDD2022 dataset...")
    
    # Create sample directory structure with dummy files
    sample_images_train = os.path.join(DATA_DIR, "images", "train")
    sample_labels_train = os.path.join(DATA_DIR, "labels", "train")
    sample_images_val = os.path.join(DATA_DIR, "images", "val")
    sample_labels_val = os.path.join(DATA_DIR, "labels", "val")
    
    os.makedirs(sample_images_train, exist_ok=True)
    os.makedirs(sample_labels_train, exist_ok=True)
    os.makedirs(sample_images_val, exist_ok=True)
    os.makedirs(sample_labels_val, exist_ok=True)
    
    print("✅ Sample dataset structure created!")
    print(f"   📁 {sample_images_train}")
    print(f"   📁 {sample_labels_train}")
    print(f"   📁 {sample_images_val}")
    print(f"   📁 {sample_labels_val}")


def download_from_google_drive(drive_id, output_path):
    """
    Download a file from Google Drive using the file ID.
    Requires: pip install gdown
    """
    try:
        import gdown
        print(f"📥 Downloading from Google Drive: {drive_id}")
        gdown.download(f"https://drive.google.com/uc?id={drive_id}", output_path, quiet=False)
        print(f"✅ Downloaded to {output_path}")
        return output_path
    except ImportError:
        print("❌ gdown not installed. Run: pip install gdown")
        return None


def extract_and_organize(dataset_path):
    """Extract and organize downloaded dataset into YOLO format."""
    print(f"📦 Organizing dataset from {dataset_path}")
    
    # Implementation depends on the actual structure of the downloaded dataset
    # This is a template - adjust based on your dataset structure
    
    if os.path.exists(os.path.join(dataset_path, "images")):
        src_images = os.path.join(dataset_path, "images")
        dst_images = os.path.join(DATA_DIR, "images", "train")
        
        if os.path.exists(src_images):
            for img in os.listdir(src_images):
                src_file = os.path.join(src_images, img)
                dst_file = os.path.join(dst_images, img)
                if os.path.isfile(src_file):
                    shutil.copy2(src_file, dst_file)
            print(f"✅ Images copied to {dst_images}")
    
    if os.path.exists(os.path.join(dataset_path, "labels")):
        src_labels = os.path.join(dataset_path, "labels")
        dst_labels = os.path.join(DATA_DIR, "labels", "train")
        
        if os.path.exists(src_labels):
            for label in os.listdir(src_labels):
                src_file = os.path.join(src_labels, label)
                dst_file = os.path.join(dst_labels, label)
                if os.path.isfile(src_file):
                    shutil.copy2(src_file, dst_file)
            print(f"✅ Labels copied to {dst_labels}")


def main():
    parser = argparse.ArgumentParser(description="Download RDD2022 dataset")
    parser.add_argument("--kagglehub", action="store_true", help="Download using kagglehub (recommended, simplest)")
    parser.add_argument("--kaggle", action="store_true", help="Download using Kaggle CLI")
    parser.add_argument("--colab", action="store_true", help="Optimize for Google Colab")
    parser.add_argument("--sample", action="store_true", help="Create sample dataset structure")
    parser.add_argument("--no-yaml", action="store_true", help="Skip YAML creation")
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("📦 RDD2022 Road Damage Detection Dataset Setup")
    print("=" * 70)
    print()
    print("📊 Dataset Info:")
    print("   • Total Images: 47,420 road damage images")
    print("   • Countries: 6 (Japan, India, Czech Republic, US, Norway, China)")
    print("   • Annotations: 55,000+")
    print()
    print("🏷️  Damage Classes:")
    print("   D00 - Longitudinal Crack (stress/load)")
    print("   D10 - Transverse Crack (traffic/fatigue)")
    print("   D20 - Alligator Crack (advanced deterioration)")
    print("   D40 - Pothole (surface defect)")
    print()

    # Create directory structure
    setup_directory_structure()

    # Handle different download methods
    if args.kagglehub:
        print("🔧 Using kagglehub (simplest method)...")
        download_from_kagglehub()
    
    elif args.kaggle:
        print("🔧 Using Kaggle CLI...")
        dataset_path = download_from_kaggle_cli()
        if dataset_path:
            extract_and_organize(dataset_path)
            shutil.rmtree(os.path.join(BASE_DIR, "temp_kaggle"), ignore_errors=True)
    
    elif args.colab:
        print("🔧 Using Google Colab mode...")
        print("   • Run in Colab: !pip install kagglehub")
        print("   • Then: !python backend/download_dataset.py --kagglehub")
        setup_directory_structure()
    
    elif args.sample:
        print("🔧 Creating sample dataset structure (no actual data)...")
        download_sample_dataset()
    
    else:
        print("🔧 Download options:")
        print()
        print("   ✨ RECOMMENDED (simplest, all platforms):")
        print("      pip install kagglehub")
        print("      python backend/download_dataset.py --kagglehub")
        print()
        print("   Alternative options:")
        print("      Option 1: Kaggle CLI")
        print("         pip install kaggle")
        print("         python backend/download_dataset.py --kaggle")
        print()
        print("      Option 2: Manual download from GitHub")
        print("         https://github.com/sekilab/RoadDamageDetector")
        print()
        print("      Option 3: Sample structure (for testing)")
        print("         python backend/download_dataset.py --sample")
        print()

    # Create data.yaml if not skipped
    if not args.no_yaml:
        create_data_yaml()

    print()
    print("=" * 70)
    print("✅ Setup complete!")
    print("=" * 70)
    print()
    print("📝 Next steps:")
    print("   1. Ensure images are in: backend/data/images/train/")
    print("   2. Ensure labels are in: backend/data/labels/train/")
    print("   3. Labels must be in YOLO format:")
    print("      <class_id> <x_center> <y_center> <width> <height>")
    print("      (all values normalized 0-1)")
    print()
    print("🚀 To start training in Google Colab:")
    print("   1. Open training_notebook_colab.ipynb in Google Colab")
    print("   2. Run all cells (GPU will autodetect)")
    print()



if __name__ == "__main__":
    main()
    print()
    print("ALTERNATIVE: Use Google Colab for faster download + training.")
    print("Upload train.py and data.yaml to Colab and use their free GPU.")
    print()


if __name__ == "__main__":
    main()
