// src/utils/appError.ts
export class AppError extends Error {
  public status: number;
  public isOperational: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error types
export const createValidationError = (message: string) => new AppError(message, 400);
export const createNotFoundError = (message: string) => new AppError(message, 404);
export const createUnauthorizedError = (message: string) => new AppError(message, 401);
export const createServerError = (message: string) => new AppError(message, 500);
