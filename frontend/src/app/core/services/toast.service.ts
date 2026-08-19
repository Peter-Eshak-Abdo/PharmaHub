import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  public show(toast: Omit<ToastMessage, 'id'>): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration || 4000
    };

    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newToast.duration);
    }
  }

  public success(message: string, title: string = 'نجاح'): void {
    this.show({ type: 'success', title, message });
  }

  public error(message: string, title: string = 'تنبيه خطأ'): void {
    this.show({ type: 'error', title, message, duration: 6000 });
  }

  public warning(message: string, title: string = 'تحذير'): void {
    this.show({ type: 'warning', title, message });
  }

  public info(message: string, title: string = 'معلومة'): void {
    this.show({ type: 'info', title, message });
  }

  public remove(id: string): void {
    const current = this.toastsSubject.value;
    this.toastsSubject.next(current.filter((t) => t.id !== id));
  }
}
