import { storage } from './storage';
import { mockTasks, mockCommunications, mockDisposals } from '../data/mockData';

export const initData = () => {
  if (!localStorage.getItem('risk_assistant_initialized')) {
    storage.saveTasks(mockTasks);
    localStorage.setItem('risk_assistant_initialized', 'true');
  }
};

export const getTasksWithStorage = () => {
  const storedTasks = storage.getTasks();
  return storedTasks.length > 0 ? storedTasks : mockTasks;
};