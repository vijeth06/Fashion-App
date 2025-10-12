import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import html2canvas from 'html2canvas';
import { useOutfit } from '../context/OutfitContext';
import { useAuth } from '../context/AuthContext';
import { ITEMS } from '../data/items';
import { QuickShareButton } from '../components/SocialSharing';
import ARTryOn from '../components/ARTryOn';
import QuantumTryOn from '../components/QuantumTryOn';
import { clothingItems } from '../data/clothingItems';
import { advancedFashionItems } from '../data/advancedProducts';
import { FaAtom, FaRocket, FaCamera, FaUpload, FaMagic, FaCog, FaEye, FaRobot } from 'react-icons/fa';

// Represents a single overlay layer with its own transform
function createLayer(item) {
  return {
    id: Date.now() + Math.random(),
    item,
    scale: 1,
    rotation: 0,
    offset: { x: 0, y: 0 },
  };
}

export default function TryOn() {
  const { user } = useAuth();
  const { uploadedImage, setUploadedImage, addFavorite, addLook } = useOutfit();

  // Mode Selection
  const [tryOnMode, setTryOnMode] = useState('quantum'); // 'quantum', 'classic', 'ar'
  const [selectedItem, setSelectedItem] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Camera state
  const [useCamera, setUseCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [mirrored, setMirrored] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [showARMode, setShowARMode] = useState(false);
  const webcamRef = useRef(null);

  // Layers state (mix & match)
  const [layers, setLayers] = useState([]); // array of {id, item, scale, rotation, offset}
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [currentLookData, setCurrentLookData] = useState(null);

  // Drag state
  const stageRef = useRef(null);
  const draggingRef = useRef({ active: false, layerId: null, last: { x: 0, y: 0 } });

  const setActiveLayer = (id) => setActiveLayerId(id);
  const activeLayer = layers.find(l => l.id === activeLayerId) || null;

  // Upload handler
  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedImage(ev.target.result);
    reader.readAsDataURL(file);
    setUseCamera(false);
    setCameraError('');
  };

  // Download composite using html2canvas
  const onDownload = async (saveOnly = false) => {
    if (!stageRef.current) return;
    const canvas = await html2canvas(stageRef.current, { backgroundColor: null, useCORS: true });
    const url = canvas.toDataURL('image/png');
    
    // Update current look data for sharing
    setCurrentLookData({
      id: Date.now(),
      imageDataUrl: url,
      items: layers.map(l => l.item),
      timestamp: new Date().toISOString()
    });
    
    if (saveOnly) {
      addLook(url);
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vf-tryon.png';
    a.click();
  };

  // Share using Web Share API if available
  const onShare = async () => {
    if (!stageRef.current) return;
    const canvas = await html2canvas(stageRef.current, { backgroundColor: null, useCORS: true });
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    if (!blob) return onDownload(false);
    const file = new File([blob], 'vf-tryon.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'My Try-On Look' }); } catch {}
    } else {
      onDownload(false);
    }
  };

  // Stage drag handlers
  const onLayerMouseDown = (layerId) => (e) => {
    setActiveLayer(layerId);
    draggingRef.current = { active: true, layerId, last: { x: e.clientX, y: e.clientY } };
  };
  const onStageMouseMove = (e) => {
    const d = draggingRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.last.x;
    const dy = e.clientY - d.last.y;
    d.last = { x: e.clientX, y: e.clientY };
    setLayers((prev) => prev.map((l) => (l.id === d.layerId ? { ...l, offset: { x: l.offset.x + dx, y: l.offset.y + dy } } : l)));
  };
  const endDrag = () => { draggingRef.current = { active: false, layerId: null, last: { x: 0, y: 0 } }; };

  // Keyboard controls for active layer
  useEffect(() => {
    const onKey = (e) => {
      if (!activeLayer) return;
      const step = e.shiftKey ? 10 : 2;
      if (e.key === 'ArrowUp') setLayers((p) => p.map(l => l.id === activeLayer.id ? { ...l, offset: { ...l.offset, y: l.offset.y - step } } : l));
      if (e.key === 'ArrowDown') setLayers((p) => p.map(l => l.id === activeLayer.id ? { ...l, offset: { ...l.offset, y: l.offset.y + step } } : l));
      if (e.key === 'ArrowLeft') setLayers((p) => p.map(l => l.id === activeLayer.id ? { ...l, offset: { ...l.offset, x: l.offset.x - step } } : l));
      if (e.key === 'ArrowRight') setLayers((p) => p.map(l => l.id === activeLayer.id ? { ...l, offset: { ...l.offset, x: l.offset.x + step } } : l));
      if (e.key === '+' || e.key === '=') setLayers((p) => p.map(l => l.id === activeLayer.id ? { ...l, scale: Math.min(2, l.scale + 0.02) } : l));
      if (e.key === '-' || e.key === '_') setLayers((p) => p.map(l => l.id === activeLayer.id ? { ...l, scale: Math.max(0.5, l.scale - 0.02) } : l));
      if (e.key === 'r') setLayers((p) => p.map(l => l.id === activeLayer.id ? { ...l, rotation: Math.min(30, l.rotation + 1) } : l));
      if (e.key === 'R') setLayers((p) => p.map(l => l.id === activeLayer.id ? { ...l, rotation: Math.max(-30, l.rotation - 1) } : l));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeLayer]);

  const resetActive = () => {
    if (!activeLayer) return;
    setLayers((p) => p.map(l => l.id === activeLayer.id ? { ...l, scale: 1, rotation: 0, offset: { x: 0, y: 0 } } : l));
  };

  // Camera controls
  const videoConstraints = { facingMode };
  const startCamera = () => { setUseCamera(true); setCameraError(''); setCameraReady(false); };
  const stopCamera = () => { setUseCamera(false); };
  const flipCamera = () => setFacingMode((m) => (m === 'user' ? 'environment' : 'user'));
  const capturePhoto = () => {
    if (!webcamRef.current) return;
    const shot = webcamRef.current.getScreenshot();
    if (shot) { setUploadedImage(shot); setUseCamera(false); }
  };

  // Layer operations
  const addLayerFromItem = (item) => {
    const newLayer = createLayer(item);
    setLayers((p) => [...p, newLayer]);
    setActiveLayer(newLayer.id);
  };
  const removeLayer = (id) => {
    setLayers((p) => p.filter(l => l.id !== id));
    if (activeLayerId === id) setActiveLayerId(null);
  };
  const moveLayer = (id, dir) => {
    setLayers((p) => {
      const idx = p.findIndex(l => l.id === id);
      if (idx < 0) return p;
      const arr = [...p];
      const swapWith = dir === 'up' ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= arr.length) return p;
      [arr[idx], arr[swapWith]] = [arr[swapWith], arr[idx]];
      return arr;
    });
  };

  // Initialize user profile
  useEffect(() => {
    if (user) {
      setUserProfile({
        biometrics: {
          height: 175,
          weight: 65,
          measurements: {
            chest: 95,
            waist: 78,
            hips: 98
          }
        },
        styleDNA: {
          minimalist: 0.7,
          edgy: 0.3,
          classic: 0.8
        }
      });
    }
  }, [user]);

  // Render classic interface
  const renderClassicInterface = () => {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="grid layout" style={{ gridTemplateColumns: '360px 1fr', gap: 16 }}>
          {/* Controls */}
          <aside className="side-panel card p-4">
            <div style={{ marginBottom: 12 }}>
              <label className="label">Upload Photo</label>
              <input type="file" accept="image/*" className="field" onChange={onUpload} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="label">Webcam</label>
              <div className="toolbar" style={{ gap: 8, display: 'flex', flexWrap: 'wrap' }}>
                {!useCamera ? (
                  <button onClick={startCamera} className="btn btn-secondary">Start Camera</button>
                ) : (
                  <button onClick={stopCamera} className="btn btn-secondary">Stop Camera</button>
                )}
                <button onClick={flipCamera} disabled={!useCamera} className="btn btn-secondary">Flip</button>
                <button onClick={() => setMirrored((m) => !m)} disabled={!useCamera} className="btn btn-secondary">{mirrored ? 'Unmirror' : 'Mirror'}</button>
                <button onClick={capturePhoto} disabled={!useCamera || !cameraReady} className="btn btn-primary">Capture</button>
              </div>
              {cameraError && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mt-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-400 font-medium">{cameraError}</span>
                  </div>
                </motion.div>
              )}
              {useCamera && !cameraReady && !cameraError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mt-3"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className="w-3 h-3 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    ></motion.div>
                    <span className="text-blue-400 font-medium">Initializing camera...</span>
                  </div>
                  <div className="mt-2 bg-blue-500/20 rounded-full h-1 overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500 rounded-full"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    ></motion.div>
                  </div>
                </motion.div>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="label">Add Items (Mix & Match)</label>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {ITEMS.map((it) => (
                  <button key={it.id} onClick={() => addLayerFromItem(it)} className="chip" title={it.name}>
                    <img src={it.imageUrl} alt={it.name} style={{ width: '100%', height: 64, objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="label">Layers</label>
              {layers.length === 0 ? (
                <div className="tip">No layers yet. Add items above.</div>
              ) : (
                <div className="grid" style={{ gap: 8 }}>
                  {layers.map((l, idx) => (
                    <div key={l.id} className={`row space-between card ${activeLayerId === l.id ? 'ring-2 ring-cyan-400/50' : ''}`} style={{ padding: 8, alignItems: 'center' }}>
                      <button className="chip" onClick={() => setActiveLayer(l.id)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={l.item.imageUrl} alt={l.item.name} style={{ width: 40, height: 40, objectFit: 'contain' }} />
                        <span>{l.item.name}</span>
                      </button>
                      <div className="row" style={{ gap: 4 }}>
                        <button className="btn btn-secondary" onClick={() => moveLayer(l.id, 'up')} disabled={idx === 0}>↑</button>
                        <button className="btn btn-secondary" onClick={() => moveLayer(l.id, 'down')} disabled={idx === layers.length - 1}>↓</button>
                        <button className="btn btn-secondary" onClick={() => removeLayer(l.id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="toolbar" style={{ gap: 8, display: 'flex', flexWrap: 'wrap' }}>
              <button onClick={() => onDownload(false)} className="btn btn-primary">Download Look</button>
              <button onClick={onShare} className="btn btn-secondary">Share</button>
            </div>
          </aside>

          {/* Stage */}
          <section>
            <div
              ref={stageRef}
              className="stage card"
              onMouseMove={onStageMouseMove}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
            >
              {/* Base image from upload or camera */}
              {useCamera ? (
                cameraReady ? (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    mirrored={mirrored}
                    onUserMedia={() => { setCameraReady(true); setCameraError(''); }}
                    onUserMediaError={(err) => {
                      console.error(err);
                      setCameraError('Unable to access camera. Check permissions or device settings.');
                      setUseCamera(false);
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full mb-6"
                    ></motion.div>
                    <motion.h3 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-2xl font-bold text-white mb-2"
                    >
                      Initializing camera...
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-400 text-center max-w-sm"
                    >
                      Please allow camera access when prompted
                    </motion.p>
                    <motion.div 
                      className="mt-6 flex space-x-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-cyan-400 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        ></motion.div>
                      ))}
                    </motion.div>
                  </div>
                )
              ) : uploadedImage ? (
                <img src={uploadedImage} alt="uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="stage-empty center text-gray-400">Upload a photo or start the webcam</div>
              )}

              {/* Overlay layers (render in order) */}
              {layers.map((l) => (
                <img
                  key={l.id}
                  src={l.item.imageUrl}
                  alt={l.item.name}
                  onMouseDown={onLayerMouseDown(l.id)}
                  className={`overlay-img ${activeLayerId === l.id ? 'active' : ''}`}
                  style={{ transform: `translate(-50%, -50%) translate(${l.offset.x}px, ${l.offset.y}px) scale(${l.scale}) rotate(${l.rotation}deg)` }}
                />
              ))}
            </div>
          </section>
        </div>

        {/* AR Try-On Modal */}
        {showARMode && (
          <ARTryOn 
            isOpen={showARMode}
            onClose={() => setShowARMode(false)}
            availableItems={clothingItems}
            currentLayers={layers}
            onLayersChange={setLayers}
          />
        )}
      </div>
    );
  };

  // Render the appropriate try-on interface
  const renderTryOnInterface = () => {
    switch (tryOnMode) {
      case 'quantum':
        return (
          <QuantumTryOn 
            selectedItem={selectedItem} 
            userProfile={userProfile}
            onItemSelect={setSelectedItem}
          />
        );
      case 'ar':
        return (
          <ARTryOn 
            isVisible={true}
            onClose={() => setTryOnMode('quantum')}
          />
        );
      default:
        return renderClassicInterface();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20">
      {/* Revolutionary Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-6 py-8"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-4">
              QUANTUM
              <span className="block text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text">
                TRY-ON.LAB
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Experience revolutionary virtual fitting with quantum fabric simulation and neural pose estimation
            </p>
          </div>
          
          {/* Mode Selector */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/40 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-4 mt-6 lg:mt-0"
          >
            <div className="flex flex-col space-y-3">
              {[
                { id: 'quantum', label: 'QUANTUM MODE', icon: FaAtom, color: 'cyan' },
                { id: 'ar', label: 'AR MODE', icon: FaRocket, color: 'purple' },
                { id: 'classic', label: 'CLASSIC MODE', icon: FaCamera, color: 'gray' }
              ].map(mode => {
                const Icon = mode.icon;
                const isActive = tryOnMode === mode.id;
                return (
                  <motion.button
                    key={mode.id}
                    onClick={() => setTryOnMode(mode.id)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-mono text-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-cyan-500 text-black'
                        : 'text-cyan-400 hover:bg-cyan-500/20'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon />
                    <span>{mode.label}</span>
                    {isActive && (
                      <motion.div
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Item Selection for Quantum Mode */}
        {tryOnMode === 'quantum' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-bold text-cyan-400 mb-4 font-mono flex items-center">
              <FaMagic className="mr-2" />
              SELECT QUANTUM GARMENT
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {advancedFashionItems.slice(0, 6).map(item => (
                <motion.div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`relative bg-black/40 backdrop-blur-xl border rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                    selectedItem?.id === item.id
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-gray-600/30 hover:border-cyan-400/50'
                  }`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl mb-3 flex items-center justify-center">
                    <span className="text-2xl">👔</span>
                  </div>
                  <h4 className="text-white font-mono text-xs mb-1 truncate">{item.name}</h4>
                  <p className="text-gray-400 text-xs">{item.category}</p>
                  
                  {/* Quantum Properties Indicator */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {item.fabricPhysics?.quantumProperties?.colorShifting && (
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    )}
                    {item.fabricPhysics?.quantumProperties?.temperatureAdaptive && (
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Try-On Interface */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tryOnMode}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          {renderTryOnInterface()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

}
