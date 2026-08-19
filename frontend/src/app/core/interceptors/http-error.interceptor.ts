import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private toastService: ToastService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';

        if (error.error instanceof ErrorEvent) {
          // Client-side / Network Error
          errorMessage = `خطأ في الاتصال: ${error.error.message}`;
          this.toastService.error(errorMessage, 'خطأ اتصال');
        } else {
          // Server-side Response Error
          switch (error.status) {
            case 0:
              errorMessage = 'تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت.';
              this.toastService.error(errorMessage, 'انقطاع الاتصال');
              break;

            case 400:
              errorMessage = error.error?.message || 'البيانات المدخلة غير صحيحة، يرجى المراجعة.';
              this.toastService.warning(errorMessage, 'طلب غير صالح');
              break;

            case 401:
              errorMessage = error.error?.message || 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى.';
              this.toastService.error(errorMessage, 'غير مصرح');
              this.authService.logout();
              this.router.navigate(['/auth/login'], {
                queryParams: { returnUrl: this.router.url },
              });
              break;

            case 403:
              errorMessage = error.error?.message || 'ليس لديك الصلاحية الكافية للوصول إلى هذه الصفحة.';
              this.toastService.error(errorMessage, 'صلاحية مرفوضة');
              break;

            case 404:
              errorMessage = error.error?.message || 'العنصر المطلوب غير موجود.';
              this.toastService.warning(errorMessage, 'غير موجود');
              break;

            case 409:
              errorMessage = error.error?.message || 'يوجد تعارض في البيانات (مثلاً الموعد محجوز مسبقاً).';
              this.toastService.warning(errorMessage, 'تعارض بيانات');
              break;

            case 422:
              errorMessage = error.error?.message || 'فشل التحقق من صحة البيانات المرسلة.';
              this.toastService.warning(errorMessage, 'تحقق من البيانات');
              break;

            case 500:
            case 502:
            case 503:
            case 504:
              errorMessage = error.error?.message || 'حدث خطأ في الخادم، جاري العمل على حله.';
              this.toastService.error(errorMessage, 'خطأ في السيرفر');
              break;

            default:
              errorMessage = error.error?.message || `خطأ (${error.status}): حدث خطأ غير معروف`;
              this.toastService.error(errorMessage, 'تنبيه');
              break;
          }
        }

        return throwError(() => error);
      })
    );
  }
}
