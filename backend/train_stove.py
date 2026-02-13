from ultralytics import YOLO
import os

def train():
    # Load a model
    model = YOLO('yolov8n.pt')  # load a pretrained model (recommended for training)

    # Train the model
    # We use the absolute path to our custom data.yaml
    yaml_path = os.path.abspath("stove_data.yaml")
    
    results = model.train(
        data=yaml_path,
        epochs=50,  # 50 epochs should be enough for initial results
        imgsz=640,
        batch=16,
        name='stove_model',
        exist_ok=True
    )
    
    print("Training Complete. Best model saved to runs/detect/stove_model/weights/best.pt")

if __name__ == '__main__':
    train()
