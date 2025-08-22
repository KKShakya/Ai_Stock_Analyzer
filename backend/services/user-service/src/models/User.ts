// src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  // Basic Info
  email: string;
  password?: string; // Optional for OAuth users
  name: string;
  avatar?: string;

  // OAuth
  googleId?: string;
  refreshToken?: string;

  // Account Status
  isVerified: boolean;
  isActive: boolean;

  // Subscription & Limits
  plan: "free" | "pro" | "enterprise";
  apiCallsUsed: number;
  apiCallsLimit: number;
  subscriptionEnds?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;

  // Onboarding fields
  onboardingCompleted: boolean;
  onboardingCompletedAt?: Date;
  experience?: "beginner" | "intermediate" | "advanced";
  goals?: ("trading" | "analysis" | "learning" | "portfolio")[];
  interests?: ("stocks" | "crypto" | "forex" | "commodities")[];
  riskTolerance?: "low" | "medium" | "high";
  notifications: boolean;

  // Methods
  toJSON(): any;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // Don't include password in queries by default
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },

    // OAuth fields
    googleId: {
      type: String,
      sparse: true, // Allows multiple null values
    },
    refreshToken: {
      type: String,
      select: false,
    },

    // Account status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Subscription
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    apiCallsUsed: {
      type: Number,
      default: 0,
    },
    apiCallsLimit: {
      type: Number,
      default: 1000,
    },
    subscriptionEnds: {
      type: Date,
      default: null,
    },

    lastLogin: {
      type: Date,
    },

    // Onboarding fields
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingCompletedAt: {
      type: Date,
    },
    experience: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    goals: [
      {
        type: String,
        enum: ["trading", "analysis", "learning", "portfolio"],
      },
    ],
    interests: [
      {
        type: String,
        enum: ["stocks", "crypto", "forex", "commodities"],
      },
    ],
    riskTolerance: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure arrays have defaults when empty
UserSchema.pre('save', function(next) {
  // Set default goals if array is empty or null
  if (!this.goals || (Array.isArray(this.goals) && this.goals.length === 0)) {
    this.goals = ['analysis'];
  }
  
  // Set default interests if array is empty or null
  if (!this.interests || (Array.isArray(this.interests) && this.interests.length === 0)) {
    this.interests = ['stocks'];
  }
  
  next();
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ plan: 1 });

// Remove sensitive data from JSON output
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

export default mongoose.model<IUser>("User", UserSchema);
