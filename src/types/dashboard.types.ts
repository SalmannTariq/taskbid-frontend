export type DashboardStats = {
  tasksByStatus: { status: string; count: number }[];
  averageBidByComplexity: { complexity: number; averageBid: number | null }[];
  topUsers: { id: number; name: string; completedTasks: number }[];
  tasksWithZeroBids: { complexity: number; count: number }[];
};
