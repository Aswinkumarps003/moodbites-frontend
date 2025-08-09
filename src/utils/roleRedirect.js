// Utility to get dashboard path based on user role
// role: 0 = admin, 1 = user, 2 = dietician
export function getDashboardPath(role) {
  if (role === 0) return '/admin';
  if (role === 1) return '/dashboard';
  if (role === 2) return '/dietician';
  return '/'; // fallback
}