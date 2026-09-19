function requireInProd(value: string | undefined, name: string, fallback: string): string {
  if (process.env.NODE_ENV === 'production' && !value) {
    throw new Error(`Variable de entorno ${name} requerida en producción`);
  }
  return value || fallback;
}

export const env = {
  JWT_SECRET: requireInProd(process.env.JWT_SECRET, 'JWT_SECRET', 'orion-dev-secret-change-in-prod'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  BCRYPT_ROUNDS: 10,
  NODE_ENV: process.env.NODE_ENV || 'development',
};