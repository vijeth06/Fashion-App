import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUpload, FaCamera, FaSpinner, FaCheckCircle, FaTimesCircle, FaImage } from 'react-icons/fa';
import axios from 'axios';

const PhotoTryOnUpload = ({ selectedProduct, onResultReady }) => {
  const [bodyImage, setBodyImage] = useState(null);
  const [bodyImagePreview, setBodyImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Handle file selection
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setBodyImage(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setBodyImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle camera capture
  const handleCameraCapture = useCallback((e) => {
    handleFileSelect(e);
  }, [handleFileSelect]);

  // Upload and process image
  const handleSubmit = async () => {
    if (!bodyImage || !selectedProduct) {
      setError('Please select a body image and a product');
      return;
    }

    setIsUploading(true);
    setIsProcessing(false);
    setError(null);
    setUploadProgress(0);

    try {
      // Step 1: Create session
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);

      // Step 2: Upload body image
      const formData = new FormData();
      formData.append('bodyImage', bodyImage);
      formData.append('sessionId', newSessionId);
      formData.append('garmentId', selectedProduct.id);

      const uploadResponse = await axios.post(
        '/api/try-on/upload-body',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      if (!uploadResponse.data.success) {
        throw new Error(uploadResponse.data.error || 'Upload failed');
      }

      setIsUploading(false);
      setIsProcessing(true);

      // Step 3: Start inference processing
      const inferFormData = new FormData();
      inferFormData.append('bodyImage', bodyImage);
      
      // If product has image URL, fetch and add it
      if (selectedProduct.image) {
        try {
          const garmentBlob = await fetch(selectedProduct.image).then(r => r.blob());
          inferFormData.append('garmentImage', garmentBlob, 'garment.png');
        } catch (err) {
          console.warn('Could not fetch garment image:', err);
        }
      }

      const inferResponse = await axios.post(
        '/api/try-on/infer',
        inferFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (!inferResponse.data.success) {
        throw new Error(inferResponse.data.error || 'Processing failed');
      }

      // Step 4: Poll for results
      const jobId = inferResponse.data.data?.job_id;
      if (jobId) {
        startPollingJobStatus(jobId, newSessionId);
      } else {
        // Direct result (no job queue)
        handleProcessingComplete(inferResponse.data);
      }

    } catch (err) {
      console.error('Upload/processing error:', err);
      setError(err.response?.data?.error || err.message || 'An error occurred');
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  // Poll job status
  const startPollingJobStatus = (jobId, sesId) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes with 2s interval

    pollIntervalRef.current = setInterval(async () => {
      attempts++;

      try {
        const response = await axios.get(`/api/try-on/session/${sesId}/status`);
        const status = response.data.status;

        setJobStatus({
          status,
          progress: response.data.progress || 0
        });

        if (status === 'completed') {
          clearInterval(pollIntervalRef.current);
          handleProcessingComplete(response.data);
        } else if (status === 'failed') {
          clearInterval(pollIntervalRef.current);
          setError(response.data.error || 'Processing failed');
          setIsProcessing(false);
        } else if (attempts >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          setError('Processing timeout');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Status polling error:', err);
        if (attempts >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          setError('Could not check processing status');
          setIsProcessing(false);
        }
      }
    }, 2000);
  };

  // Handle processing completion
  const handleProcessingComplete = (resultData) => {
    setIsProcessing(false);
    setJobStatus({ status: 'completed', progress: 100 });
    
    if (onResultReady) {
      onResultReady({
        sessionId,
        result: resultData.result || resultData,
        product: selectedProduct
      });
    }
  };

  // Clear selection
  const handleClear = () => {
    setBodyImage(null);
    setBodyImagePreview(null);
    setError(null);
    setUploadProgress(0);
    setJobStatus(null);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
          <FaImage className="mr-3" />
          High-Quality Photo Try-On
        </h2>
        <p className="text-gray-400">
          Upload your photo for AI-powered virtual try-on with professional results
        </p>
      </div>

      {/* Upload Area */}
      <AnimatePresence mode="wait">
        {!bodyImagePreview ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-2 border-dashed border-blue-400/50 rounded-2xl p-12 text-center hover:border-blue-400 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleCameraCapture}
              className="hidden"
            />

            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center">
                <FaUpload className="text-4xl text-blue-400" />
              </div>

              <h3 className="text-xl font-semibold text-white">
                Upload Your Photo
              </h3>

              <p className="text-gray-400 max-w-md">
                Click below to upload a full-body photo or take a new one with your camera
              </p>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <FaUpload /> Choose File
                </button>

                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <FaCamera /> Take Photo
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Supported formats: JPG, PNG, WEBP • Max size: 10MB
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="space-y-6"
          >
            {/* Image Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-black/30">
              <img
                src={bodyImagePreview}
                alt="Upload preview"
                className="w-full h-auto max-h-96 object-contain"
              />
              
              {!isProcessing && !jobStatus && (
                <button
                  onClick={handleClear}
                  className="absolute top-4 right-4 p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-colors"
                >
                  <FaTimesCircle />
                </button>
              )}
            </div>

            {/* Processing Status */}
            {(isUploading || isProcessing) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 rounded-xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <FaSpinner className="text-2xl text-blue-400 animate-spin" />
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">
                      {isUploading ? 'Uploading...' : 'Processing Try-On...'}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {isUploading 
                        ? `Upload progress: ${uploadProgress}%`
                        : `AI is generating your virtual try-on (${jobStatus?.progress || 0}%)`
                      }
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: isUploading 
                        ? `${uploadProgress}%` 
                        : `${jobStatus?.progress || 0}%` 
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  />
                </div>
              </motion.div>
            )}

            {/* Success/Error Messages */}
            {jobStatus?.status === 'completed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3"
              >
                <FaCheckCircle className="text-2xl text-green-400" />
                <div>
                  <h4 className="text-white font-semibold">Processing Complete!</h4>
                  <p className="text-gray-300 text-sm">Your virtual try-on is ready</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3"
              >
                <FaTimesCircle className="text-2xl text-red-400" />
                <div>
                  <h4 className="text-white font-semibold">Error</h4>
                  <p className="text-gray-300 text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            {!isUploading && !isProcessing && jobStatus?.status !== 'completed' && (
              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedProduct}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <FaCheckCircle /> Generate Try-On
                </button>

                <button
                  onClick={handleClear}
                  className="px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
                >
                  Clear
                </button>
              </div>
            )}

            {!selectedProduct && (
              <p className="text-yellow-400 text-sm text-center">
                ⚠️ Please select a product from the catalog first
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoTryOnUpload;
