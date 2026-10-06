export type TaskType = {
  id: number;
  title: string;
  description: string;
  estimatedComplexity: number;
  createdBy:{
    id: number;
    name: string;
    email: string;
  };
  assignee?: {
    id: number;
    name: string;
    email: string;
  } | null;
  deadline: string;
  status: string;
  createdAt: string;
  bidCount: number;
  lowestBid: number | null;
};

export type CreateTaskInput = {
  title: string;
  description: string;
  estimatedComplexity: number;
  deadline: string;
  createdBy: number;
};
