const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.post('/signup', async (req, res) => {
    try {
        const { username, firstname, lastname, password } = req.body;

        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            username,
            firstname,
            lastname,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const userData = {
            id: user._id,
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname
        };

        res.json(userData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 