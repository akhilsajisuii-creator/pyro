from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from ultralytics import YOLO
import os

app = Flask(__name__)
# Enable CORS for robust frontend-backend communication
CORS(app, resources={r"/*": {"origins": "*"}}) 

# ---------------------------------------------------------
# LOAD MODELS
# ---------------------------------------------------------
print("--- PyroWatch Model Loader ---")

# 1. Load Person Detection Model (Existing fire_best.pt or yolov8n.pt)
person_model = None
try:
    person_model_path = 'fire_best.pt'
    if not os.path.exists(person_model_path):
        print(f"WARNING: '{person_model_path}' not found. Falling back to 'yolov8n.pt'")
        person_model_path = 'yolov8n.pt'
    
    person_model = YOLO(person_model_path)
    print(f"✓ Person Model ({person_model_path}) loaded successfully")
    print(f"  Classes: {list(person_model.names.values())}")
except Exception as e:
    print(f"ERROR: Could not load Person Model: {e}")

# 2. Load Gas Stove Model (New stove_best.pt)
stove_model = None
# Priorities: 1. Explicit 'stove_best.pt', 2. Latest training output (v3 fast), 3. Older training output
stove_model_candidates = [
    'stove_best.pt',
    'runs/detect/stove_model_v3_fast/weights/best.pt',
    'runs/detect/stove_model/weights/best.pt'
]

stove_model_path = None
for path in stove_model_candidates:
    if os.path.exists(path):
        stove_model_path = path
        break

try:
    if stove_model_path:
        stove_model = YOLO(stove_model_path)
        print(f"✓ Stove Model ({stove_model_path}) loaded successfully")
        print(f"  Classes: {list(stove_model.names.values())}")
    else:
        print(f"WARNING: No stove model found (checked: {stove_model_candidates}). Gas stove detection will be disabled until training completes.")
except Exception as e:
    print(f"ERROR: Could not load Stove Model: {e}")


import time

# Global State Storage
SYSTEM_STATE = {
    "hazard_start_time": None,
    "flame_miss_count": 0
}
HAZARD_THRESHOLD_SECONDS = 120  # 2 Minutes
FLAME_LOSS_TOLERANCE = 10 # Frames to keep flame "active" after loss (approx 2-3 sec)

@app.route('/detect', methods=['POST', 'OPTIONS'])
def detect():
    
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
        
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "No image data"}), 400
            
        # Decode base64 image from dashboard
        image_b64 = data['image']
        img_bytes = base64.b64decode(image_b64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"error": "Decode failed"}), 400

        detections = []
        found_labels = []
        
        # --- Run Person Detection ---
        person_detected = False
        if person_model:
            results_p = person_model(img, conf=0.4, verbose=False) # Higher confidence for person
            for box in results_p[0].boxes:
                label = person_model.names[int(box.cls.item())]
                conf = box.conf.item()
                
                # Check if label is person-related
                if label.lower() == 'person':
                    person_detected = True
                    found_labels.append(label)
                    detections.append({"label": label, "confidence": round(conf, 2), "model": "person"})
        
        # --- Run Stove Detection ---
        flame_detected = False
        if stove_model:
            results_s = stove_model(img, conf=0.15, verbose=False) # Lowered to 0.15 for better sensitivity
            for box in results_s[0].boxes:
                label = stove_model.names[int(box.cls.item())]
                conf = box.conf.item()
                
                found_labels.append(label)
                detections.append({"label": label, "confidence": round(conf, 2), "model": "stove"})
                
                # Check for all variations of flame labels
                if label in ['flame', 'flame_on', 'flames', 'queimador-aceso']:
                    flame_detected = True
        else:
            # Fallback: check if original model detected 'fire' or 'hazard'
            if person_model and 'fire' in found_labels:
                 flame_detected = True

        # ---------------------------------------------------------
        # FLAME DEBOUNCE LOGIC
        # ---------------------------------------------------------
        # If flame is momentarily lost, keep it "active" for a few frames
        if flame_detected:
            SYSTEM_STATE["flame_miss_count"] = 0
            flame_effectively_on = True
        else:
            SYSTEM_STATE["flame_miss_count"] += 1
            if SYSTEM_STATE["flame_miss_count"] <= FLAME_LOSS_TOLERANCE:
                flame_effectively_on = True # Grace period
            else:
                flame_effectively_on = False

        # ---------------------------------------------------------
        # HAZARD LOGIC (2-Minute Timer)
        # ---------------------------------------------------------
        is_hazard = False
        time_remaining = 0
        
        # Condition: Flame is EFFECTIVELY ON and NO Person is present
        if flame_effectively_on and not person_detected:
            current_time = time.time()
            
            if SYSTEM_STATE["hazard_start_time"] is None:
                SYSTEM_STATE["hazard_start_time"] = current_time
                print(f"⚠️ Potential Hazard Started at {SYSTEM_STATE['hazard_start_time']}")
            
            elapsed = current_time - SYSTEM_STATE["hazard_start_time"]
            time_remaining = max(0.0, HAZARD_THRESHOLD_SECONDS - elapsed)
            
            if elapsed >= HAZARD_THRESHOLD_SECONDS:
                is_hazard = True
                print(f"🚨 HAZARD CONFIRMED! Duration: {elapsed:.1f}s")
            else:
                print(f"⏳ Hazard pending... {elapsed:.1f}s / {HAZARD_THRESHOLD_SECONDS}s (Target: {int(time_remaining)}s)")
        else:
            # Condition broken (Person appeared OR Flame went off for > Tolerance)
            should_reset = False
            
            if person_detected:
                should_reset = True
                if SYSTEM_STATE["hazard_start_time"]: print("RESET: Person Detected")
            elif not flame_effectively_on:
                should_reset = True
                if SYSTEM_STATE["hazard_start_time"]: print("RESET: Flame Off (Timeout)")
            
            if should_reset:
                if SYSTEM_STATE["hazard_start_time"] is not None:
                    print("✅ Hazard Condition Canceled")
                SYSTEM_STATE["hazard_start_time"] = None

        print(f"Sync: {found_labels} | Person: {person_detected} | Flame: {flame_detected} (Effective: {flame_effectively_on}) | Hazard: {is_hazard}")
        
        return jsonify({
            "hazardous_fire": is_hazard,
            "detected_objects": found_labels,
            "raw_detections": detections, 
            "status": "success",
            "debug_info": {
                "person_detected": person_detected,
                "flame_detected": flame_detected,
                "flame_effectively_on": flame_effectively_on,
                "timer_active": SYSTEM_STATE["hazard_start_time"] is not None,
                "time_remaining_seconds": int(time_remaining)
            }
        })
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({
        "status": "alive", 
        "person_model": "loaded" if person_model else "failed",
        "stove_model": "loaded" if stove_model else "waiting_for_training"
    }), 200

if __name__ == '__main__':
    print("--- PyroWatch Backend Ready ---")
    print("Surveillance Endpoint: http://localhost:5000/detect")
    app.run(host='0.0.0.0', port=5000, debug=False)
