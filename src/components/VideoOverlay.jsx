'use client';

import { useRef, useEffect, useState } from 'react';
import { loadFaceMesh, detectFaceLandmarks } from '@/utils/mediapipeUtils';

const VideoOverlay = ({ stream, onFaceLandmarksUpdate }) => {
  const canvasRef = useRef(null);
  const [faceMesh, setFaceMesh] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load the MediaPipe FaceMesh model
  useEffect(() => {
    const initializeFaceMesh = async () => {
      try {
        setIsLoading(true);
        const mesh = await loadFaceMesh();
        setFaceMesh(mesh);
      } catch (error) {
        console.error('Error loading face mesh:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeFaceMesh();
    
    return () => {
      // Clean up if needed
      if (faceMesh) {
        faceMesh.close();
      }
    };
  }, []);
  
  // Process video frames for face detection
  useEffect(() => {
    if (!stream || !faceMesh || !canvasRef.current) return;
    
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Size the canvas to match the video dimensions
    const resizeCanvas = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };
    
    // Process frames for detection
    let animationFrameId;
    let lastProcessedTime = 0;
    const processFrame = async (timestamp) => {
      // Process frames at a reasonable rate (e.g., every 50-100ms)
      if (timestamp - lastProcessedTime > 100) {
        try {
          // Ensure canvas is properly sized
          if (video.videoWidth && video.videoHeight && 
              (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
            resizeCanvas();
          }
          
          // Clear the canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw the video frame (commented out as we only want to draw landmarks)
          // ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Detect face landmarks
          const landmarks = await detectFaceLandmarks(faceMesh, video);
          
          if (landmarks) {
            // Draw landmarks
            drawFaceLandmarks(ctx, landmarks);
            
            // Send landmarks data to parent component
            onFaceLandmarksUpdate(landmarks);
          }
          
          lastProcessedTime = timestamp;
        } catch (error) {
          console.error('Error processing video frame:', error);
        }
      }
      
      animationFrameId = requestAnimationFrame(processFrame);
    };
    
    video.addEventListener('loadedmetadata', resizeCanvas);
    video.addEventListener('loadeddata', () => {
      animationFrameId = requestAnimationFrame(processFrame);
    });
    
    return () => {
      video.srcObject = null;
      cancelAnimationFrame(animationFrameId);
    };
  }, [stream, faceMesh, onFaceLandmarksUpdate]);
  
  // Function to draw face landmarks on canvas
  const drawFaceLandmarks = (ctx, landmarks) => {
    const { faceMesh, eyes } = landmarks;
    
    // Draw face mesh points
    if (faceMesh && faceMesh.length > 0) {
      ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
      
      // Draw only key points for better performance
      for (let i = 0; i < faceMesh.length; i += 5) {
        const point = faceMesh[i];
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    
    // Draw eye landmarks with more emphasis
    if (eyes) {
      // Left eye
      if (eyes.leftEye && eyes.leftEye.length > 0) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 1)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        // Connect the eye landmarks to form a shape
        const leftEye = eyes.leftEye;
        ctx.moveTo(leftEye[0].x, leftEye[0].y);
        for (let i = 1; i < leftEye.length; i++) {
          ctx.lineTo(leftEye[i].x, leftEye[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        
        // Draw pupil if available
        if (eyes.leftPupil) {
          ctx.fillStyle = 'rgba(255, 0, 0, 1)';
          ctx.beginPath();
          ctx.arc(eyes.leftPupil.x, eyes.leftPupil.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      
      // Right eye
      if (eyes.rightEye && eyes.rightEye.length > 0) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 1)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        // Connect the eye landmarks to form a shape
        const rightEye = eyes.rightEye;
        ctx.moveTo(rightEye[0].x, rightEye[0].y);
        for (let i = 1; i < rightEye.length; i++) {
          ctx.lineTo(rightEye[i].x, rightEye[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        
        // Draw pupil if available
        if (eyes.rightPupil) {
          ctx.fillStyle = 'rgba(255, 0, 0, 1)';
          ctx.beginPath();
          ctx.arc(eyes.rightPupil.x, eyes.rightPupil.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      
      // Draw gaze direction if available
      if (eyes.gazeDirection) {
        const { x, y, z } = eyes.gazeDirection;
        
        // Draw from center of each eye
        if (eyes.leftPupil && eyes.rightPupil) {
          ctx.strokeStyle = 'yellow';
          ctx.lineWidth = 2;
          
          // Left eye gaze
          ctx.beginPath();
          ctx.moveTo(eyes.leftPupil.x, eyes.leftPupil.y);
          ctx.lineTo(
            eyes.leftPupil.x + x * 50,
            eyes.leftPupil.y + y * 50
          );
          ctx.stroke();
          
          // Right eye gaze
          ctx.beginPath();
          ctx.moveTo(eyes.rightPupil.x, eyes.rightPupil.y);
          ctx.lineTo(
            eyes.rightPupil.x + x * 50,
            eyes.rightPupil.y + y * 50
          );
          ctx.stroke();
        }
      }
    }
  };
  
  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">Loading Face Tracking...</div>
        </div>
      )}
    </>
  );
};

export default VideoOverlay;
