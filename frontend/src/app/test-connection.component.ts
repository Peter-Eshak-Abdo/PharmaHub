import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-test-connection',
  template: `
    <div style="padding: 20px; border: 2px solid #007bff; margin: 20px; border-radius: 8px; font-family: sans-serif;">
      <h2>🧪 اختبار الاتصال بين Angular و Express</h2>
      <p>رابط الـ API الحالي: <code>{{ apiUrl }}</code></p>

      <button (click)="checkBackend()" style="padding: 10px 15px; cursor: pointer;">اختبار الاتصال بالسيرفر</button>

      <div *ngIf="responseStatus === 'success'" style="color: green; margin-top: 15px;">
        ✅ **تم الاتصال بنجاح!**<br>
        <pre>{{ responseData | json }}</pre>
      </div>

      <div *ngIf="responseStatus === 'error'" style="color: red; margin-top: 15px;">
        ❌ **فشل الاتصال!** تأكد من تشغيل الباك إند أو صحة رابط الـ API ورسائل الـ CORS.<br>
        <small>{{ errorMessage }}</small>
      </div>
    </div>
  `
})
export class TestConnectionComponent {
  apiUrl = environment.apiUrl;
  responseStatus: 'idle' | 'success' | 'error' = 'idle';
  responseData: any = null;
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  checkBackend() {
    this.responseStatus = 'idle';
    // تجربة جلب قائمة الأطباء كاختبار للـ API
    this.http.get(`${this.apiUrl}/doctors`).subscribe({
      next: (data) => {
        this.responseData = data;
        this.responseStatus = 'success';
      },
      error: (err) => {
        this.errorMessage = err.message || 'حدث خطأ أثناء الاتصال';
        this.responseStatus = 'error';
      }
    });
  }
}
