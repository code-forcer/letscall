const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();

// Use CORS middleware
app.use(cors({
  origin: ["https://letscall-1.onrender.com"], // Replace with your deployed frontend URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["https://letscall-1.onrender.com"], // Replace with your deployed frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

const DEFAULT_ROOM_ID = 'room1';

io.on('connection', (socket) => {
  console.log('a user connected');

  // Automatically join the default room
  socket.join(DEFAULT_ROOM_ID);

  socket.on('signal', (data) => {
    io.to(data.room).emit('signal', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
