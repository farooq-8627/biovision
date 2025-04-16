'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import VideoOverlay from './VideoOverlay';
import EmotionDetector from './EmotionDetector';
import HeartRateMonitor from './HeartRateMonitor';
import { useWebRTC } from '@/context/WebRTCContext';

const PhoneRenderer = () => {
  const { remoteStream, localStream, isHost } = useWebRTC();
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [faceLandmarks, setFaceLandmarks] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [heartRate, setHeartRate] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // For monitoring fixation metrics
  const [fixationCount, setFixationCount] = useState(0);
  const [avgFixationDuration, setAvgFixationDuration] = useState(0);
  const [saccadeCount, setSaccadeCount] = useState(0);
  
  // Use the appropriate stream based on whether we're host or not
  useEffect(() => {
    if (isHost && localStream) {
      setStream(localStream);
    } else if (!isHost && remoteStream) {
      setStream(remoteStream);
    }
  }, [isHost, localStream, remoteStream]);

  // Set the stream on the video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Handle video load event
  const handleVideoLoad = () => {
    setIsVideoReady(true);
  };

  // Handle face landmarks update
  const handleFaceLandmarksUpdate = (landmarks) => {
    setFaceLandmarks(landmarks);
    
    // Update fixation metrics based on eye movement
    if (landmarks && landmarks.eyes) {
      // Count as a new fixation if the gaze position changes significantly
      const leftEye = landmarks.eyes.leftEye;
      const rightEye = landmarks.eyes.rightEye;
      
      if (leftEye && rightEye) {
        // This is a simplified approach - in a real implementation, we would use more advanced algorithms
        setFixationCount(prev => prev + 1);
        setAvgFixationDuration(prev => (prev + Math.random() * 0.3) / 2); // Simulated update
        setSaccadeCount(prev => prev + Math.floor(Math.random() * 2)); // Simulated update
      }
    }
  };
  
  // Handle emotion detection
  const handleEmotionDetection = (detectedEmotion) => {
    setEmotion(detectedEmotion);
  };
  
  // Handle heart rate update
  const handleHeartRateUpdate = (bpm) => {
    setHeartRate(bpm);
  };

  return (
    <motion.div 
      className="phone-mockup mx-auto"
      style={{ width: '280px', height: '560px' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="phone-screen">
        <div className="video-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={handleVideoLoad}
            className="w-full h-full object-cover"
          />
          
          {isVideoReady && stream && (
            <>
              <VideoOverlay 
                stream={stream} 
                onFaceLandmarksUpdate={handleFaceLandmarksUpdate} 
              />
              {faceLandmarks && (
                <EmotionDetector 
                  stream={stream} 
                  onEmotionDetection={handleEmotionDetection} 
                />
              )}
              {faceLandmarks && (
                <HeartRateMonitor 
                  stream={stream} 
                  onHeartRateUpdate={handleHeartRateUpdate} 
                />
              )}
            </>
          )}
          
          {/* Status indicators */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {faceLandmarks && (
              <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Face Detected
              </div>
            )}
            {emotion && (
              <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Emotion: {emotion}
              </div>
            )}
            {heartRate && (
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                ❤️ {heartRate} BPM
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PhoneRenderer;
