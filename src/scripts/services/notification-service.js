import API_CONFIG from '../config/api-config.js';
import AuthService from './auth-service.js';

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

class NotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
  }

  async init() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    if (!('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    try {
      const swPath = `${import.meta.env.BASE_URL}sw.js`;
      this.registration = await navigator.serviceWorker.register(swPath);
      console.log('Service Worker registered');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async subscribe() {
    if (!this.registration) {
      await this.init();
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Notification permission denied');
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      await this.sendSubscriptionToServer(subscription);
      this.subscription = subscription;
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    }
  }

  async sendSubscriptionToServer(subscription) {
    const token = AuthService.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const subscriptionData = subscription.toJSON();
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SUBSCRIBE_NOTIFICATION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscriptionData.endpoint,
        keys: {
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to subscribe to notifications');
    }

    return data;
  }

  async unsubscribe() {
    if (!this.registration) {
      return;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      
      if (subscription) {
        await this.removeSubscriptionFromServer(subscription);
        await subscription.unsubscribe();
        this.subscription = null;
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  }

  async removeSubscriptionFromServer(subscription) {
    const token = AuthService.getToken();
    if (!token) {
      return;
    }

    const subscriptionData = subscription.toJSON();

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UNSUBSCRIBE_NOTIFICATION}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscriptionData.endpoint,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to unsubscribe from notifications');
    }

    return data;
  }

  async getSubscription() {
    if (!this.registration) {
      await this.init();
    }

    return await this.registration.pushManager.getSubscription();
  }

  async isSubscribed() {
    const subscription = await this.getSubscription();
    return !!subscription;
  }
}

export default new NotificationService();

