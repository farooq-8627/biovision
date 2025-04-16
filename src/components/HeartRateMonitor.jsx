'use client';

import { useEffect, useRef, useState } from 'react';
import { calculateHeartRate } from '@/utils/heartRateUtils';

const HeartRateMonitor = ({ stream, onHeartRateUpdate }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [bufferFull, setBufferFull] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // RGB values for each frame
  const frameBuffer = useRef([]);
  const bufferSize = 30; // Buffer 30 frames before calculating heart rate
  
  // Setup video element and canvas for processing
  useEffect(() => {
    if (!stream) return;
    
    // Create video element
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    videoRef.current = video;
    
    // Create canvas for processing
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    
    // Start processing when video is ready
    video.addEventListener('loadeddata', startProcessing);
    
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);
  
  // Start frame processing
  const startProcessing = () => {
    // Reset the buffer
    frameBuffer.current = [];
    setBufferFull(false);
    
    // Start processing frames
    processVideoFrame();
  };
  
  // Process video frames and calculate heart rate
  const processVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame onto the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Extract the average RGB values from the face region
    const faceRegion = ctx.getImageData(
      canvas.width * 0.3, // Start at 30% from left
      canvas.height * 0.2, // Start at 20% from top
      canvas.width * 0.4, // Width is 40% of canvas
      canvas.height * 0.3 // Height is 30% of canvas
    );
    
    // Calculate average RGB values
    let r = 0, g = 0, b = 0;
    const pixelCount = faceRegion.data.length / 4;
    
    for (let i = 0; i < faceRegion.data.length; i += 4) {
      r += faceRegion.data[i];
      g += faceRegion.data[i + 1];
      b += faceRegion.data[i + 2];
    }
    
    r = r / pixelCount;
    g = g / pixelCount;
    b = b / pixelCount;
    
    // Add to buffer
    frameBuffer.current.push({ r, g, b });
    
    // If buffer is full, calculate heart rate
    if (frameBuffer.current.length >= bufferSize && !isProcessing) {
      setBufferFull(true);
      calculateHeartRateFromBuffer();
    }
    
    // Request next frame
    requestAnimationFrame(processVideoFrame);
  };
  
  // Calculate heart rate from the buffer
  const calculateHeartRateFromBuffer = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Calculate heart rate from buffer
      const bpm = await calculateHeartRate(frameBuffer.current);
      
      // Update parent component with the new heart rate
      onHeartRateUpdate(bpm);
      
      // Clear half of the buffer to make room for new frames
      frameBuffer.current = frameBuffer.current.slice(Math.floor(bufferSize / 2));
    } catch (error) {
      console.error('Error calculating heart rate:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // This component doesn't render anything visible
  return null;
};

export default HeartRateMonitor;
