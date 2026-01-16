
import React from 'react';

const About: React.FC = () => {
  const pythonCode = `from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np

app = Flask(__name__)
CORS(app) # This allows React to talk to Python

@app.route('/detect', methods=['POST'])
def detect():
    try:
        data = request.json
        image_b64 = data['image']
        
        # Convert base64 string to image for your model
        img_bytes = base64.b64decode(image_b64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # --- RUN YOUR YOLO MODEL HERE ---
        # results = model(img)
        # fire_found = any(results) 
        
        fire_found = False # Default placeholder
        
        return jsonify({"hazardous_fire": fire_found})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)`;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Hero Header */}
      <section className="text-center py-10">
        <div className="inline-flex p-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl mb-6 shadow-2xl shadow-red-200">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Beginner's Integration Guide</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">Follow these steps to connect your local AI model to the PyroWatch Dashboard.</p>
      </section>

      {/* Step 1: Directory Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs">1</span>
              Folder Setup
            </h3>
            <p className="text-sm text-gray-500 mb-4">Create a new folder in VS Code named <code className="bg-gray-100 px-1 rounded text-red-600">backend</code> inside your project.</p>
            <div className="bg-gray-50 p-4 rounded-xl font-mono text-[11px] text-gray-600 border border-gray-100">
              <div className="text-blue-600 font-bold">/PyroWatch-Project</div>
              <div className="ml-4 border-l-2 border-gray-200 pl-4 py-1">
                <div className="text-red-600 font-bold">/backend</div>
                <div className="ml-4 text-gray-400">├── app.py</div>
                <div className="ml-4 text-gray-400">└── your_model.pt</div>
                <div className="mt-2">/frontend (This App)</div>
                <div className="ml-4 text-gray-400">└── index.tsx...</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: VS Code Terminal */}
        <div className="lg:col-span-2 bg-gray-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 18V6h16v12H4z" /></svg>
          </div>
          
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs">2</span>
            VS Code Commands
          </h3>
          <p className="text-sm text-gray-400 mb-6">Open your VS Code terminal (Ctrl + `) and run these in order:</p>
          
          <div className="space-y-4">
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-xs">
              <div className="text-gray-500 mb-1"># Go to backend folder</div>
              <div className="text-blue-400">cd backend</div>
            </div>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-xs">
              <div className="text-gray-500 mb-1"># Install Python libraries</div>
              <div className="text-green-400">pip install flask flask-cors opencv-python numpy</div>
            </div>
            <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-xs">
              <div className="text-gray-500 mb-1"># Start your model server</div>
              <div className="text-yellow-400">python app.py</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Python Template */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs">3</span>
            Copy to app.py
          </h3>
          <button 
            onClick={() => navigator.clipboard.writeText(pythonCode)}
            className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Copy Script
          </button>
        </div>
        <div className="p-0">
          <pre className="p-8 text-[12px] font-mono text-gray-700 bg-white overflow-x-auto leading-relaxed">
            {pythonCode}
          </pre>
        </div>
      </section>

      {/* Integration Logic Card */}
      <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-8">
         <div className="text-center md:text-left space-y-2">
           <h4 className="text-2xl font-black italic uppercase">How it works</h4>
           <p className="text-blue-100 text-sm leading-relaxed">
             This React app captures a frame from your camera every 3 seconds. It sends that image to <span className="font-mono bg-blue-700 px-1 rounded">localhost:5000</span>. Your Python script receives it, runs your model, and tells React "True" if there is fire.
           </p>
         </div>
         <div className="flex-shrink-0 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-3 text-sm font-bold">
               <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
               Live Communication Active
            </div>
         </div>
      </div>
    </div>
  );
};

export default About;
