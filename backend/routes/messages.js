const express = require('express');
const router = express.Router();
const GroupMessage = require('../models/GroupMessage');
const PrivateMessage = require('../models/PrivateMessage');

router.post('/group', async (req, res) => {
    try {
        const { from_user, room, message } = req.body;

        const newMessage = new GroupMessage({
            from_user,
            room,
            message
        });

        const savedMessage = await newMessage.save();
        res.json(savedMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.get('/group/:room', async (req, res) => {
    try {
        const messages = await GroupMessage.find({ room: req.params.room })
            .sort({ date_sent: 1 });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.post('/private', async (req, res) => {
    try {
        const { from_user, to_user, message } = req.body;

        const newMessage = new PrivateMessage({
            from_user,
            to_user,
            message
        });

        const savedMessage = await newMessage.save();
        res.json(savedMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/private/:userId', async (req, res) => {
    try {
        const messages = await PrivateMessage.find({
            $or: [
                { from_user: req.params.userId },
                { to_user: req.params.userId }
            ]
        }).sort({ date_sent: 1 });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 