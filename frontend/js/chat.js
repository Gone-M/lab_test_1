const API_URL = 'http://localhost:5002/api';
const socket = io('http://localhost:5002');

const user = JSON.parse(localStorage.getItem('user'));
let currentRoom = localStorage.getItem('currentRoom') || '';

const usernameDisplay = document.getElementById('username-display');
const roomList = document.getElementById('room-list');
const currentRoomDisplay = document.getElementById('current-room');
const messagesContainer = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing-indicator');
const logoutBtn = document.getElementById('logout-btn');
const leaveRoomBtn = document.getElementById('leave-room-btn');
const activeUsersList = document.getElementById('active-users');

if (!user) {
    window.location.href = 'login.html';
} else {
    usernameDisplay.textContent = user.username;
    
    if (currentRoom) {
        document.querySelectorAll('.list-group-item').forEach(item => {
            if (item.textContent === currentRoom) {
                item.classList.add('active');
            }
        });
        currentRoomDisplay.textContent = currentRoom;
        leaveRoomBtn.disabled = false;
        socket.emit('joinRoom', { username: user.username, room: currentRoom });
        loadRoomMessages(currentRoom);
    }
}


roomList.addEventListener('click', (e) => {
    if (e.target.classList.contains('list-group-item')) {

        document.querySelectorAll('.list-group-item').forEach(item => {
            item.classList.remove('active');
        });
        
        e.target.classList.add('active');
        
        if (currentRoom) {
            socket.emit('leaveRoom', { username: user.username, room: currentRoom });
        }

        currentRoom = e.target.textContent;
        currentRoomDisplay.textContent = currentRoom;
        socket.emit('joinRoom', { username: user.username, room: currentRoom });
        
        messagesContainer.innerHTML = '';
        
        loadRoomMessages(currentRoom);
        
        leaveRoomBtn.disabled = false;

        localStorage.setItem('currentRoom', currentRoom);
    }
});

leaveRoomBtn.addEventListener('click', () => {
    if (currentRoom) {
        socket.emit('leaveRoom', { username: user.username, room: currentRoom });
        currentRoom = '';
        localStorage.removeItem('currentRoom');
        currentRoomDisplay.textContent = 'Not Selected';
        messagesContainer.innerHTML = '';
        leaveRoomBtn.disabled = true;
        
        document.querySelectorAll('.list-group-item').forEach(item => {
            item.classList.remove('active');
        });
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('currentRoom');
    window.location.href = 'login.html';
});

function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
}


async function loadRoomMessages(room) {
    try {
        const response = await fetch(`${API_URL}/messages/group/${room}`);
        const messages = await response.json();
        
        messages.forEach(msg => {
            addMessage(msg);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentRoom) {
        alert('Please join a room first');
        return;
    }

    const message = messageInput.value.trim();
    if (!message) return;

    socket.emit('chatMessage', {
        username: user.username,
        room: currentRoom,
        message: message
    });

    try {
        await fetch(`${API_URL}/messages/group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from_user: user.username,
                room: currentRoom,
                message: message
            })
        });
    } catch (error) {
        console.error('Error saving message:', error);
    }

    messageInput.value = '';
    socket.emit('stopTyping', { room: currentRoom });
    isTyping = false;
});

let isTyping = false;
let typingTimeout;

messageInput.addEventListener('input', () => {
    if (!currentRoom) return;

    const message = messageInput.value.trim();

    if (message.length > 0) {
        if (!isTyping) {
            socket.emit('typing', { username: user.username, room: currentRoom });
            isTyping = true;
        }
    } else {
        socket.emit('stopTyping', { room: currentRoom });
        isTyping = false;
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        if (messageInput.value.trim().length === 0) {
            socket.emit('stopTyping', { room: currentRoom });
            isTyping = false;
        }
    }, 1000);
});


socket.on('message', (message) => {
    addMessage(message);
});

socket.on('typing', ({ username }) => {
    typingIndicator.textContent = `${username} is typing...`;
});

socket.on('stopTyping', () => {
    typingIndicator.textContent = '';
});

socket.on('privateMessage', (message) => {
    addMessage({
        ...message,
        date_sent: new Date(),
        isPrivate: true
    });
});

socket.on('activeUsers', (users) => {
    activeUsersList.innerHTML = users
        .filter(u => u !== user.username)
        .map(username => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${username}
                <button class="btn btn-sm btn-primary" onclick="openPrivateMessage('${username}')">
                    Message
                </button>
            </li>
        `).join('');
});

function addMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    
    const isPrivate = message.isPrivate;
    const isSent = message.from_user === user.username;
    
    div.classList.add(isSent ? 'sent' : 'received');
    if (isPrivate) div.classList.add('private');

    const time = message.date_sent ? formatTime(message.date_sent) : formatTime(new Date());
    
    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'message-username';
    if (!isSent) {
        usernameSpan.classList.add('clickable');
        usernameSpan.onclick = () => openPrivateMessage(message.from_user);
    }
    usernameSpan.textContent = message.from_user;

    div.innerHTML = `
        <div class="message-header">
            <small class="text-muted">
                ${isPrivate ? '(Private) ' : ''}${usernameSpan.outerHTML}
                <span class="message-time">${time}</span>
            </small>
        </div>
        <div class="message-content">${message.message}</div>
    `;

    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function openPrivateMessage(username) {
    selectedUser = username;
    document.getElementById('recipient-name').textContent = username;
    new bootstrap.Modal(document.getElementById('privateMessageModal')).show();
}

const privateMessageModal = `
<div class="modal fade" id="privateMessageModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Send Private Message</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="private-message-form">
                    <div class="mb-3">
                        <label class="form-label">To: <span id="recipient-name"></span></label>
                        <textarea class="form-control" id="private-message-input" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Send</button>
                </form>
            </div>
        </div>
    </div>
</div>`;

document.getElementById('private-message-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = document.getElementById('private-message-input').value.trim();
    if (!message || !selectedUser) return;
    
    try {
        await fetch(`${API_URL}/messages/private`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from_user: user.username,
                to_user: selectedUser,
                message: message
            })
        });
        
        socket.emit('privateMessage', {
            from_user: user.username,
            to_user: selectedUser,
            message: message
        });
        
        document.getElementById('private-message-input').value = '';
        bootstrap.Modal.getInstance(document.getElementById('privateMessageModal')).hide();
        
    } catch (error) {
        console.error('Error sending private message:', error);
    }
});

socket.emit('setUsername', user.username); 
