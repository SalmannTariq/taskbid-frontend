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

export type Workload = {
  userId: number;
  currentWorkload: number;
  maxCapacityHours: number;
  remainingCapacity: number;
};
