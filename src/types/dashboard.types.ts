export type DashboardStats = {
  tasks: Record<string, number>;
  bids: Record<string, number>;
  users: {
    total: number;
    totalCapacityHours: number;
    totalWorkloadHours: number;
    totalRemainingCapacityHours: number;
  };
};
