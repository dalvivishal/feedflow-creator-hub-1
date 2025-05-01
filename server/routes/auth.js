
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Create initial credit transaction
    const creditTransaction = new CreditTransaction({
      userId: user._id,
      amount: 50,
      type: 'admin_adjustment',
      description: 'Initial registration bonus'
    });

    await creditTransaction.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        profileComplete: user.profileComplete,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if user logged in on a different day
    const lastLogin = new Date(user.lastLogin);
    const today = new Date();
    const isNewDay = today.toDateString() !== lastLogin.toDateString();

    // If it's a new day, add daily login credits
    if (isNewDay) {
      user.credits += 10;

      const creditTransaction = new CreditTransaction({
        userId: user._id,
        amount: 10,
        type: 'daily_login',
        description: 'Daily login bonus'
      });

      await creditTransaction.save();
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        profileComplete: user.profileComplete,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error 1:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
