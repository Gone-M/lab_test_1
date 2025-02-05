const io = require('socket.io-client');

const socket = io('http://localhost:5002');

socket.on('connect', () => {
    console.log('Connected to server');

    socket.emit('joinRoom', { username: 'testuser', room: 'general' });

    setTimeout(() => {
        socket.emit('chatMessage', {
            username: 'testuser',
            room: 'general',
            message: 'Test message via socket'
        });
    }, 1000);
});

socket.on('message', (message) => {
    console.log('Received message:', message);
});

setTimeout(() => {
    socket.disconnect();
    process.exit(0);
}, 3000); 