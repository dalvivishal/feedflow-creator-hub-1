
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    if (name) user.name = name;

    // Check if profile is being completed for the first time
    const wasProfileComplete = user.profileComplete;
    user.profileComplete = true;

    // Award credits for profile completion (only first time)
    if (!wasProfileComplete) {
      user.credits += 20;

      // Create credit transaction
      const creditTransaction = new CreditTransaction({
        userId: user._id,
        amount: 20,
        type: 'profile_completion',
        description: 'Profile completion bonus'
      });

      await creditTransaction.save();
    }

    await user.save();

    return res.json({
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
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get user credit transactions
router.get('/credits', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await CreditTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.json(transactions);
  } catch (error) {
    console.error('Get credit transactions error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/credits/transaction', authMiddleware, async (req, res) => {
  const { amount, type, description } = req.body;
  const userId = req.user._id;

  if (!amount || !type || !description) {
    return res.status(400).json({ error: 'Amount, type, and description are required.' });
  }

  try {
    const transaction = new CreditTransaction({
      userId,
      amount,
      type,
      description,
      timestamp: new Date(),
    });

    await transaction.save();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits: amount } },
      { new: true }
    );

    res.json({ success: true, updatedUser });
  } catch (error) {
    console.error('Credit transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ADMIN ROUTES

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update user credits (admin only)
router.put('/:userId/credits', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }


    const user = await User.findById(new mongoose.Types.ObjectId(userId));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user credits
    user.credits += parseInt(amount);
    await user.save();

    // Create credit transaction
    const creditTransaction = new CreditTransaction({
      userId: user._id,
      amount: parseInt(amount),
      type: 'admin_adjustment',
      description: description || 'Admin adjustment'
    });

    await creditTransaction.save();

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error('Update credits error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
