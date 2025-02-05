const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

connectDB().catch(err => {
    console.error('Initial database connection failed:', err);
});

app.use(express.json());
app.use(cors());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));

app.get('/', (req, res) => {
    res.json({ message: 'Chat API is running' });
});

const activeUsers = new Map();

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('setUsername', (username) => {
        socket.username = username;
        activeUsers.set(socket.id, { username, room: null });
        updateActiveUsers();
    });

    socket.on('joinRoom', ({ username, room }) => {
        socket.join(room);
        if (socket.username) {
            activeUsers.get(socket.id).room = room;
        }

        socket.emit('message', {
            from_user: 'ChatBot',
            message: `Welcome to ${room}!`,
            date_sent: new Date()
        });

        socket.broadcast.to(room).emit('message', {
            from_user: 'ChatBot',
            message: `${username} has joined the chat`,
            date_sent: new Date()
        });

        updateActiveUsers();
    });

    socket.on('chatMessage', ({ username, room, message }) => {
        io.to(room).emit('message', { from_user: username, message });
    });

    socket.on('typing', ({ username, room }) => {
        socket.broadcast.to(room).emit('typing', { username });
    });

    socket.on('stopTyping', ({ room }) => {
        socket.broadcast.to(room).emit('stopTyping');
    });

    socket.on('leaveRoom', ({ username, room }) => {
        socket.leave(room);
        if (socket.username) {
            activeUsers.get(socket.id).room = null;
        }
        
        socket.broadcast.to(room).emit('message', {
            from_user: 'ChatBot',
            message: `${username} has left the chat`,
            date_sent: new Date()
        });

        socket.emit('roomLeft', { room });
        updateActiveUsers();
    });

    socket.on('privateMessage', (data) => {

        const recipientSocket = Array.from(io.sockets.sockets.values())
            .find(s => s.username === data.to_user);
            
        if (recipientSocket) {

            io.to(recipientSocket.id).emit('privateMessage', {
                from_user: data.from_user,
                message: data.message,
                isPrivate: true
            });
            
            socket.emit('privateMessage', {
                from_user: data.from_user,
                to_user: data.to_user,
                message: data.message,
                isPrivate: true
            });
        }
    });

    socket.on('disconnect', () => {
        if (activeUsers.has(socket.id)) {
            activeUsers.delete(socket.id);
            updateActiveUsers();
        }
    });

    function updateActiveUsers() {
        const users = Array.from(activeUsers.values()).map(u => u.username);
        io.emit('activeUsers', users);
    }
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Press CTRL + C to stop the server');
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    server.close(() => process.exit(1));
}); 