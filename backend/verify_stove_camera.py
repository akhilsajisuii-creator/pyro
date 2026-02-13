import cv2
from ultralytics import YOLO
import os

# Load the trained stove model
try:
    model_path = "stove_best.pt"
    if not os.path.exists(model_path):
        print("Error: stove_best.pt not found!")
        exit()
        
    model = YOLO(model_path)
    print("Stove Model Loaded Successfully")
    print(f"Classes: {model.names}")
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

# Start Camera
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
if not cap.isOpened():
    print("Camera not accessible")
    exit()

print("Starting Camera Feed... Press 'q' to exit.")

# Run inference loop
while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Run detection
    results = model(frame, conf=0.25)
    
    # Visualize results on the frame
    annotated_frame = results[0].plot()

    # Display
    cv2.imshow("Stove Model Verification", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
