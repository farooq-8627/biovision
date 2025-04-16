'use client';

import { useEffect, useState, useRef } from 'react';
import { loadFaceAPI, detectEmotions } from '@/utils/faceApiUtils';

const EmotionDetector = ({ stream, onEmotionDetection }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef(null);
  const detectionInterval = useRef(null);
  
  // Load the face-api.js models
  useEffect(() => {
    const init = async () => {
      try {
        await loadFaceAPI();
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading face-api.js models:', error);
      }
    };
    
    init();
    
    return () => {
      clearInterval(detectionInterval.current);
    };
  }, []);
  
  // Setup the video element and start detection
  useEffect(() => {
    if (!isLoaded || !stream) return;
    
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    videoRef.current = video;
    
    video.addEventListener('loadeddata', startDetection);
    
    return () => {
      clearInterval(detectionInterval.current);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isLoaded, stream]);
  
  // Start emotion detection loop
  const startDetection = async () => {
    // First detection outside interval to avoid delay
    detectAndUpdateEmotion();
    
    // Setup interval for periodic detection (emotions don't change rapidly)
    detectionInterval.current = setInterval(detectAndUpdateEmotion, 2000);
  };
  
  // Detect emotions and update state
  const detectAndUpdateEmotion = async () => {
    if (!videoRef.current) return;
    
    try {
      const emotions = await detectEmotions(videoRef.current);
      
      if (emotions && emotions.length > 0) {
        // Get the dominant emotion
        const dominantEmotion = emotions[0];
        onEmotionDetection(dominantEmotion.emotion);
      } else {
        // No emotions detected
        onEmotionDetection(null);
      }
    } catch (error) {
      console.error('Error detecting emotions:', error);
    }
  };
  
  // This component doesn't render anything visible
  return null;
};

export default EmotionDetector;
