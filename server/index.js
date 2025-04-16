const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Store connected clients
const rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room (each phone-laptop pair forms a room)
  socket.on('join-room', (roomId) => {
    console.log(`User ${socket.id} joining room ${roomId}`);
    
    // Create the room if it doesn't exist
    if (!rooms[roomId]) {
      rooms[roomId] = { users: [] };
    }
    
    // Add user to the room
    rooms[roomId].users.push(socket.id);
    socket.join(roomId);
    
    // Notify other users in the room
    socket.to(roomId).emit('user-connected', socket.id);
    
    // Send the current users in the room to the new user
    socket.emit('room-users', rooms[roomId].users.filter(id => id !== socket.id));
  });

  // Handle WebRTC signaling messages
  socket.on('offer', ({ offer, roomId, targetId }) => {
    socket.to(targetId).emit('offer', {
      offer,
      offererId: socket.id,
      roomId
    });
  });

  socket.on('answer', ({ answer, roomId, offererId }) => {
    socket.to(offererId).emit('answer', {
      answer,
      answererId: socket.id,
      roomId
    });
  });

  socket.on('ice-candidate', ({ candidate, roomId, targetId }) => {
    socket.to(targetId).emit('ice-candidate', {
      candidate,
      senderId: socket.id,
      roomId
    });
  });

  // Process any heart rate analysis requests
  socket.on('analyze-heart-rate', (imageData) => {
    // In a real implementation, this would process the image data
    // For now, we'll just simulate a heart rate calculation
    const simulatedHeartRate = Math.floor(60 + Math.random() * 40); // 60-100 BPM range
    socket.emit('heart-rate-result', { bpm: simulatedHeartRate });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all rooms they were in
    Object.keys(rooms).forEach(roomId => {
      const room = rooms[roomId];
      const index = room.users.indexOf(socket.id);
      
      if (index !== -1) {
        room.users.splice(index, 1);
        socket.to(roomId).emit('user-disconnected', socket.id);
        
        // Remove the room if empty
        if (room.users.length === 0) {
          delete rooms[roomId];
        }
      }
    });
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Signaling server running on http://0.0.0.0:${PORT}`);
});
