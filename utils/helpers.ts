
export const formatDate = (isoString?: string): string => {
  if (!isoString) return 'No due date';
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export const isOverdue = (isoString?: string): boolean => {
  if (!isoString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Compare dates only
  return new Date(isoString) < today;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export const isThisWeek = (isoString?: string): boolean => {
  if (!isoString) return false;
  
  const dateToCheck = new Date(isoString);
  
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday: 0, Monday: 1, ..., Saturday: 6
  
  const startOfWeek = new Date(today);
  // Adjust to Monday
  const dayOfMonth = today.getDate();
  const dayAdjustment = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(dayOfMonth + dayAdjustment);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return dateToCheck >= startOfWeek && dateToCheck <= endOfWeek;
};
