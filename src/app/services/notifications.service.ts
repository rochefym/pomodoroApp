import { Injectable } from '@angular/core';
import { LocalNotifications, PermissionStatus, LocalNotificationSchema, ScheduleResult } from '@capacitor/local-notifications';
import { ToastController } from '@ionic/angular';
import { getDefaultTimezone, formatDateInTimezone } from '../utils/timezone-util';


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  constructor(private toastController: ToastController) { }

  defaultTimeZone: string = '';


  // Check notification permissions
  async checkNotificationPermissions(): Promise<PermissionStatus> {
    const permissions = await LocalNotifications.checkPermissions();
    console.log('Current permissions:', permissions);
    return permissions;
  }

  // Request notification permissions
  async requestNotificationPermissions(): Promise<PermissionStatus> {
    const permissions = await LocalNotifications.requestPermissions();
    console.log('Updated permissions:', permissions);
    return permissions;
  }

  // Create a notification
  async scheduleNotification(notification: LocalNotificationSchema) {
    this.defaultTimeZone = getDefaultTimezone();


    await LocalNotifications.schedule({
      notifications: [notification],
    });
    console.log('Notification scheduled:', notification);
  }

  // Read all pending notifications
  async getPendingNotifications(): Promise<ScheduleResult> {
    const pending = await LocalNotifications.getPending();
    console.log('Pending notifications:', pending);
    return pending;
  }

  // Update a notification
  async updateNotification(id: number, updatedNotification: LocalNotificationSchema) {
    await LocalNotifications.cancel({ notifications: [{ id }] });
    await this.scheduleNotification(updatedNotification);
    console.log(`Notification with ID ${id} updated.`);
  }

  // Delete a notification
  async cancelNotification(id: number) {
    await LocalNotifications.cancel({ notifications: [{ id }] });
    console.log(`Notification with ID ${id} canceled.`);
  }


  // Listen for incoming notifications
  listenForIncomingNotifications() {
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Notification received:', notification);
      this.displayInAppNotification(notification);
    });
  }

  // Display in-app notification (e.g., toast or custom overlay)
  // private displayInAppNotification(notification: any) {
  //   const toast = document.createElement('div');
  //   toast.className = 'custom-notification';
  //   toast.innerHTML = `
  //     <div class="notification-content">
  //       <strong>${notification.title}</strong>
  //       <p>${notification.body}</p>
  //     </div>
  //   `;
  //   document.body.appendChild(toast);

  // Remove the notification after 5 seconds
  //   setTimeout(() => {
  //     toast.remove();
  //   }, 5000);
  // }

  async displayInAppNotification(notification: any) {
    const toast = await this.toastController.create({
      header: notification.title,
      message: notification.body,
      position: 'top',
      duration: 5000,
      color: 'dark',
    });
    await toast.present();
  }
}
