import type { User } from '@prisma/client';

export const toUserResponse = (user: User) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
