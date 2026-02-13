import os
import shutil
import glob
from tqdm import tqdm

# Configuration
DATASET_1_PATH = r"C:\Users\ambad\Desktop\model\gas stove safety.v1i.yolov8"
DATASET_2_PATH = r"C:\Users\ambad\Desktop\model\AQM_3.v3i.yolov8"
DATASET_3_PATH = r"C:\Users\ambad\Desktop\model" # Root folder dataset
OUTPUT_PATH = r"C:\Users\ambad\Desktop\model\combined_dataset"

# Class Mappings
# Target Schema:
# 0: flame (combines flame_on + flames + queimador-aceso)
# 1: person (from human)
# 2: knob_on
# 3: knob_off
# 4: pot
# 5: window
# 6: flame_off (combines flame_off + queimador-apagado)

# Dataset 1: ['flame_off', 'flame_on', 'knob_off', 'knob_on']
MAP_1 = {0: 6, 1: 0, 2: 3, 3: 2}

# Dataset 2: ['flames', 'human', 'pot', 'window']
MAP_2 = {0: 0, 1: 1, 2: 4, 3: 5}

# Dataset 3: ['queimador-aceso', 'queimador-apagado']
# 0 -> 0 (flame)
# 1 -> 6 (flame_off)
MAP_3 = {0: 0, 1: 6}

def process_dataset(source_path, mapping, tag):
    for split in ['train', 'valid', 'test']:
        # Define paths
        src_img_dir = os.path.join(source_path, split, 'images')
        src_lbl_dir = os.path.join(source_path, split, 'labels')
        
        dst_img_dir = os.path.join(OUTPUT_PATH, split, 'images')
        dst_lbl_dir = os.path.join(OUTPUT_PATH, split, 'labels')
        
        os.makedirs(dst_img_dir, exist_ok=True)
        os.makedirs(dst_lbl_dir, exist_ok=True)
        
        # Check if source directory exists
        if not os.path.exists(src_img_dir):
            print(f"Skipping {tag} - {split}: Directory not found {src_img_dir}")
            continue

        # Get files
        images = glob.glob(os.path.join(src_img_dir, '*'))
        
        print(f"Processing {tag} - {split}: {len(images)} images")
        
        for img_path in images:
            # Check if it's a file (not a directory like the sub-datasets)
            if not os.path.isfile(img_path):
                continue
                
            # Copy Image
            basename = os.path.basename(img_path)
            new_name = f"{tag}_{basename}"
            shutil.copy(img_path, os.path.join(dst_img_dir, new_name))
            
            # Process Label
            lbl_name = os.path.splitext(basename)[0] + '.txt'
            src_lbl = os.path.join(src_lbl_dir, lbl_name)
            dst_lbl = os.path.join(dst_lbl_dir, os.path.splitext(new_name)[0] + '.txt')
            
            if os.path.exists(src_lbl):
                with open(src_lbl, 'r') as f:
                    lines = f.readlines()
                
                new_lines = []
                for line in lines:
                    parts = line.strip().split()
                    if not parts: continue
                    
                    try:
                        cls_id = int(parts[0])
                        if cls_id in mapping:
                            new_cls = mapping[cls_id]
                            new_line = f"{new_cls} {' '.join(parts[1:])}\n"
                            new_lines.append(new_line)
                    except ValueError:
                        continue
                
                if new_lines:
                    with open(dst_lbl, 'w') as f:
                        f.writelines(new_lines)

if __name__ == "__main__":
    if os.path.exists(OUTPUT_PATH):
        print(f"Removing existing output: {OUTPUT_PATH}")
        shutil.rmtree(OUTPUT_PATH)
        
    process_dataset(DATASET_1_PATH, MAP_1, "stov")
    process_dataset(DATASET_2_PATH, MAP_2, "aqm")
    process_dataset(DATASET_3_PATH, MAP_3, "new")
    
    print("\nDataset Merging Complete!")
    print(f"Output: {OUTPUT_PATH}")
