import { Merchant, Task, Transaction, Verification, Communication, Disposal, Complaint, DiagnosisResult, Statistics } from '../types';

export const mockMerchants: Merchant[] = [
  { id: 1, name: '旺角餐厅', address: '北京市朝阳区建国路88号', licenseNumber: '1101050000001', contact: '张经理 13800138001', rate: 0.006, createdAt: '2024-01-15' },
  { id: 2, name: '新世纪超市', address: '上海市浦东新区陆家嘴环路1000号', licenseNumber: '3101010000002', contact: '李店长 13900139002', rate: 0.005, createdAt: '2024-02-20' },
  { id: 3, name: '鑫源百货', address: '广州市天河区天河路383号', licenseNumber: '4401060000003', contact: '王老板 13600136003', rate: 0.0065, createdAt: '2024-03-10' },
  { id: 4, name: '恒通电器', address: '深圳市南山区科技园路8号', licenseNumber: '4403050000004', contact: '陈总 13500135004', rate: 0.0055, createdAt: '2024-04-05' },
  { id: 5, name: '华美服饰', address: '杭州市西湖区延安路500号', licenseNumber: '3301060000005', contact: '刘经理 13700137005', rate: 0.007, createdAt: '2024-05-18' },
];

export const mockTasks: Task[] = [
  { id: 1, merchantId: 1, merchantName: '旺角餐厅', status: 'pending', priority: 'high', deadline: '2024-12-20', createdAt: '2024-12-10' },
  { id: 2, merchantId: 2, merchantName: '新世纪超市', status: 'pending', priority: 'medium', deadline: '2024-12-25', createdAt: '2024-12-12' },
  { id: 3, merchantId: 3, merchantName: '鑫源百货', status: 'in_progress', priority: 'high', deadline: '2024-12-18', createdAt: '2024-12-08' },
  { id: 4, merchantId: 4, merchantName: '恒通电器', status: 'pending', priority: 'low', deadline: '2024-12-30', createdAt: '2024-12-15' },
  { id: 5, merchantId: 5, merchantName: '华美服饰', status: 'completed', priority: 'medium', deadline: '2024-12-10', createdAt: '2024-12-01' },
];

export const mockTransactions: Transaction[] = [
  { id: 1, merchantId: 1, amount: 1250.00, transactionTime: '2024-12-10 09:30:00', type: 'payment', refundAmount: 0 },
  { id: 2, merchantId: 1, amount: 890.00, transactionTime: '2024-12-10 14:20:00', type: 'payment', refundAmount: 150.00 },
  { id: 3, merchantId: 1, amount: 2340.00, transactionTime: '2024-12-11 22:15:00', type: 'payment', refundAmount: 0 },
  { id: 4, merchantId: 1, amount: 5600.00, transactionTime: '2024-12-12 00:30:00', type: 'payment', refundAmount: 0 },
  { id: 5, merchantId: 1, amount: 180.00, transactionTime: '2024-12-12 10:45:00', type: 'refund', refundAmount: 180.00 },
  { id: 6, merchantId: 1, amount: 950.00, transactionTime: '2024-12-13 16:00:00', type: 'payment', refundAmount: 0 },
  { id: 7, merchantId: 1, amount: 3200.00, transactionTime: '2024-12-14 23:45:00', type: 'payment', refundAmount: 0 },
  { id: 8, merchantId: 1, amount: 150.00, transactionTime: '2024-12-15 08:30:00', type: 'payment', refundAmount: 150.00 },
];

export const mockVerifications: Verification[] = [
  { id: 1, merchantId: 1, storefrontImage: '', checkoutImage: '', licenseImage: '', terminalNumber: 'TERM-001', createdAt: '2024-12-10' },
];

export const mockCommunications: Communication[] = [
  { id: 1, merchantId: 1, notes: '商户表示近期经营状况良好，无异常情况', rectificationRequirements: '要求商户加强交易监控', commitmentDate: '2024-12-25', recorder: '张三', createdAt: '2024-12-10', followedUp: false },
];

export const mockDisposals: Disposal[] = [
  { id: 1, merchantId: 1, type: 'limit', amount: 50000, status: 'pending', approver: '', createdAt: '2024-12-10' },
];

export const mockComplaints: Complaint[] = [
  { id: 1, merchantId: 1, content: '顾客反映刷卡未到账', createdAt: '2024-12-08' },
  { id: 2, merchantId: 1, content: '退款处理不及时', createdAt: '2024-12-05' },
];

export const mockDiagnosis: DiagnosisResult = {
  merchantId: 1,
  abnormalPeak: true,
  nightTransactions: true,
  highRefundRate: false,
  splitting: true,
  suspectedCashout: false,
  riskScore: 75,
};

export const mockStatistics: Statistics = {
  completionRate: 85.5,
  riskDistribution: [
    { type: '异常峰值', count: 12 },
    { type: '夜间交易', count: 8 },
    { type: '退款偏高', count: 5 },
    { type: '分单交易', count: 15 },
    { type: '疑似套现', count: 3 },
  ],
  personalPerformance: [
    { name: '张三', score: 95, completedTasks: 28 },
    { name: '李四', score: 88, completedTasks: 22 },
    { name: '王五', score: 82, completedTasks: 18 },
    { name: '赵六', score: 78, completedTasks: 15 },
  ],
};

export const generateDailyTransactions = () => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return days.map((day, index) => ({
    day,
    amount: 5000 + Math.floor(Math.random() * 15000),
    count: 20 + Math.floor(Math.random() * 80),
  }));
};

export const generateMonthlyTransactions = () => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  return months.map((month) => ({
    month,
    amount: 150000 + Math.floor(Math.random() * 300000),
    count: 500 + Math.floor(Math.random() * 1500),
  }));
};