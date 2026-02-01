import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const scheduleMorningNotification = async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const permissions = await LocalNotifications.checkPermissions();
    if (permissions.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // הגנה מפני X.length: בודקים אם יש התראות לפני שמנסים לבטל אותן
    const pending = await LocalNotifications.getPending();
    if (pending?.notifications && pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    const now = new Date();
    // Default target time: 9:00 AM today
    let scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);

    // Safety Buffer: Ensure the time is at least 5 minutes in the future.
    // This prevents the "time must be in the future" crash on iOS.
    const bufferTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer
    
    if (scheduledTime <= bufferTime) {
      // If 9 AM is in the past or too close (within 5 mins), schedule for 9 AM tomorrow
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    await LocalNotifications.schedule({
      notifications: [{
        title: "בוקר טוב מהארנב! 🐰",
        body: "הארנב מחכה לך! בוא נראה מה שלומך הבוקר ✨",
        id: 1001,
        schedule: { 
          at: scheduledTime, 
          repeats: true,
          every: 'day',
          allowWhileIdle: true
        },
        sound: 'default'
      }]
    });
    console.log('Notification scheduled for:', scheduledTime);
  } catch (error) {
    console.error('Notification error:', error);
  }
};
