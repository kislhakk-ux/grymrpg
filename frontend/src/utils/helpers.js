// GymForge — General Helper Functions

export function formatDate(dateInput) {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatWeight(weight) {
  const num = parseFloat(weight) || 0;
  return num % 1 === 0 ? `${num} kg` : `${num.toFixed(1)} kg`;
}

export function formatVolume(volumeKg) {
  const num = parseFloat(volumeKg) || 0;
  if (num >= 1000) {
    return `${(num / 1000).toFixed(2)} ton`;
  }
  return `${Math.round(num)} kg`;
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
