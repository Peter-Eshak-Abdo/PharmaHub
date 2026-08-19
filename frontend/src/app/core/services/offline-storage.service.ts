import { Injectable } from '@angular/core';

export interface QueuedAppointment {
  id: string;
  payload: any;
  createdAt: number;
  status: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineStorageService {
  private dbName = 'PharmaHubOfflineDB';
  private dbVersion = 1;
  private storeName = 'offline_appointments';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve(this.db!);
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }

  public async queueAppointment(payload: any): Promise<QueuedAppointment> {
    const db = await this.initDB();
    const item: QueuedAppointment = {
      id: 'offline_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      payload,
      createdAt: Date.now(),
      status: 'pending',
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const req = store.add(item);

      req.onsuccess = () => resolve(item);
      req.onerror = (e: any) => reject(e.target.error);
    });
  }

  public async getQueuedAppointments(): Promise<QueuedAppointment[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e: any) => reject(e.target.error);
    });
  }

  public async removeQueuedAppointment(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = (e: any) => reject(e.target.error);
    });
  }

  public async updateQueueItem(item: QueuedAppointment): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const req = store.put(item);

      req.onsuccess = () => resolve();
      req.onerror = (e: any) => reject(e.target.error);
    });
  }
}
