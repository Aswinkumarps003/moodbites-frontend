// Shared utility for logging video/audio consultation calls
// Persists to localStorage so logs survive page reloads

const STORAGE_KEY = 'moodbites_call_logs';

/**
 * Generate unique ID for a call log entry
 */
const generateId = () => `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * Get all call logs from localStorage
 */
export const getAllCallLogs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Get call logs for a specific user (as caller or receiver)
 */
export const getCallLogs = (userId) => {
  const all = getAllCallLogs();
  return all.filter(
    (log) => log.callerId === userId || log.receiverId === userId
  );
};

/**
 * Log a new call
 * @param {{ callerId: string, callerName: string, receiverId: string, receiverName: string, callType: 'video'|'audio', duration: number, startedAt: string, endedAt: string }} data
 * @returns {object} The created log entry
 */
export const logCall = (data) => {
  const entry = {
    id: generateId(),
    callerId: data.callerId,
    callerName: data.callerName,
    receiverId: data.receiverId,
    receiverName: data.receiverName,
    callType: data.callType || 'video',
    duration: data.duration || 0, // seconds
    startedAt: data.startedAt || new Date().toISOString(),
    endedAt: data.endedAt || new Date().toISOString(),
    notes: '',
    createdAt: new Date().toISOString(),
  };

  const logs = getAllCallLogs();
  logs.unshift(entry); // newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  return entry;
};

/**
 * Add or update notes on a call log entry
 */
export const addCallNote = (logId, note) => {
  const logs = getAllCallLogs();
  const idx = logs.findIndex((l) => l.id === logId);
  if (idx !== -1) {
    logs[idx].notes = note;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return logs[idx];
  }
  return null;
};

/**
 * Delete a call log entry
 */
export const deleteCallLog = (logId) => {
  const logs = getAllCallLogs().filter((l) => l.id !== logId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

/**
 * Get aggregate stats for a user
 */
export const getCallStats = (userId) => {
  const logs = getCallLogs(userId);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const thisWeek = logs.filter((l) => new Date(l.startedAt) >= weekAgo);
  const thisMonth = logs.filter((l) => new Date(l.startedAt) >= monthAgo);
  const totalDuration = logs.reduce((sum, l) => sum + (l.duration || 0), 0);

  return {
    totalCalls: logs.length,
    callsThisWeek: thisWeek.length,
    callsThisMonth: thisMonth.length,
    totalDurationSeconds: totalDuration,
    totalDurationFormatted: formatDuration(totalDuration),
    averageDuration: logs.length ? Math.round(totalDuration / logs.length) : 0,
    videoCalls: logs.filter((l) => l.callType === 'video').length,
    audioCalls: logs.filter((l) => l.callType === 'audio').length,
  };
};

/**
 * Format seconds into mm:ss or hh:mm:ss
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
