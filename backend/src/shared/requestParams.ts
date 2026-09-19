import { Request } from 'express';
import { ValidationError } from './errors';

/**
 * Extrae un parámetro de ruta como string, garantizando que no sea array.
 * Express 5 puede tipar params como string | string[].
 */
export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new ValidationError(`Parámetro '${name}' inválido`);
  }
  return value;
}