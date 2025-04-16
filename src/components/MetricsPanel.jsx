'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useWebRTC } from '@/context/WebRTCContext';

const MetricsPanel = () => {
  const { connectionState } = useWebRTC();
  const [metrics, setMetrics] = useState({
    fixationCount: 0,
    avgFixationDuration: 0,
    heartRate: null,
    emotion: null,
  });
  const [attentionScore, setAttentionScore] = useState(0);
  
  // Update metrics from WebRTC data channels
  useEffect(() => {
    // This is a placeholder for real metrics data
    // In a complete implementation, we would receive this data from VideoOverlay, EmotionDetector etc.
    const interval = setInterval(() => {
      setMetrics(prev => ({
        fixationCount: prev.fixationCount + Math.floor(Math.random() * 3),
        avgFixationDuration: parseFloat((prev.avgFixationDuration + Math.random() * 0.05).toFixed(2)),
        heartRate: Math.floor(65 + Math.random() * 20),
        emotion: getRandomEmotion(),
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate attention score based on metrics
  useEffect(() => {
    if (metrics.emotion && metrics.heartRate) {
      // This is a simplified attention score calculation
      // In a real implementation, we would use more sophisticated algorithms
      let score = 0;
      
      // Add points for normal heart rate range (65-75 bpm)
      if (metrics.heartRate >= 65 && metrics.heartRate <= 75) {
        score += 30;
      } else if (metrics.heartRate > 75 && metrics.heartRate <= 85) {
        score += 20;
      } else {
        score += 10;
      }
      
      // Add points based on emotion
      if (metrics.emotion === 'neutral' || metrics.emotion === 'happy') {
        score += 40;
      } else if (metrics.emotion === 'surprised') {
        score += 30;
      } else if (metrics.emotion === 'sad') {
        score += 20;
      } else {
        score += 10;
      }
      
      // Add points for fixation metrics
      score += Math.min(30, metrics.fixationCount / 10);
      
      setAttentionScore(Math.min(100, score));
    }
  }, [metrics]);
  
  // Helper function to get random emotion for demo purposes
  const getRandomEmotion = () => {
    const emotions = ['happy', 'sad', 'angry', 'neutral', 'surprised', 'disgusted', 'fearful'];
    return emotions[Math.floor(Math.random() * emotions.length)];
  };
  
  // Helper function to get color for attention score
  const getAttentionColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Helper function to get icon for emotion
  const getEmotionIcon = (emotion) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'neutral': return '😐';
      case 'surprised': return '😮';
      case 'disgusted': return '🤢';
      case 'fearful': return '😨';
      default: return '❓';
    }
  };

  return (
    <motion.div 
      className="metrics-panel p-6 text-white"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">BioVision Metrics</h2>
      
      {/* Connection Status */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-1">Connection Status</div>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${connectionState === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div className="font-medium">
            {connectionState === 'connected' ? 'Connected' : connectionState || 'Disconnected'}
          </div>
        </div>
      </div>
      
      {/* Attention Score */}
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-1">Attention Score</div>
        <div className="flex items-center">
          <div className={`text-3xl font-bold ${getAttentionColor(attentionScore)}`}>
            {attentionScore}%
          </div>
        </div>
        <div className="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: `${attentionScore}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Fixation Count */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Fixation Count</div>
          <div className="text-xl font-semibold">{metrics.fixationCount}</div>
        </div>
        
        {/* Average Fixation Duration */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Avg. Fixation</div>
          <div className="text-xl font-semibold">{metrics.avgFixationDuration}s</div>
        </div>
        
        {/* Heart Rate */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Heart Rate</div>
          <div className="text-xl font-semibold">
            {metrics.heartRate ? `${metrics.heartRate} BPM` : 'Calculating...'}
          </div>
          
          {metrics.heartRate && (
            <motion.div 
              className="mt-2"
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 60 / metrics.heartRate, // Match animation to heart rate
                ease: "easeInOut"
              }}
            >
              <div className="text-red-500 text-2xl">❤️</div>
            </motion.div>
          )}
        </div>
        
        {/* Emotion */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Dominant Emotion</div>
          <div className="text-xl font-semibold flex items-center">
            {metrics.emotion ? (
              <>
                <span className="mr-2 text-2xl">{getEmotionIcon(metrics.emotion)}</span>
                <span className="capitalize">{metrics.emotion}</span>
              </>
            ) : 'Detecting...'}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-gray-500 text-center">
        Data refreshes every 2 seconds
      </div>
    </motion.div>
  );
};

export default MetricsPanel;
