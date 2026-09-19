import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../shared/errors';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Error de validación de Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      code: 'VALIDATION_ERROR',
      details: err.flatten(),
    });
  }

  // Errores de aplicación conocidos
  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      error: err.message,
      code: err.code,
    };
    if (err instanceof ValidationError && err.details) {
      body.details = err.details;
    }
    return res.status(err.statusCode).json(body);
  }

  // Error no controlado
  console.error('[UNHANDLED_ERROR]', err);
  return res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
  });
}