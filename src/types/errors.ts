// Base error class for the application
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Document processing errors
export class DocumentError extends AppError {
    constructor(message: string, statusCode = 422) {
        super(message, statusCode);
    }
}

export class PDFParseError extends DocumentError {
    constructor(message: string) {
        super(`PDF parsing failed: ${message}`);
    }
}

// AI/LLM related errors
export class AIError extends AppError {
    constructor(message: string, statusCode = 422) {
        super(message, statusCode);
    }
}

export class TokenLimitError extends AIError {
    constructor(message: string) {
        super(`Token limit exceeded: ${message}`, 413);
    }
}

export class NetworkError extends AIError {
    constructor(message: string) {
        super(`Network error: ${message}`, 503);
    }
}

// Data validation errors
export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

// Data matching errors
export class MatchingError extends AppError {
    constructor(message: string) {
        super(message, 422);
    }
}

// Error handler utility
export class ErrorHandler {
    static handle(error: unknown): { message: string; statusCode: number; details?: string } {
        if (error instanceof AppError) {
            return {
                message: error.message,
                statusCode: error.statusCode
            };
        }

        // Handle unknown errors
        console.error('Unhandled error:', error);
        return {
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
            statusCode: 500,
            details: error instanceof Error ? error.stack : String(error)
        };
    }
} 