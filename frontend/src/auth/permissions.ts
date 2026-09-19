import type { UserRole } from '../types';

export const PERMISSIONS = {
  canManageAssets: (role: UserRole | undefined) => role === 'SUPERVISOR',
  canManageCrews: (role: UserRole | undefined) => role === 'COORDINATOR',
  canCreateWorkOrders: (role: UserRole | undefined) => role === 'SUPERVISOR',
  canAssignCrew: (role: UserRole | undefined) => role === 'COORDINATOR',
  canExecuteWorkOrder: (role: UserRole | undefined) =>
    role === 'TECHNICIAN' || role === 'SUPERVISOR',
  canCompleteWorkOrder: (role: UserRole | undefined) => role === 'SUPERVISOR',
  canCancelWorkOrder: (role: UserRole | undefined) =>
    role === 'SUPERVISOR' || role === 'COORDINATOR',
  canViewDashboard: (role: UserRole | undefined) =>
    role === 'SUPERVISOR' || role === 'COORDINATOR',
};