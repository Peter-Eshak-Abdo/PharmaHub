import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OfflineStorageService, QueuedAppointment } from './offline-storage.service';
import { PwaService } from './pwa.service';
import { ToastService } from './toast.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private isSyncing = false;

  constructor(
    private offlineStorage: OfflineStorageService,
    private pwaService: PwaService,
    private http: HttpClient,
    private toastService: ToastService
  ) {
    this.initSyncListener();
  }

  private initSyncListener(): void {
    this.pwaService.isOnline$.subscribe((online) => {
      if (online) {
        this.syncQueuedAppointments();
      }
    });
  }

  public async syncQueuedAppointments(): Promise<void> {
    if (this.isSyncing || !this.pwaService.isOnline) return;

    const queued = await this.offlineStorage.getQueuedAppointments();
    if (queued.length === 0) return;

    this.isSyncing = true;
    this.toastService.info(`جاري مزامنة ${queued.length} طلب حجز تم حفظه أثناء عدم الاتصال بالإنترنت...`);

    let syncedCount = 0;

    for (const item of queued) {
      try {
        await this.http.post(`${environment.apiUrl}/appointments`, item.payload).toPromise();
        await this.offlineStorage.removeQueuedAppointment(item.id);
        syncedCount++;
      } catch (err: any) {
        item.retryCount = (item.retryCount || 0) + 1;
        item.error = err.error?.message || err.message;
        if (item.retryCount >= 3) {
          // If permanent failure or too many retries, remove or mark failed
          await this.offlineStorage.removeQueuedAppointment(item.id);
          this.toastService.error(`فشلت مزامنة موعد: ${item.error}`);
        } else {
          await this.offlineStorage.updateQueueItem(item);
        }
      }
    }

    this.isSyncing = false;

    if (syncedCount > 0) {
      this.toastService.success(`تم تأكيد ومزامنة ${syncedCount} حجز بنجاح مع السيرفر! 🎉`);
    }
  }
}
