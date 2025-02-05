# Real-Time Chat Application

## Overview
This project is a real-time chat application with user authentication, room-based messaging, and message storage using MongoDB.

## Technologies
- **Backend:** Node.js, Express, Socket.io, Mongoose
- **Frontend:** HTML5, CSS, Bootstrap, jQuery, Fetch API
- **Database:** MongoDB

## Features
- User signup and login with session management
- Room-based chat with real-time messaging
- Ability to join and leave rooms
- Messages stored in MongoDB (both group and private chats)
- Typing indicator for private messages
- Logout functionality

## Setup Instructions
1. Clone the repository:
   ```sh
   git clone https://github.com/Gone-M/lab_test_1.git
   cd 101441732_lab_test1_chat_app
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure `.env` file:
   ```sh
   MONGO_URI=your_mongodb_connection_string
   PORT=5002
   ```
4. Start the server:
   ```sh
   npm start
   ```
5. Open `http://localhost:3000/` in your browser.

## MongoDB Schemas
- **User Schema:** Stores user details (username, name, password, etc.)
- **Group Message Schema:** Stores room-based messages
- **Private Message Schema:** Stores 1-on-1 messages

## Evaluation Criteria
- Proper GitHub repository management (10 pts)
- Functional signup and login pages (20 pts)
- Room join/leave feature (10 pts)
- Typing indicator for private messages (10 pts)
- Message storage and real-time chat (50 pts)

## Future Improvements
- Improve UI/UX
- Add media sharing support
- Implement push notifications

---
This project is a part of the lab test to enhance real-time web development skills using Socket.io and MongoDB.

