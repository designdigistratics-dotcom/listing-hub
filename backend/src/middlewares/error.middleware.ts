import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err);

    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;

        if (prismaError.code === 'P2002') {
            res.status(400).json({
                error: 'A record with this value already exists',
                field: prismaError.meta?.target?.[0],
            });
            return;
        }

        if (prismaError.code === 'P2025') {
            res.status(404).json({
                error: 'Record not found',
            });
            return;
        }
    }

    // Validation errors (Zod)
    if (err.name === 'ZodError') {
        res.status(400).json({
            error: 'Validation error',
            details: (err as any).errors,
        });
        return;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        res.status(401).json({
            error: err.message,
        });
        return;
    }

    // Default error
    res.status(500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
};

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({
        error: `Route ${req.method} ${req.path} not found`,
    });
};
