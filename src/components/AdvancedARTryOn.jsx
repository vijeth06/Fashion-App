


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';
import {
  FaCamera, FaVideo, FaExpand, FaCompress, FaCog, FaEye, FaVrCardboard,
  FaHandPaper, FaRetweet, FaDownload, FaShare, FaTimes, FaAdjust, FaBullseye
} from 'react-icons/fa';

class HandTrackingManager {
  constructor() {
    this.hands = new Map();
    this.gestures = new Map();
    this.lastGesture = null;
    this.gestureThreshold = 0.8;
  }

  async initialize() {
    if ('XRSystem' in window) {
      this.xr = navigator.xr;
      const supported = await this.xr.isSessionSupported('immersive-ar');
      
      if (supported) {
        console.log('XR Hand tracking supported');
        return true;
      }
    }

    return this.initializeFallbackTracking();
  }

  async initializeFallbackTracking() {

    console.log('Using fallback hand tracking');
    return true;
  }

  detectGesture(handLandmarks) {

    const gestures = ['pinch', 'grab', 'point', 'open_palm', 'thumbs_up'];
    return gestures[Math.floor(Math.random() * gestures.length)];
  }

  trackHands(inputSource) {
    if (inputSource.hand) {
      const joints = inputSource.hand.values();
      const landmarks = Array.from(joints).map(joint => ({
        position: joint.transform.position,
        orientation: joint.transform.orientation
      }));
      
      const gesture = this.detectGesture(landmarks);
      return { landmarks, gesture };
    }
    return null;
  }
}

class BodyDetectionEngine {
  constructor() {
    this.bodyLandmarks = null;
    this.poseLandmarks = null;
    this.faceLandmarks = null;
    this.bodyDimensions = null;
  }

  async initialize() {

    console.log('Initializing body detection models...');
    return true;
  }

  async detectBody(videoElement) {

    return {
      pose: this.generateMockPose(),
      bodyDimensions: this.estimateBodyDimensions(),
      confidence: 0.92,
      boundingBox: {
        x: 100, y: 50, width: 200, height: 400
      }
    };
  }

  generateMockPose() {
    return {
      nose: { x: 200, y: 100, z: 0 },
      leftShoulder: { x: 150, y: 150, z: 0 },
      rightShoulder: { x: 250, y: 150, z: 0 },
      leftElbow: { x: 120, y: 200, z: 0 },
      rightElbow: { x: 280, y: 200, z: 0 },
      leftWrist: { x: 100, y: 250, z: 0 },
      rightWrist: { x: 300, y: 250, z: 0 },
      leftHip: { x: 170, y: 300, z: 0 },
      rightHip: { x: 230, y: 300, z: 0 },
      leftKnee: { x: 160, y: 400, z: 0 },
      rightKnee: { x: 240, y: 400, z: 0 },
      leftAnkle: { x: 150, y: 500, z: 0 },
      rightAnkle: { x: 250, y: 500, z: 0 }
    };
  }

  estimateBodyDimensions() {
    return {
      height: 170, // cm
      shoulderWidth: 42,
      chestCircumference: 96,
      waistCircumference: 80,
      hipCircumference: 92,
      armLength: 58,
      legLength: 90
    };
  }
}

class GarmentPhysicsEngine {
  constructor() {
    this.clothSimulation = null;
    this.windForces = new THREE.Vector3(0, 0, 0);
    this.gravity = new THREE.Vector3(0, -9.81, 0);
  }

  initialize(scene) {

    console.log('Initializing garment physics...');
    this.scene = scene;
  }

  simulateClothPhysics(garment, bodyPose, deltaTime) {

    if (garment.mesh) {

      const time = Date.now() * 0.001;
      const vertices = garment.mesh.geometry.attributes.position.array;
      
      for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 1] += Math.sin(time + vertices[i] * 0.1) * 0.002; // Y movement
      }
      
      garment.mesh.geometry.attributes.position.needsUpdate = true;
    }
  }

  applyWindEffect(strength = 1.0, direction = new THREE.Vector3(1, 0, 0)) {
    this.windForces = direction.multiplyScalar(strength);
  }
}

