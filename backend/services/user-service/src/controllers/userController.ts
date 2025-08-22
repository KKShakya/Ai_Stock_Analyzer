// controllers/userController.ts
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const user = await User.findById(userId).select(
      'email name avatar plan onboardingCompleted onboardingCompletedAt experience goals interests riskTolerance notifications'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          plan: user.plan,
          onboardingCompleted: user.onboardingCompleted,
          onboardingCompletedAt: user.onboardingCompletedAt,
          preferences: {
            experience: user.experience,
            goals: user.goals,
            interests: user.interests,
            riskTolerance: user.riskTolerance,
            notifications: user.notifications,
          }
        }
      }
    });

  } catch (error: unknown) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
