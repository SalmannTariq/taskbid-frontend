export type TaskType = {
  id: number;
  title: string;
  description: string;
  estimatedComplexity: number;
  createdBy: number;
  deadline: string;
  status: string;
  createdAt: string;
};

export type CreateTaskInput = {
  title: string;
  description: string;
  estimatedComplexity: number;
  deadline: string;
  createdBy: number;
};
