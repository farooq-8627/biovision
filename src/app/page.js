'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CardboardBox from '@/components/CardboardBox';
import PhoneRenderer from '@/components/PhoneRenderer';
import MetricsPanel from '@/components/MetricsPanel';
import { useWebRTC } from '@/context/WebRTCContext';

export default function Home() {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const { createRoom, joinRoom } = useWebRTC();
  
  // Generate a random room ID if one doesn't exist
  useEffect(() => {
    if (!roomId) {
      setRoomId(Math.random().toString(36).substring(2, 7));
    }
  }, [roomId]);

  const handleAnimationComplete = () => {
    setAnimationComplete(true);
  };

  const handleCreateRoom = () => {
    createRoom(roomId);
    setIsJoined(true);
  };

  const handleJoinRoom = () => {
    joinRoom(roomId);
    setIsJoined(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="z-10 max-w-5xl w-full items-center justify-center flex flex-col gap-8">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to <span className="text-primary-500">BioVision</span>
        </motion.h1>
        
        {!animationComplete ? (
          <CardboardBox onAnimationComplete={handleAnimationComplete} />
        ) : !isJoined ? (
          <motion.div 
            className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Connect Your Devices</h2>
            
            <div className="mb-4">
              <label htmlFor="room-id" className="block text-sm font-medium mb-2">Room ID</label>
              <input 
                type="text" 
                id="room-id"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button 
                onClick={handleCreateRoom}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-md transition-colors"
              >
                Create Room (Phone)
              </button>
              <button 
                onClick={handleJoinRoom}
                className="flex-1 bg-secondary-600 hover:bg-secondary-700 text-white p-3 rounded-md transition-colors"
              >
                Join Room (Laptop)
              </button>
            </div>
            
            <p className="mt-6 text-sm text-gray-500 text-center">
              Create a room on your phone and join with the same ID on your laptop.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col xl:flex-row gap-8 w-full">
            <div className="flex-1">
              <PhoneRenderer />
            </div>
            <div className="flex-1">
              <MetricsPanel />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
