import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

interface ErrorResponse {
  status: 'error' | 'fail';
  message: string;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDev = process.env['NODE_ENV'] === 'development';

  if (err instanceof AppError) {
    const body: ErrorResponse = {
      status: err.statusCode >= 500 ? 'error' : 'fail',
      message: err.message,
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Error inesperado / no operacional
  console.error('💥 Unhandled error:', err);
  const body: ErrorResponse = {
    status: 'error',
    message: isDev ? err.message : 'Something went wrong. Please try again.',
  };
  res.status(500).json(body);
}
