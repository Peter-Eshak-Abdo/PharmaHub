import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any = null;
  private isInstallableSubject = new BehaviorSubject<boolean>(false);
  public isInstallable$ = this.isInstallableSubject.asObservable();

  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$ = this.isOnlineSubject.asObservable();

  private isAppInstalledSubject = new BehaviorSubject<boolean>(false);
  public isAppInstalled$ = this.isAppInstalledSubject.asObservable();

  constructor() {
    this.initPwa();
    this.initNetworkListeners();
  }

  private initPwa(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.promptEvent = event;
        this.isInstallableSubject.next(true);
      });

      window.addEventListener('appinstalled', () => {
        this.promptEvent = null;
        this.isInstallableSubject.next(false);
        this.isAppInstalledSubject.next(true);
      });

      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
        this.isAppInstalledSubject.next(true);
      }
    }
  }

  private initNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnlineSubject.next(true);
      });

      window.addEventListener('offline', () => {
        this.isOnlineSubject.next(false);
      });
    }
  }

  public promptInstall(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.promptEvent) {
        resolve(false);
        return;
      }
      this.promptEvent.prompt();
      this.promptEvent.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          this.promptEvent = null;
          this.isInstallableSubject.next(false);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  public dismissPrompt(): void {
    this.isInstallableSubject.next(false);
  }

  public get isOnline(): boolean {
    return this.isOnlineSubject.value;
  }
}
