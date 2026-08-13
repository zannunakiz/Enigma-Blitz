export interface UserContext {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

export function formatUser(user: UserContext): string {
  return `User [${user.id}]: ${user.name} (${user.role.toUpperCase()})`;
}
