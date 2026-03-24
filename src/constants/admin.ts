export const ADMIN_EMAIL = 'nethaniel.24bcy10210@vitbhopal.ac.in';

export const normalizeEmail = (email?: string | null) =>
  (email ?? '').trim().toLowerCase();

export const isAdminEmail = (email?: string | null) =>
  normalizeEmail(email) === ADMIN_EMAIL;
