export interface Merchant {
  id: number;
  name: string;
  address: string;
  licenseNumber: string;
  contact: string;
  rate: number;
  createdAt: string;
}

export interface Task {
  id: number;
  merchantId: number;
  merchantName: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  createdAt: string;
}

export interface TaskStatusChange {
  id: number;
  taskId: number;
  merchantId: number;
  merchantName: string;
  oldStatus: string;
  newStatus: string;
  changedAt: string;
  source: string;
}

export interface Transaction {
  id: number;
  merchantId: number;
  amount: number;
  transactionTime: string;
  type: 'payment' | 'refund';
  refundAmount: number;
}

export interface Verification {
  id: number;
  merchantId: number;
  storefrontImage: string;
  checkoutImage: string;
  licenseImage: string;
  terminalNumber: string;
  createdAt: string;
}

export interface Communication {
  id: number;
  merchantId: number;
  notes: string;
  rectificationRequirements: string;
  commitmentDate: string;
  recorder: string;
  createdAt: string;
  followedUp: boolean;
}

export interface Disposal {
  id: number;
  merchantId: number;
  type: 'limit' | 'pause_settlement' | 'review' | 'release';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  approver: string;
  createdAt: string;
  reviewDate?: string;
}

export interface Complaint {
  id: number;
  merchantId: number;
  content: string;
  createdAt: string;
}

export interface DiagnosisResult {
  merchantId: number;
  abnormalPeak: boolean;
  nightTransactions: boolean;
  highRefundRate: boolean;
  splitting: boolean;
  suspectedCashout: boolean;
  riskScore: number;
}

export interface Statistics {
  completionRate: number;
  riskDistribution: { type: string; count: number }[];
  personalPerformance: { name: string; score: number; completedTasks: number }[];
}

export interface TimelineItem {
  id: string;
  type: 'task' | 'verification' | 'communication' | 'disposal';
  title: string;
  description: string;
  time: string;
  icon: string;
}

export interface RouteVisitState {
  taskId: number;
  visited: boolean;
  skipped: boolean;
  completedAt?: string;
}

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type DisposalType = 'limit' | 'pause_settlement' | 'review' | 'release';