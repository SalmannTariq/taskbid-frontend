export type UserType = {
    id?: string;
    name: string;
    email: string;
    password: string;
    hourlyRate: number;
    maxHours: number;
    createdAt?: string;
    updatedAt?: string;
}

export type SessionUser = {
    id: number;
    name?: string;
    email: string;
  };