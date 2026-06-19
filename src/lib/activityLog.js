import { createRecord } from './firestoreService';

export async function logActivity(uid, action, details = {}) {
  try {
    await createRecord(uid, 'activity', {
      action,
      details,
      date: new Date().toISOString().slice(0, 10),
      at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Activity log failed:', error);
  }
}
