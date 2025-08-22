import { Request, Response } from 'express';
import User from '../models/User';
import { OnboardingResponse } from '../validations/onboarding';
import mongoose from 'mongoose'; // Import mongoose for error types

export const saveOnboardingPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    // Get validated data from Joi (with defaults applied for missing fields)
    const {
      experience = 'beginner',
      goals = ['analysis'],
      interests = ['stocks'],
      riskTolerance = 'medium',
      notifications = true
    } = req.body;

    // Handle empty arrays by applying defaults
    const finalGoals = (Array.isArray(goals) && goals.length > 0) ? goals : ['analysis'];
    const finalInterests = (Array.isArray(interests) && interests.length > 0) ? interests : ['stocks'];

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        experience,
        goals: finalGoals,
        interests: finalInterests,
        riskTolerance,
        notifications,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'Unable to save preferences for this user',
      });
    }

    const response: OnboardingResponse = {
      success: true,
      message: 'Onboarding preferences saved successfully',
      data: {
        experience,
        goals: finalGoals,
        interests: finalInterests,
        riskTolerance,
        notifications,
      },
    };

    res.status(200).json(response);
    console.log(`User ${userId} completed onboarding:`, {
      experience,
      goals: finalGoals,
      interests: finalInterests,
      riskTolerance,
      notifications
    });

  } catch (error: unknown) {
    console.error('Onboarding save error:', error);

    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Database validation failed',
          message: 'Invalid data format',
        });
      }
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          error: 'Invalid ID format',
          message: 'The provided ID is not valid',
        });
      }
    }

    if (isMongooseError(error)) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Database validation failed',
          message: 'Invalid data format',
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to save onboarding preferences',
    });
  }
};

// ... rest of your controller code stays the same


export const getOnboardingStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const user = await User.findById(userId).select(
      'onboardingCompleted onboardingCompletedAt experience goals interests riskTolerance notifications'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        completed: user.onboardingCompleted,
        completedAt: user.onboardingCompletedAt,
        preferences: {
          experience: user.experience,
          goals: user.goals,
          interests: user.interests,
          riskTolerance: user.riskTolerance,
          notifications: user.notifications,
        },
      },
    });

  } catch (error: unknown) { // Explicitly type as unknown
    console.error('Get onboarding error:', error);
    
    // Safe error message extraction
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error details:', errorMessage);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// Helper function to check if error is a Mongoose error
function isMongooseError(error: unknown): error is mongoose.Error {
  return error instanceof mongoose.Error;
}
