export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    console.error('Unexpected error:', error);
    return {
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    };
  }

  return {
    error: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
  };
}