from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
from ultralytics import YOLO

app = Flask(__name__)
# Enable CORS for robust frontend-backend communication
CORS(app, resources={r"/*": {"origins": "*"}}) 

# ---------------------------------------------------------
# LOAD YOUR CUSTOM MODEL
# ---------------------------------------------------------
print("--- PyroWatch Model Loader ---")
try:
    # Use fire_best.pt - ensure this file is in the same folder as app.py
    model = YOLO('fire_best.pt') 
    print("✓ fire_best.pt loaded successfully")
    print(f"Model Labels Found: {list(model.names.values())}")
except Exception as e:
    print(f"ERROR: Could not find 'fire_best.pt'. Ensure the file exists.")

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

        # Run Inference (lower confidence to catch early signs)
        results = model(img, conf=0.25, verbose=False)
        
        detections = []
        found_labels = []
        for box in results[0].boxes:
            label = model.names[int(box.cls)]
            conf = float(box.conf)
            found_labels.append(label)
            detections.append({"label": label, "confidence": round(conf, 2)})
        
        # ---------------------------------------------------------
        # HAZARD LOGIC
        # Match these to your model's exact labels
        # ---------------------------------------------------------
        hazard_list = ['fire', 'smoke', 'flame', 'hazard'] 
        is_hazard = any(l.lower() in hazard_list for l in found_labels)
        
        print(f"Sync: {detections if detections else '[]'} | Alarm: {is_hazard}")
        
        return jsonify({
            "hazardous_fire": is_hazard,
            "detected_objects": found_labels,
            "raw_detections": detections, # New detailed feedback
            "status": "success"
        })
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({"status": "alive", "model": "fire_best.pt"}), 200

if __name__ == '__main__':
    print("--- PyroWatch Backend Ready ---")
    print("Surveillance Endpoint: http://localhost:5000/detect")
    app.run(host='0.0.0.0', port=5000, debug=False)