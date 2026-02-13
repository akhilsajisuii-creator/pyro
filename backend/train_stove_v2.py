from ultralytics import YOLO
import os

def train():
    # Load smaller model for fast training on large dataset
    model = YOLO('yolov8n.pt') 

    # Train on combined dataset
    yaml_path = os.path.abspath("combined_data.yaml")
    
    results = model.train(
        data=yaml_path,
        epochs=50, 
        imgsz=640,
        batch=8,
        name='stove_model_v3_fast',
        exist_ok=True
    )
    
    print("Training Complete. Best model saved to runs/detect/stove_model_v3_fast/weights/best.pt")

if __name__ == '__main__':
    train()
