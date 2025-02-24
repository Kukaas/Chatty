import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import friendRoutes from './routes/friendRoutes';
import userRoutes from './routes/userRoutes';
import messageRoutes from './routes/messageRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// MongoDB Connection with proper options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatty', {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4 // Use IPv4, skip trying IPv6
})
.then(() => console.log('Connected to MongoDB'))
.catch((error: Error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1); // Exit if we can't connect to the database
});

// Add error handlers
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

interface ChatMessage {
  content: string;
  sender: string;
  recipient: string;
  timestamp?: Date;
}

// Add at the top with other imports
const onlineUsers = new Map<string, string>(); // userId -> socketId

interface TypingUser {
  _id: string;
  name: string;
  avatar: string;
}

interface TypingData {
  recipientId: string;
  user: TypingUser;
}

// Update the Socket.IO Connection handling
io.on('connection', (socket: Socket) => {
  console.log('A user connected');

  socket.on('identify', (userId: string) => {
    console.log('User identified:', userId);
    onlineUsers.set(userId, socket.id);
    socket.join(userId); // Join a room with their user ID
    
    // Broadcast to all connected clients that this user is online
    io.emit('user_status_change', { userId, status: 'online' });
  });

  socket.on('send-message', (data: ChatMessage) => {
    // Add timestamp if not provided
    const messageWithTimestamp = {
      ...data,
      timestamp: data.timestamp || new Date(),
    };

    // Send to recipient
    io.to(data.recipient).emit('receive-message', messageWithTimestamp);
    
    // Send back to sender (in case they have multiple tabs/windows open)
    socket.emit('receive-message', messageWithTimestamp);
  });

  socket.on('disconnect', () => {
    // Find and remove the disconnected user
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        // Broadcast that this user is offline
        io.emit('user_status_change', { userId, status: 'offline' });
        break;
      }
    }
    console.log('User disconnected');
  });

  socket.on('typing_start', (data: TypingData) => {
    io.to(data.recipientId).emit('typing_status', { 
      userId: data.user._id,
      user: data.user,
      isTyping: true 
    });
  });

  socket.on('typing_stop', (data: TypingData) => {
    io.to(data.recipientId).emit('typing_status', { 
      userId: data.user._id,
      user: data.user,
      isTyping: false 
    });
  });
});

// Add a new endpoint to get online users
app.get('/api/users/online', (req, res) => {
  res.json(Array.from(onlineUsers.keys()));
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 