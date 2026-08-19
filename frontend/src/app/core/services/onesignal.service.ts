import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

declare global {
  interface Window {
    OneSignalDeferred?: any[];
    OneSignal?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class OneSignalService {
  // OneSignal App ID (Configure via environment or fallback ID)
  private appId: string = (environment as any).oneSignalAppId || '00000000-0000-0000-0000-000000000000';
  private isInitialized = false;

  constructor() {
    this.initOneSignal();
  }

  public initOneSignal(): void {
    if (typeof window === 'undefined' || this.isInitialized) return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    
    // Inject OneSignal SDK script if not already present
    if (!document.getElementById('onesignal-sdk-script')) {
      const script = document.createElement('script');
      script.id = 'onesignal-sdk-script';
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.defer = true;
      document.head.appendChild(script);
    }

    window.OneSignalDeferred.push(async (OneSignal: any) => {
      await OneSignal.init({
        appId: this.appId,
        notifyButton: {
          enable: false,
        },
        allowLocalhostAsSecureOrigin: true,
      });

      this.isInitialized = true;
      console.log('[OneSignal] Initialized successfully with appId:', this.appId);
    });
  }

  /**
   * Associate the logged-in User/Patient/Doctor with OneSignal
   * @param externalUserId The MongoDB _id of the User
   */
  public async loginUser(externalUserId: string): Promise<void> {
    if (typeof window === 'undefined') return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        await OneSignal.login(externalUserId);
        console.log(`[OneSignal] Logged in user with ID: ${externalUserId}`);
      } catch (err) {
        console.error('[OneSignal] Failed to login user:', err);
      }
    });
  }

  /**
   * Log out user from OneSignal when they log out of PharmaHub
   */
  public async logoutUser(): Promise<void> {
    if (typeof window === 'undefined') return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        await OneSignal.logout();
        console.log('[OneSignal] User logged out.');
      } catch (err) {
        console.error('[OneSignal] Failed to logout user:', err);
      }
    });
  }

  /**
   * Prompt user to opt-in for Push Notifications
   */
  public async requestNotificationPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }

      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          const canRequest = await OneSignal.Notifications.canRequestPermission();
          if (canRequest) {
            await OneSignal.Notifications.requestPermission();
          }
          const hasPermission = OneSignal.Notifications.permission;
          resolve(hasPermission);
        } catch (err) {
          console.error('[OneSignal] Permission request error:', err);
          resolve(false);
        }
      });
    });
  }
}
