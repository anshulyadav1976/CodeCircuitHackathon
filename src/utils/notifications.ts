// Check if browser supports notifications
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

// Request permission for notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications or ServiceWorkers not supported.');
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Helper function to post a message to the service worker
const postMessageToServiceWorker = (message: any): void => {
  if (navigator.serviceWorker.controller) { // Check if a SW is controlling the page
    navigator.serviceWorker.controller.postMessage(message);
  } else {
    // Fallback or queue message if SW not active yet? For now, just log.
    // This can happen if SW registration is pending or failed.
    console.warn('Service worker controller not available to post message.');
    // As a fallback, could attempt direct notification if permission is granted
    // For simplicity, the caller (scheduleReminder) will handle this.
  }
};

// Show a notification, preferring Service Worker
export const showNotification = (
  title: string, 
  options?: NotificationOptions & { body: string } // body is required for SW notification payload
): void => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    console.warn('Notification permission not granted or not supported.');
    return;
  }

  const payload = {
    title,
    body: options?.body || '',
    icon: options?.icon || '/favicon.ico', // Ensure icon is a path
    ...options,
  };

  // Try to send via Service Worker first
  if (navigator.serviceWorker.controller) {
    postMessageToServiceWorker({ type: 'SHOW_REMINDER', payload });
  } else {
    // Fallback to direct Notification API if SW controller is not available
    console.log('Falling back to direct Notification API.');
    new Notification(title, options);
  }
};

// Schedule a daily reminder
let reminderTimeoutId: NodeJS.Timeout | null = null; // Keep track of existing timeout

export const scheduleReminder = (
  reminderTime: string // HH:MM format
): void => {
  if (reminderTimeoutId) {
    clearTimeout(reminderTimeoutId); // Clear any existing reminder
    reminderTimeoutId = null;
  }

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    console.warn('Cannot schedule reminder: Notifications not supported or permission denied.');
    return;
  }

  const [hours, minutes] = reminderTime.split(':').map(Number);

  const scheduleNext = () => {
    const now = new Date();
    const nextReminderDate = new Date();
    nextReminderDate.setHours(hours, minutes, 0, 0);

    if (nextReminderDate <= now) {
      nextReminderDate.setDate(nextReminderDate.getDate() + 1);
    }

    const timeUntilReminder = nextReminderDate.getTime() - now.getTime();
    console.log(`Next reminder scheduled in ${timeUntilReminder / 1000 / 60} minutes for ${nextReminderDate}`);

    reminderTimeoutId = setTimeout(() => {
      console.log('Posting reminder to service worker or showing directly.');
      showNotification('Flashcard Study Reminder', {
        body: 'Time for your daily flashcard review session!',
        icon: '/logo192.png', // Make sure this icon exists in public
        tag: 'flashcard-reminder' // Tag to prevent multiple similar notifications stacking
      });
      scheduleNext(); // Reschedule for the next day
    }, timeUntilReminder);
  };

  scheduleNext();
  console.log(`Reminder scheduling initiated for ${reminderTime} daily.`);
};

// Unschedule reminders (e.g., when notifications are disabled)
export const unscheduleReminders = (): void => {
  if (reminderTimeoutId) {
    clearTimeout(reminderTimeoutId);
    reminderTimeoutId = null;
    console.log('Daily reminders have been unscheduled.');
  }
};

// Register service worker for notifications
export const registerNotificationServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
};
