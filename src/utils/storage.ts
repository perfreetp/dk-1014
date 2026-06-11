import { Task, Verification, Communication, Disposal } from '../types';

const TASKS_KEY = 'risk_assistant_tasks';
const VERIFICATIONS_KEY = 'risk_assistant_verifications';
const COMMUNICATIONS_KEY = 'risk_assistant_communications';
const DISPOSALS_KEY = 'risk_assistant_disposals';

export const storage = {
  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  updateTaskStatus: (taskId: number, status: Task['status']) => {
    const tasks = storage.getTasks();
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status } : task
    );
    storage.saveTasks(updatedTasks);
    return updatedTasks;
  },

  getVerifications: (): Verification[] => {
    try {
      const data = localStorage.getItem(VERIFICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveVerification: (verification: Verification) => {
    const verifications = storage.getVerifications();
    const existingIndex = verifications.findIndex((v) => v.merchantId === verification.merchantId);
    if (existingIndex >= 0) {
      verifications[existingIndex] = verification;
    } else {
      verifications.push(verification);
    }
    localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(verifications));
  },

  getVerificationByMerchantId: (merchantId: number): Verification | undefined => {
    const verifications = storage.getVerifications();
    return verifications.find((v) => v.merchantId === merchantId);
  },

  getCommunications: (): Communication[] => {
    try {
      const data = localStorage.getItem(COMMUNICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCommunication: (communication: Communication) => {
    const communications = storage.getCommunications();
    communications.unshift(communication);
    localStorage.setItem(COMMUNICATIONS_KEY, JSON.stringify(communications));
  },

  getCommunicationsByMerchantId: (merchantId: number): Communication[] => {
    const communications = storage.getCommunications();
    return communications.filter((c) => c.merchantId === merchantId);
  },

  getDisposals: (): Disposal[] => {
    try {
      const data = localStorage.getItem(DISPOSALS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveDisposal: (disposal: Disposal) => {
    const disposals = storage.getDisposals();
    disposals.unshift(disposal);
    localStorage.setItem(DISPOSALS_KEY, JSON.stringify(disposals));
  },

  getDisposalsByMerchantId: (merchantId: number): Disposal[] => {
    const disposals = storage.getDisposals();
    return disposals.filter((d) => d.merchantId === merchantId);
  },
};