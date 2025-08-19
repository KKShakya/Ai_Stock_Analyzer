import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import User from '../models/User';

const router = Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      plan: user.plan,
      apiCallsUsed: user.apiCallsUsed,
      apiCallsLimit: user.apiCallsLimit,
      subscriptionEnds: user.subscriptionEnds,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { name },
      { new: true }
    );
    
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
