import cv2
from ultralytics import YOLO
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "fire_best.pt")
model = YOLO(MODEL_PATH)

# Force DirectShow backend instead of MSMF
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not cap.isOpened():
    print("Camera not accessible")
    exit()

# Pass camera object to YOLO
model.predict(source=cap, show=True, save=True)
