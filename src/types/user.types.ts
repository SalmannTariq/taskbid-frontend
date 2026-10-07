export type SessionUser = {
  id: number;
  name: string;
  email: string;
};

export type Workload = {
  userId: number;
  currentWorkload: number;
  maxCapacityHours: number;
  remainingCapacity: number;
};
