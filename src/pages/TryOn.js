import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import { clothingItems } from '../data/clothingItems';

const TryOn = () => {
  const [mode, setMode] = useState('upload'); // 'upload' or 'camera'
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [hasCameraAccess, setHasCameraAccess] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState({
    imageUpload: false,
    cameraCapture: false,
    cameraInitializing: false,
    download: false,
    itemLoading: false
  });
  const [error, setError] = useState(null);
  
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();
  
  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Initialize webcam when mode changes to 'camera' or facingMode changes
  useEffect(() => {
    let stream = null;
    
    const init = async () => {
      if (mode === 'camera') {
        await initializeCamera();
      } else if (webcamRef.current?.srcObject) {
        // Stop all tracks when switching away from camera mode
        stream = webcamRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        webcamRef.current.srcObject = null;
        setHasCameraAccess(false);
      }
    };
    
    init();
    
    // Cleanup function
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
      if (webcamRef.current?.srcObject) {
        const tracks = webcamRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        webcamRef.current.srcObject = null;
      }
    };
  }, [mode, facingMode]);
  
  // Initialize camera function
  const initializeCamera = async () => {
    try {
      setLoading(prev => ({ ...prev, cameraInitializing: true }));
      setCameraError(null);
      
      // Check if browser supports mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }
      
      // Stop any existing streams first
      if (webcamRef.current?.srcObject) {
        const stream = webcamRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        webcamRef.current.srcObject = null;
      }
      
      // Request camera permissions with specific constraints
      const constraints = {
        video: { 
          facingMode: { exact: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Check if webcamRef is available and component is still mounted
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        setHasCameraAccess(true);
        setCameraError(null);
      } else {
        // Clean up if component unmounted while initializing
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
      
    } catch (err) {
      console.error('Camera initialization error:', err);
      setCameraError(err.message || 'Could not access the camera. Please check your permissions and try again.');
      setHasCameraAccess(false);
      
      // If permission was denied, provide more specific guidance
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access was denied. Please allow camera permissions in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found. Please ensure a camera is connected and try again.');
      } else if (err.name === 'NotReadableError') {
        setCameraError('Camera is already in use by another application. Please close other applications using the camera.');
      }
    } finally {
      setLoading(prev => ({ ...prev, cameraInitializing: false }));
    }
  };
  
  // Toggle between front and back camera
  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };
  
  // Get item ID from URL if provided
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const itemId = searchParams.get('item');
    if (itemId) {
      const item = clothingItems.find(item => item.id === parseInt(itemId));
      if (item) {
        setSelectedItem(item);
      }
    }
  }, [location]);
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Please select a valid image file (JPEG, PNG, etc.)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    setLoading(prev => ({ ...prev, imageUpload: true }));
    setError(null);
    
    const reader = new FileReader();
    
    reader.onloadstart = () => {
      setLoading(prev => ({ ...prev, imageUpload: true }));
    };
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Validate image dimensions
        if (img.width < 300 || img.height < 400) {
          setError('Image should be at least 300x400 pixels for best results');
          setLoading(prev => ({ ...prev, imageUpload: false }));
          return;
        }
        setSelectedImage(event.target.result);
        setLoading(prev => ({ ...prev, imageUpload: false }));
      };
      img.onerror = () => {
        setError('Failed to load the image. Please try again.');
        setLoading(prev => ({ ...prev, imageUpload: false }));
      };
      img.src = event.target.result;
    };
    
    reader.onerror = () => {
      setError('Failed to read the file. Please try again.');
      setLoading(prev => ({ ...prev, imageUpload: false }));
    };
    
    reader.readAsDataURL(file);
  };
  
  const captureImage = async () => {
    try {
      if (!webcamRef.current) {
        throw new Error('Camera not initialized');
      }
      
      setLoading(prev => ({ ...prev, cameraCapture: true }));
      setError(null);
      
      // Get the screenshot from webcam
      const imageSrc = webcamRef.current.getScreenshot({
        width: 1280,
        height: 720
      });
      
      if (!imageSrc) {
        throw new Error('Failed to capture image from camera');
      }
      
      // Create a promise to handle the image loading
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          // Validate image dimensions
          if (img.width < 300 || img.height < 400) {
            reject(new Error('Captured image is too small. Please ensure good lighting and try again.'));
          } else {
            resolve(img);
          }
        };
        img.onerror = () => reject(new Error('Failed to process the captured image'));
        img.src = imageSrc;
      });
      
      // Set the captured image
      setSelectedImage(imageSrc);
      
      // Don't stop the camera here - let the user retake the photo if needed
      // The stream will be cleaned up when component unmounts or mode changes
      
      setSelectedImage(imageSrc);
      setMode('preview');
      
    } catch (err) {
      console.error('Capture error:', err);
      setError({ type: 'error', message: err.message || 'Failed to capture image. Please try again.' });
    } finally {
      setLoading(prev => ({ ...prev, cameraCapture: false }));
    }
  };
  
  const handleDragStart = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };
  
  const handleDrag = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  // Add wheel event listener with non-passive option
  useEffect(() => {
    const container = document.querySelector('.preview-container');
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 2));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Keep the handler for TypeScript/React type checking
  const handleWheel = (e) => {
    // This is a no-op since we're using the passive event listener
  };
  
  const rotateItem = (direction) => {
    setRotation(prev => (prev + (direction === 'left' ? -15 : 15)) % 360);
  };
  
  const resetImage = () => {
    setPosition({ x: 50, y: 50 });
    setScale(1);
    setRotation(0);
  };
  
  const downloadImage = async () => {
    if (!selectedImage || !selectedItem) {
      setError('Please select an image and a clothing item first');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, download: true }));
      setError(null);
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Load the base image
      const baseImage = new Image();
      baseImage.crossOrigin = 'anonymous';
      baseImage.src = selectedImage;
      
      // Wait for the base image to load
      await new Promise((resolve) => {
        baseImage.onload = resolve;
      });
      
      // Set canvas dimensions to match the base image
      canvas.width = baseImage.width;
      canvas.height = baseImage.height;
      
      // Draw the base image
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      
      // Load the overlay image (clothing item)
      const overlayImage = new Image();
      overlayImage.crossOrigin = 'anonymous';
      overlayImage.src = selectedItem.imageUrl;
      
      // Wait for the overlay image to load
      await new Promise((resolve) => {
        overlayImage.onload = resolve;
      });
      
      // Calculate position and size for the overlay
      const overlaySize = Math.min(canvas.width * 0.5, canvas.height * 0.7);
      const x = (position.x / 100) * (canvas.width - overlaySize);
      const y = (position.y / 100) * (canvas.height - overlaySize);
      
      // Save the current context state
      ctx.save();
      
      // Move to the center of the overlay image
      ctx.translate(x + overlaySize / 2, y + overlaySize / 2);
      
      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Apply scale
      const scaledSize = overlaySize * scale;
      
      // Draw the overlay image
      ctx.drawImage(
        overlayImage,
        -scaledSize / 2,
        -scaledSize / 2,
        scaledSize,
        scaledSize
      );
      
      // Restore the context state
      ctx.restore();
      
      // Convert canvas to data URL and create download link
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `outfit-${new Date().getTime()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success toast
      setError({ type: 'success', message: 'Image downloaded successfully!' });
      
    } catch (error) {
      console.error('Error generating image:', error);
      setError({ 
        type: 'error', 
        message: error.message || 'Failed to generate image. Please try again.' 
      });
    } finally {
      setLoading(prev => ({ ...prev, download: false }));
    }
  };
  
  // Error message component
  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    
    const isError = error.type !== 'success';
    const bgColor = isError ? 'bg-red-50' : 'bg-green-50';
    const textColor = isError ? 'text-red-700' : 'text-green-700';
    const borderColor = isError ? 'border-red-200' : 'border-green-200';
    
    return (
      <div className={`mb-6 p-4 rounded-lg border ${bgColor} ${borderColor} ${textColor}`}>
        <div className="flex items-center">
          {isError ? (
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          <span>{error.message || error}</span>
        </div>
      </div>
    );
  };

  // Loading spinner component
  const LoadingSpinner = ({ size = 'h-5 w-5' }) => (
    <div className={`animate-spin rounded-full ${size} border-b-2 border-primary`}></div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Virtual Try-On</h1>
      <ErrorMessage error={error} />
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side - Preview */}
        <div className="lg:w-2/3">
          <div 
            className="relative bg-gray-100 rounded-xl overflow-hidden mb-4 preview-container"
            style={{ height: '500px', touchAction: 'none' }}
            onMouseMove={handleDrag}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            {!selectedImage ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="text-5xl mb-4">👕</div>
                <h2 className="text-2xl font-semibold mb-2">
                  {mode === 'camera' ? 'Camera Mode' : 'No Image Selected'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {mode === 'upload' 
                    ? 'Upload your photo to get started.'
                    : 'Allow camera access and take a photo to get started.'}
                </p>
                <div className="flex gap-4">
                  <button 
                    className={`btn ${mode === 'upload' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setMode('upload')}
                  >
                    Upload Photo
                  </button>
                  <button 
                    className={`btn ${mode === 'camera' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => {
                      setMode('camera');
                      setCameraError(null);
                      setHasCameraAccess(false);
                    }}
                  >
                    Use Camera
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                {mode === 'camera' && !selectedImage ? (
                  <div className="relative w-full h-full">
                    {hasCameraAccess ? (
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                          facingMode: facingMode,
                          width: { ideal: 1280 },
                          height: { ideal: 720 }
                        }}
                        className="w-full h-full object-cover"
                        onUserMedia={() => setHasCameraAccess(true)}
                        onUserMediaError={(err) => {
                          console.error('Webcam error:', err);
                          setHasCameraAccess(false);
                          setCameraError('Failed to access camera. Please check your camera permissions.');
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-4">
                        {loading.cameraInitializing ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                            <p>Initializing camera...</p>
                          </div>
                        ) : cameraError ? (
                          <div className="text-center">
                            <div className="text-red-400 mb-4">
                              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <p className="text-red-400 mb-4">{cameraError}</p>
                            <button
                              onClick={initializeCamera}
                              className="btn btn-outline text-white border-white hover:bg-white hover:bg-opacity-10"
                            >
                              Retry Camera Access
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={initializeCamera}
                            className="btn btn-primary"
                          >
                            Allow Camera Access
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ) : selectedImage ? (
                  <>
                    <img 
                      src={selectedImage} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                    
                    {selectedItem && (
                      <div 
                        className="absolute cursor-move"
                        style={{
                          left: `${position.x}px`,
                          top: `${position.y}px`,
                          transform: `scale(${scale}) rotate(${rotation}deg)`,
                          transformOrigin: 'center',
                          touchAction: 'none',
                        }}
                        onMouseDown={handleDragStart}
                      >
                        <img 
                          src={selectedItem.imageUrl} 
                          alt={selectedItem.name}
                          className="max-h-64 max-w-full object-contain"
                          draggable="false"
                        />
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </div>
          
          {selectedImage && (
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <button 
                className="btn btn-outline"
                onClick={() => setSelectedImage(null)}
              >
                Change Image
              </button>
              
              {selectedItem && (
                <>
                  <button 
                    className="btn btn-outline"
                    onClick={() => rotateItem('left')}
                  >
                    ↺ Rotate Left
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => rotateItem('right')}
                  >
                    Rotate Right ↻
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={resetImage}
                  >
                    Reset
                  </button>
                  <button 
                    className={`btn btn-primary flex items-center justify-center min-w-[120px] ${
                      loading.download ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    onClick={downloadImage}
                    disabled={loading.download}
                  >
                    {loading.download ? (
                      <>
                        <LoadingSpinner size="h-4 w-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Look'
                    )}
                  </button>
                </>
              )}
            </div>
          )}
          
          {mode === 'upload' && !selectedImage && (
            <div className="text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                className={`btn btn-primary flex items-center justify-center min-w-[120px] ${
                  loading.imageUpload ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                onClick={() => !loading.imageUpload && fileInputRef.current.click()}
                disabled={loading.imageUpload}
              >
                {loading.imageUpload ? (
                  <>
                    <LoadingSpinner size="h-4 w-4 mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Upload Photo'
                )}
              </button>
            </div>
          )}
          
          {mode === 'camera' && !selectedImage && (
            <div className="relative">
              <div className="relative bg-black rounded-xl overflow-hidden mb-4" style={{ height: '500px' }}>
                {hasCameraAccess ? (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 1280,
                      height: 720,
                      facingMode: facingMode
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-900 text-white">
                    {cameraError ? (
                      <div className="text-center p-4">
                        <div className="text-red-400 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <p className="text-red-400 mb-4">{cameraError}</p>
                        <button 
                          onClick={initializeCamera}
                          className="btn btn-outline text-white border-white hover:bg-white hover:bg-opacity-10"
                        >
                          Retry Camera Access
                        </button>
                      </div>
                    ) : (
                      <div className="animate-pulse">
                        <LoadingSpinner size="h-12 w-12 text-white" />
                        <p className="mt-2">Initializing camera...</p>
                      </div>
                    )}
                  </div>
                )}
                
                {hasCameraAccess && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                    <button
                      onClick={toggleCamera}
                      className="p-3 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-all"
                      title="Switch camera"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={captureImage}
                      className={`p-3 rounded-full ${
                        loading.cameraCapture 
                          ? 'bg-red-500 opacity-75' 
                          : 'bg-red-600 hover:bg-red-700'
                      } text-white transition-all`}
                      disabled={loading.cameraCapture}
                      title="Take photo"
                    >
                      {loading.cameraCapture ? (
                        <LoadingSpinner size="h-6 w-6" />
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setMode('upload')}
                  className="text-primary hover:underline text-sm"
                >
                  ← Back to upload
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Right side - Clothing items */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedItem ? 'Selected Item' : 'Choose an Item'}
            </h2>
            
            {selectedItem ? (
              <div className="mb-6">
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={selectedItem.imageUrl} 
                    alt={selectedItem.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-medium">{selectedItem.name}</h3>
                    <p className="text-gray-600 text-sm capitalize">{selectedItem.category}</p>
                    <p className="text-primary font-semibold">${selectedItem.price}</p>
                  </div>
                </div>
                <button 
                  className="btn btn-outline w-full"
                  onClick={() => setSelectedItem(null)}
                >
                  Change Item
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-gray-600 mb-4">Select an item to try on:</p>
                <div className="grid grid-cols-2 gap-3">
                  {clothingItems.slice(0, 6).map(item => (
                    <button
                      key={item.id}
                      className="border rounded-lg p-2 hover:border-primary transition-colors"
                      onClick={() => setSelectedItem(item)}
                    >
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">${item.price}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link to="/catalog" className="text-primary hover:underline">
                    Browse all items →
                  </Link>
                </div>
              </div>
            )}
            
            {selectedItem && selectedImage && (
              <div className="space-y-3">
                <h3 className="font-medium">Adjust Position</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Size</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Smaller</span>
                      <span>Larger</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Rotation</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="15"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0°</span>
                      <span>360°</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Tips for Best Results</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Use a well-lit environment</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Stand against a plain background if possible</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Position your full body in the frame</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Adjust the position and size of the clothing item for the best fit</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryOn;
