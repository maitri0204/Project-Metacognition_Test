// ─── Roles ───
export enum USER_ROLE {
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
}

// ─── User ───
export interface User {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: USER_ROLE;
  isVerified: boolean;
  isActive?: boolean;
}
