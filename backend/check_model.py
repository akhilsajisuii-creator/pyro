from ultralytics import YOLO

try:
    model = YOLO('stove_best.pt')
    print(f"Checking 'stove_best.pt'...")
    print(f"Model classes: {model.names}")
except Exception as e:
    print(f"Error loading model: {e}")
