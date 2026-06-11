import { Task, Verification, Communication, Disposal, TaskStatusChange, RouteVisitState } from '../types';

const TASKS_KEY = 'risk_assistant_tasks';
const VERIFICATIONS_KEY = 'risk_assistant_verifications';
const COMMUNICATIONS_KEY = 'risk_assistant_communications';
const DISPOSALS_KEY = 'risk_assistant_disposals';
const TASK_STATUS_CHANGES_KEY = 'risk_assistant_task_status_changes';
const ROUTE_VISIT_STATES_KEY = 'risk_assistant_route_visit_states';

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

  updateTaskStatus: (taskId: number, status: Task['status'], source: string = 'unknown') => {
    const tasks = storage.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return tasks;

    const oldStatus = task.status;
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status } : t
    );
    storage.saveTasks(updatedTasks);

    if (oldStatus !== status) {
      storage.saveTaskStatusChange({
        id: Date.now(),
        taskId,
        merchantId: task.merchantId,
        merchantName: task.merchantName,
        oldStatus,
        newStatus: status,
        changedAt: new Date().toLocaleString('zh-CN'),
        source,
      });
    }

    return updatedTasks;
  },

  getTaskStatusChanges: (): TaskStatusChange[] => {
    try {
      const data = localStorage.getItem(TASK_STATUS_CHANGES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTaskStatusChange: (change: TaskStatusChange) => {
    const changes = storage.getTaskStatusChanges();
    changes.unshift(change);
    localStorage.setItem(TASK_STATUS_CHANGES_KEY, JSON.stringify(changes));
  },

  getTaskStatusChangesByMerchantId: (merchantId: number): TaskStatusChange[] => {
    const changes = storage.getTaskStatusChanges();
    return changes.filter((c) => c.merchantId === merchantId);
  },

  getRouteVisitStates: (): RouteVisitState[] => {
    try {
      const data = localStorage.getItem(ROUTE_VISIT_STATES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveRouteVisitStates: (states: RouteVisitState[]) => {
    localStorage.setItem(ROUTE_VISIT_STATES_KEY, JSON.stringify(states));
  },

  updateRouteVisitState: (taskId: number, updates: Partial<RouteVisitState>) => {
    const states = storage.getRouteVisitStates();
    const existingIndex = states.findIndex((s) => s.taskId === taskId);
    if (existingIndex >= 0) {
      states[existingIndex] = { ...states[existingIndex], ...updates };
    } else {
      states.push({ taskId, visited: false, skipped: false, ...updates });
    }
    storage.saveRouteVisitStates(states);
  },

  clearRouteVisitStates: () => {
    localStorage.removeItem(ROUTE_VISIT_STATES_KEY);
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
    verifications.push(verification);
    localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(verifications));
  },

  getVerificationsByMerchantId: (merchantId: number): Verification[] => {
    const verifications = storage.getVerifications();
    return verifications.filter((v) => v.merchantId === merchantId);
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

  toggleCommunicationFollowedUp: (communicationId: number) => {
    const communications = storage.getCommunications();
    const updatedCommunications = communications.map((c) =>
      c.id === communicationId ? { ...c, followedUp: !c.followedUp } : c
    );
    localStorage.setItem(COMMUNICATIONS_KEY, JSON.stringify(updatedCommunications));
    return updatedCommunications;
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

  getReviewDisposals: (): Disposal[] => {
    const disposals = storage.getDisposals();
    return disposals.filter((d) => d.type === 'review' && d.reviewDate);
  },
};