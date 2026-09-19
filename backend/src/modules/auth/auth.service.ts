import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from './auth.repository';
import { LoginInput } from './auth.schema';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../shared/errors';
import { AuthPayload } from './auth.types';

export const authService = {
  async login({ email, password }: LoginInput) {
    const user = await authRepository.findByEmail(email.toLowerCase().trim());
    if (!user || !user.active) throw new UnauthorizedError('Credenciales inválidas');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new UnauthorizedError('Credenciales inválidas');

    const payload: AuthPayload = { sub: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  },

  async me(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) throw new UnauthorizedError('Usuario no encontrado');
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  },
};