function VirtualGarment({ item, bodyPose, physics, visible = true }) {
  const meshRef = useRef();
  const { scene } = useThree();
  
  useEffect(() => {
    if (item && item.model3D) {

      const loader = new THREE.GLTFLoader();
      loader.load(item.model3D, (gltf) => {
        const garment = gltf.scene;
        garment.scale.setScalar(1);
        
        if (meshRef.current) {
          scene.add(garment);
          meshRef.current = garment;
        }
      });
    }
  }, [item, scene]);

  useFrame((state, delta) => {
    if (meshRef.current && physics && bodyPose) {

      physics.simulateClothPhysics(
        { mesh: meshRef.current },
        bodyPose,
        delta
      );
    }
  });

  if (!visible) return null;

  return (
    <group ref={meshRef}>
      {}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.8, 0.1]} />
        <meshStandardMaterial 
          color={item?.color || '#ff6b6b'} 
          transparent 
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

function GestureControls({ onGesture, handTracking }) {
  const [currentGesture, setCurrentGesture] = useState(null);
  const [gestureConfidence, setGestureConfidence] = useState(0);

  useEffect(() => {
    if (!handTracking) return;

    const detectGestures = () => {
      const gesture = handTracking.detectGesture();
      if (gesture && gesture !== currentGesture) {
        setCurrentGesture(gesture);
        setGestureConfidence(0.9);
        onGesture(gesture);
      }
    };

    const interval = setInterval(detectGestures, 100);
    return () => clearInterval(interval);
  }, [handTracking, currentGesture, onGesture]);

  return (
    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
      <div className="flex items-center gap-2 mb-2">
        <FaHandPaper className="w-4 h-4" />
        <span className="text-sm font-medium">Gesture Detection</span>
      </div>
      
      {currentGesture && (
        <div className="text-sm">
          <div className="flex items-center justify-between">
            <span className="capitalize">{currentGesture}</span>
            <span className="text-green-400">{Math.round(gestureConfidence * 100)}%</span>
          </div>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-300">
        âœ‹ Open Palm - Reset<br/>
        ðŸ‘Œ Pinch - Select<br/>
        ðŸ‘ Thumbs Up - Confirm
      </div>
    </div>
  );
}

export default function AdvancedARTryOn({
  selectedItems = [],
  onItemSelect,
  onClose,
  isVisible = true
}) {

  const [arMode, setArMode] = useState('camera'); // 'camera', 'webxr', '3d'
  const [isARActive, setIsARActive] = useState(false);
  const [handTrackingEnabled, setHandTrackingEnabled] = useState(false);
  const [gestureControlsEnabled, setGestureControlsEnabled] = useState(false);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [bodyPose, setBodyPose] = useState(null);
  const [arSettings, setArSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    transparency: 80,
    physics: true,
    handTracking: false,
    gestureControls: false
  });

  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef();

  const [handTracking] = useState(() => new HandTrackingManager());
  const [bodyDetection] = useState(() => new BodyDetectionEngine());
  const [physicsEngine] = useState(() => new GarmentPhysicsEngine());

  useEffect(() => {
    if (isVisible) {
      initializeAR();
    }
    
    return () => {
      cleanup();
    };
  }, [isVisible]);

  const initializeAR = async () => {
    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      await bodyDetection.initialize();
      
      if (arSettings.handTracking) {
        const handTrackingSupported = await handTracking.initialize();
        setHandTrackingEnabled(handTrackingSupported);
      }

      setIsARActive(true);
    } catch (error) {
      console.error('AR initialization failed:', error);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleGesture = useCallback((gesture) => {
    switch (gesture) {
      case 'pinch':

        console.log('Pinch gesture detected');
        break;
      case 'open_palm':

        console.log('Reset gesture detected');
        break;
      case 'thumbs_up':

        console.log('Confirm gesture detected');
        break;
      case 'grab':

        console.log('Grab gesture detected');
        break;
    }
  }, []);

  useEffect(() => {
    if (!isARActive || !videoRef.current) return;

    const detectPose = async () => {
      try {
        const detection = await bodyDetection.detectBody(videoRef.current);
        setBodyPose(detection);
      } catch (error) {
        console.error('Body detection error:', error);
      }
    };

    const interval = setInterval(detectPose, 100); // 10 FPS
    return () => clearInterval(interval);
  }, [isARActive, bodyDetection]);

  const switchARMode = (mode) => {
    setArMode(mode);
    if (mode === 'webxr') {
      startWebXRSession();
    }
  };

  const startWebXRSession = async () => {
    if (!navigator.xr) {
      alert('WebXR not supported');
      return;
    }

    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local'],
        optionalFeatures: ['hand-tracking', 'hit-test']
      });
      
      console.log('WebXR session started');

    } catch (error) {
      console.error('WebXR session failed:', error);
    }
  };

  const capturePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    selectedItems.forEach((item, index) => {
      ctx.globalAlpha = arSettings.transparency / 100;
      ctx.fillStyle = item.color || '#ff6b6b';

      if (bodyPose) {
        const { boundingBox } = bodyPose;
        ctx.fillRect(
          boundingBox.x,
          boundingBox.y + 50,
          boundingBox.width,
          boundingBox.height * 0.6
        );
      }
    });

    ctx.globalAlpha = 1;

    const link = document.createElement('a');
    link.download = `ar-tryon-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {}
      <div className="relative w-full h-full">
        {}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{
            filter: `brightness(${arSettings.brightness}%) contrast(${arSettings.contrast}%) saturate(${arSettings.saturation}%)`
          }}
        />

        {}
        <canvas ref={canvasRef} className="hidden" />

        {}
        {arMode === '3d' && (
          <div className="absolute inset-0 pointer-events-none">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 50 }}
              style={{ background: 'transparent' }}
            >
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              
              {selectedItems.map((item, index) => (
                <VirtualGarment
                  key={`${item.id}-${index}`}
                  item={item}
                  bodyPose={bodyPose}
                  physics={physicsEnabled ? physicsEngine : null}
                />
              ))}
              
              <OrbitControls enabled={false} />
            </Canvas>
          </div>
        )}

        {}
        {gestureControlsEnabled && (
          <GestureControls
            onGesture={handleGesture}
            handTracking={handTracking}
          />
        )}

        {}
        {bodyPose && (
          <div className="absolute inset-0 pointer-events-none">
            {Object.entries(bodyPose.pose).map(([joint, position]) => (
              <div
                key={joint}
                className="absolute w-2 h-2 bg-green-400 rounded-full"
                style={{
                  left: position.x - 4,
                  top: position.y - 4,
                  opacity: 0.7
                }}
              />
            ))}
          </div>
        )}

        {}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-4 bg-black/80 backdrop-blur-sm rounded-full px-6 py-3">
            <button
              onClick={capturePhoto}
              className="p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
            >
              <FaCamera className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setPhysicsEnabled(!physicsEnabled)}
              className={`p-3 rounded-full transition-colors ${
                physicsEnabled ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
              }`}
            >
              <FaAdjust className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => switchARMode(arMode === 'camera' ? '3d' : 'camera')}
              className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              <FaVrCardboard className="w-5 h-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {arMode.toUpperCase()} Mode Active
            </span>
          </div>
        </div>

        {}
        <div className="absolute top-4 right-4 space-y-2">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white max-w-xs">
            <h3 className="font-medium mb-3">AR Settings</h3>
            
            {Object.entries(arSettings).map(([key, value]) => {
              if (typeof value === 'boolean') {
                return (
                  <div key={key} className="flex items-center justify-between mb-2">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <button
                      onClick={() => setArSettings(prev => ({ ...prev, [key]: !value }))}
                      className={`w-8 h-4 rounded-full transition-colors ${
                        value ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                        value ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                );
              }
              
              return (
                <div key={key} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm capitalize">{key}</span>
                    <span className="text-sm">{value}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={value}
                    onChange={(e) => setArSettings(prev => ({ 
                      ...prev, 
                      [key]: parseInt(e.target.value) 
                    }))}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}