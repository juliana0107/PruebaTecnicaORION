export type UserRole = 'SUPERVISOR' | 'COORDINATOR' | 'TECHNICIAN';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuthPayload {
  sub: string;
  email: string;
  role: UserRole;
}