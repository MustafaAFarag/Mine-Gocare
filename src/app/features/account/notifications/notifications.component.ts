import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  id: number;
  message: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent {
  // Sample notifications data
  notifications: Notification[] = [
    {
      id: 1,
      message:
        'Your order has been successfully placed. Order ID: #1013. Thank you for choosing us.',
      timestamp: '24 Jun 2024 11:59:AM',
      type: 'success',
      read: false,
    },
    {
      id: 2,
      message: 'Your Refund request status has been rejected',
      timestamp: '21 Jun 2024 03:12:PM',
      type: 'error',
      read: false,
    },
    {
      id: 3,
      message:
        'Your order has been successfully placed. Order ID: #1012. Thank you for choosing us.',
      timestamp: '21 Jun 2024 02:48:PM',
      type: 'success',
      read: false,
    },
    {
      id: 4,
      message:
        'Your order has been successfully placed. Order ID: #1011. Thank you for choosing us.',
      timestamp: '21 Jun 2024 02:48:PM',
      type: 'success',
      read: false,
    },
    {
      id: 5,
      message:
        'Your order has been successfully placed. Order ID: #1010. Thank you for choosing us.',
      timestamp: '21 Jun 2024 01:59:PM',
      type: 'success',
      read: false,
    },
    {
      id: 6,
      message:
        'Your order has been successfully placed. Order ID: #1009. Thank you for choosing us.',
      timestamp: '21 Jun 2024 01:27:PM',
      type: 'success',
      read: false,
    },
  ];

  // Method to mark notification as read
  markAsRead(notification: Notification): void {
    notification.read = true;
  }

  // Method to mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
  }

  // Method to get unread notifications count
  getUnreadCount(): number {
    return this.notifications.filter((notification) => !notification.read)
      .length;
  }
}
