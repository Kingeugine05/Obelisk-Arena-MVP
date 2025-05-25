const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();

// Add CSP headers
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' github.githubassets.com; style-src 'self' 'unsafe-inline';"
  );
  next();
});

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'build')));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : "*",
    methods: ["GET", "POST"]
  }
});

// Add a map to track users
const users = new Map(); // Maps user IDs to socket IDs
const channels = new Map(); // Maps channel IDs to user IDs

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Add user identification
  socket.on('identify', (userId) => {
    users.set(userId, socket.id);
    console.log(`User ${userId} identified with socket ${socket.id}`);
    
    // Broadcast to all clients that a user has joined
    io.emit('userJoined', { userId });
  });

  // Handle joining a channel
  socket.on('joinChannel', (channelId) => {
    socket.join(channelId);
    console.log(`Client ${socket.id} joined channel ${channelId}`);
    
    // Add user to channel map
    if (!channels.has(channelId)) {
      channels.set(channelId, new Set());
    }
    
    // Find userId for this socket
    let userId = null;
    for (const [id, socketId] of users.entries()) {
      if (socketId === socket.id) {
        userId = id;
        break;
      }
    }
    
    if (userId) {
      channels.get(channelId).add(userId);
    }
  });

  // Handle joining a match/room
  socket.on('joinMatch', (matchId) => {
    socket.join(matchId);
    console.log(`Client ${socket.id} joined match ${matchId}`);
    // Optionally broadcast to others in the match that a user joined
    io.to(matchId).emit('userJoined', { userId: socket.id, matchId });
  });

  // Handle sending a message
  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    
    // Handle different channel types
    if (message.channel === 'global') {
      // Global messages go to everyone
      io.emit('receiveMessage', message);
    } else if (message.channel === 'team' || message.channel === 'match' || message.channel === 'guild') {
      // Room-based messages
      io.to(message.roomId).emit('receiveMessage', message);
    } else if (message.channel === 'private') {
      // Handle private messages - might need to look up recipient's socket ID
      const recipientSocketId = users.get(message.to);
      if (recipientSocketId) {
        // Send to recipient
        io.to(recipientSocketId).emit('receiveMessage', message);
        // Send back to sender
        socket.emit('receiveMessage', message);
      } else {
        console.warn(`Recipient ${message.to} not found or offline`);
        socket.emit('messageError', { 
          originalMessage: message, 
          error: 'User offline or not found' 
        });
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    
    // Find and remove user from the map
    let disconnectedUserId = null;
    for (const [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        users.delete(userId);
        console.log(`User ${userId} removed from active users`);
        break;
      }
    }
    
    // Remove user from all channels
    if (disconnectedUserId) {
      for (const [channelId, userSet] of channels.entries()) {
        if (userSet.has(disconnectedUserId)) {
          userSet.delete(disconnectedUserId);
        }
      }
      
      // Notify other users
      io.emit('userLeft', { userId: disconnectedUserId });
    }
  });
});

// For any request not handled by static files, serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// At the bottom of your file, update the server.listen call:
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});