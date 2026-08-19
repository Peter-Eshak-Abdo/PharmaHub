# خطة التعديلات الشاملة — Doctor Appointment System
**تاريخ الإعداد:** 2026-08-19  
**المسؤول:** Peter — Part 4 + التعديلات العامة  
**Stack:** Node.js/Express · MongoDB/Mongoose · Angular · Tailwind CSS · Material Design 3 · RTL/Arabic

---

## نظرة عامة على المراحل

| المرحلة | الاسم | المهام | النوع |
|---------|-------|--------|-------|
| 1 | إصلاحات UI/UX الأساسية | 1، 3، 7، 8، 11، 12 | Frontend |
| 2 | Auth · Routing · Data | 2، 6، 10 | Full Stack |
| 3 | Features & Business Logic | 4، 5، 13، 14، 15 | Full Stack |
| 4 | ميزات متقدمة | 16، 17، 18 | Full Stack |

---

## المرحلة 1 — إصلاحات UI/UX الأساسية

---

### المهمة 1 — تكبير وإصلاح صفحة auth/register

**المشكلة:** الاستايل صغير والـ form ضيق.

**الملفات المتأثرة:**
- `frontend/src/app/features/auth/register/register.component.html`
- `frontend/src/app/features/auth/register/register.component.css`

**التعديلات المطلوبة:**

```html
<!-- register.component.html -->
<!-- غير الـ wrapper الرئيسي لـ: -->
<div class="min-h-screen flex items-center justify-center bg-background py-xl px-sm">
  <div class="w-full max-w-2xl bg-surface-container-lowest rounded-xl shadow-md p-lg">
    <!-- العنوان -->
    <div class="mb-lg text-center">
      <h1 class="font-headline-lg text-headline-lg text-on-surface mb-xs">إنشاء حساب جديد</h1>
      <p class="font-body-md text-body-md text-on-surface-variant">انضم إلى منصة MedBook</p>
    </div>
    <!-- الفورم داخل grid عمودين على desktop -->
    <form class="grid grid-cols-1 md:grid-cols-2 gap-md">
      <!-- الحقول الأساسية في عمودين -->
      <!-- fullName يمتد على العرض كله -->
      <div class="md:col-span-2">
        <label>الاسم الكامل</label>
        <input class="w-full px-sm py-xs border border-outline rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
      </div>
      <!-- email في عمود -->
      <div>
        <label>البريد الإلكتروني</label>
        <input type="email" class="w-full ..." />
      </div>
      <!-- password في عمود -->
      <div>
        <label>كلمة المرور</label>
        <input type="password" class="w-full ..." />
      </div>
      <!-- role selector يمتد كامل -->
      <div class="md:col-span-2">
        <label>نوع الحساب</label>
        <select class="w-full px-sm py-xs border border-outline rounded-lg ...">
          <option value="patient">مريض</option>
          <option value="doctor">طبيب</option>
        </select>
      </div>
      <!-- زرار التسجيل -->
      <div class="md:col-span-2 mt-sm">
        <button type="submit"
          class="w-full py-sm bg-primary text-on-primary font-label-md rounded-lg hover:bg-primary-container transition-colors">
          إنشاء الحساب
        </button>
      </div>
    </form>
    <!-- رابط تسجيل الدخول -->
    <p class="text-center mt-md font-body-sm text-on-surface-variant">
      عندك حساب؟ <a routerLink="/auth/login" class="text-primary hover:underline">سجل دخول</a>
    </p>
  </div>
</div>
```

```css
/* register.component.css */
/* لا تضع styles هنا — استخدم Tailwind classes مباشرة */
/* لو احتجت custom: */
:host {
  display: block;
}
input:focus, select:focus {
  outline: none;
}
```

**ملاحظات التنفيذ:**
- `max-w-2xl` = 672px مناسب لفورم التسجيل
- الـ `grid-cols-2` يعطي layout منظم على desktop، يرجع عمود واحد على mobile
- كل input يأخذ `w-full` داخل الـ grid cell
- استخدم نفس `border-outline` و `focus:border-primary` المستخدمة في باقي الصفحات

---

### المهمة 3 — إزالة الـ nav الداخلي من dashboard/patient و dashboard/doctor

**المشكلة:** في كل من `patient-appointments` و `doctor-appointments` في nav داخلي زائد فوق الـ app navbar.

**الملفات المتأثرة:**
- `frontend/src/app/features/appointments/patient-appointments/patient-appointments.component.html`
- `frontend/src/app/features/appointments/doctor-appointments/doctor-appointments.component.html`

**التعديل:**

```html
<!-- patient-appointments.component.html -->
<!-- احذف أي <nav> أو <header> أو sidebar داخل الـ component -->
<!-- ابدأ مباشرة من المحتوى: -->

<div class="w-full pt-16 bg-background min-h-screen" dir="rtl">
  <!-- Header Section فقط بدون nav -->
  <div class="px-md md:px-xl py-lg">
    <h1 class="font-headline-lg text-headline-lg text-on-surface mb-xs">مواعيدي</h1>
    <p class="font-body-lg text-body-lg text-on-surface-variant">
      تابع مواعيدك القادمة واستعرض السجل الطبي
    </p>
  </div>

  <!-- Tabs -->
  <div class="px-md md:px-xl border-b border-surface-container-highest flex gap-lg overflow-x-auto">
    <button class="pb-sm font-label-md text-primary border-b-[3px] border-primary whitespace-nowrap px-base">
      القادمة
    </button>
    <button class="pb-sm font-label-md text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap px-base">
      المكتملة
    </button>
    <button class="pb-sm font-label-md text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap px-base">
      الملغاة
    </button>
  </div>

  <!-- المحتوى -->
  <div class="px-md md:px-xl py-xl bg-surface-bright">
    <!-- appointments list هنا -->
  </div>
</div>
```

```html
<!-- doctor-appointments.component.html — نفس النهج -->
<div class="w-full pt-16 bg-background min-h-screen" dir="rtl">
  <div class="px-md md:px-xl py-lg">
    <h1 class="font-headline-lg text-headline-lg text-on-surface mb-xs">إدارة المواعيد</h1>
    <p class="font-body-lg text-body-lg text-on-surface-variant">
      استعرض وأكّد وأدّر مواعيد مرضاك
    </p>
  </div>
  <!-- ... باقي المحتوى بدون nav -->
</div>
```

**قاعدة:** الـ `<app-navbar>` موجود في `app.component.html` ويظهر في كل الصفحات — لا تضع nav ثاني داخل أي component.

---

### المهمة 7 — إضافة Animations في كل الصفحات

**الملفات المتأثرة:**
- `frontend/src/styles.css` ← الأنيميشن العامة
- `frontend/src/app/app.component.ts` ← Route Animations
- `frontend/src/app/app-routing.module.ts` ← تفعيل animation data
- كل component يضيف `@HostBinding` أو class

**الخطوة 1 — أضف CSS animations في `styles.css`:**

```css
/* styles.css — أضف في النهاية */

/* === Entrance Animations === */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

/* === Utility Classes === */
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out forwards;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-slide-in-right {
  animation: slideInRight 0.35s ease-out forwards;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out forwards;
}

/* Staggered children */
.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 60ms; }
.stagger-children > *:nth-child(3) { animation-delay: 120ms; }
.stagger-children > *:nth-child(4) { animation-delay: 180ms; }
.stagger-children > *:nth-child(5) { animation-delay: 240ms; }
.stagger-children > *:nth-child(6) { animation-delay: 300ms; }

/* Card hover */
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 104, 95, 0.12);
}

/* Button pulse on click */
.btn-primary:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

/* Skeleton loading */
@keyframes shimmer {
  0%   { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
.skeleton {
  background: linear-gradient(90deg, #e1e3e4 25%, #edeeef 50%, #e1e3e4 75%);
  background-size: 1000px 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 4px;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**الخطوة 2 — Route Animations في `app.component.ts`:**

```typescript
// app.component.ts
import { Component } from '@angular/core';
import {
  trigger, transition, style, animate, query, group
} from '@angular/animations';
import { RouterOutlet } from '@angular/router';

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(12px)' })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { optional: true }),
    ])
  ])
]);

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <main [@routeAnimations]="getRouteAnimationData(outlet)">
      <router-outlet #outlet="outlet"></router-outlet>
    </main>
  `,
  animations: [routeAnimations]
})
export class AppComponent {
  getRouteAnimationData(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}
```

**الخطوة 3 — استخدام الكلاسات في كل component:**

```html
<!-- مثال في أي صفحة -->
<div class="animate-fade-in-up">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter stagger-children">
    <div class="card-hover animate-fade-in-up bg-surface-container-lowest rounded-xl p-md">...</div>
    <div class="card-hover animate-fade-in-up bg-surface-container-lowest rounded-xl p-md">...</div>
    <div class="card-hover animate-fade-in-up bg-surface-container-lowest rounded-xl p-md">...</div>
  </div>
</div>
```

---

### المهمة 8 — إصلاح UI صفحة doctor-detail

**الملفات المتأثرة:**
- `frontend/src/app/features/profiles/doctor-detail/doctor-detail.component.html`
- `frontend/src/app/features/profiles/doctor-detail/doctor-detail.component.css`
- `frontend/src/app/features/profiles/doctor-detail/doctor-detail.component.ts`

**Layout المطلوب (مستوحى من `code.html`):**

```html
<!-- doctor-detail.component.html -->
<div class="w-full pt-16 bg-background min-h-screen animate-fade-in" dir="rtl">

  <!-- Hero Section -->
  <div class="bg-surface-container-lowest border-b border-outline-variant">
    <div class="max-w-container-max mx-auto px-md md:px-xl py-lg">
      <div class="flex flex-col md:flex-row gap-lg items-start">

        <!-- صورة الدكتور -->
        <div class="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shadow-md shrink-0">
          <img [src]="doctor?.profilePicture || 'assets/default-doctor.png'"
               [alt]="doctor?.fullName"
               class="w-full h-full object-cover" />
        </div>

        <!-- معلومات الدكتور -->
        <div class="flex-grow">
          <div class="flex flex-wrap items-center gap-sm mb-xs">
            <h1 class="font-headline-lg text-headline-lg text-on-surface">
              د. {{ doctor?.fullName }}
            </h1>
            <!-- Badge التخصص -->
            <span class="inline-flex items-center gap-xs px-sm py-xs bg-primary-fixed rounded-full">
              <span class="material-symbols-outlined text-[16px] text-on-primary-fixed">medical_services</span>
              <span class="font-label-sm text-label-sm text-on-primary-fixed">{{ doctor?.specialization }}</span>
            </span>
          </div>

          <p class="font-body-md text-body-md text-on-surface-variant mb-md">
            {{ doctor?.bio || 'طبيب متخصص بخبرة واسعة' }}
          </p>

          <!-- إحصائيات سريعة -->
          <div class="flex flex-wrap gap-lg">
            <div class="flex items-center gap-xs">
              <span class="material-symbols-outlined text-primary text-[20px]">star</span>
              <span class="font-headline-sm text-headline-sm text-on-surface">{{ doctor?.rating | number:'1.1-1' }}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">تقييم</span>
            </div>
            <div class="flex items-center gap-xs">
              <span class="material-symbols-outlined text-primary text-[20px]">work</span>
              <span class="font-headline-sm text-headline-sm text-on-surface">{{ doctor?.yearsOfExperience }}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">سنة خبرة</span>
            </div>
            <div class="flex items-center gap-xs">
              <span class="material-symbols-outlined text-primary text-[20px]">school</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant">{{ doctor?.education }}</span>
            </div>
          </div>
        </div>

        <!-- زرار الحجز -->
        <div class="shrink-0">
          <button
            (click)="bookAppointment()"
            class="px-lg py-sm bg-primary text-on-primary font-label-md rounded-xl hover:bg-primary-container transition-colors card-hover">
            <span class="material-symbols-outlined text-[18px] align-middle ml-xs">calendar_add_on</span>
            احجز موعد
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Body — Grid Layout -->
  <div class="max-w-container-max mx-auto px-md md:px-xl py-xl">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">

      <!-- العمود الرئيسي (2/3) -->
      <div class="lg:col-span-2 flex flex-col gap-gutter">

        <!-- كارت المؤهلات -->
        <div class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant card-hover">
          <h2 class="font-headline-sm text-headline-sm text-on-surface mb-md flex items-center gap-xs">
            <span class="material-symbols-outlined text-primary">verified</span>
            المؤهلات والشهادات
          </h2>
          <p class="font-body-md text-body-md text-on-surface-variant">{{ doctor?.qualifications }}</p>
        </div>

        <!-- كارت التقييمات -->
        <div class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant">
          <h2 class="font-headline-sm text-headline-sm text-on-surface mb-md flex items-center gap-xs">
            <span class="material-symbols-outlined text-primary">reviews</span>
            آراء المرضى
          </h2>
          <div class="flex flex-col gap-sm stagger-children">
            <div *ngFor="let review of reviews"
                 class="bg-surface-container-low rounded-lg p-sm animate-fade-in-up">
              <div class="flex items-center gap-xs mb-xs">
                <div class="flex">
                  <span *ngFor="let s of [1,2,3,4,5]" class="material-symbols-outlined text-[16px]"
                    [class.text-amber-400]="s <= review.rating"
                    [class.text-outline-variant]="s > review.rating">star</span>
                </div>
                <span class="font-body-sm text-body-sm text-on-surface-variant">
                  {{ review.submittedDate | date:'shortDate' }}
                </span>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface">{{ review.comment }}</p>
            </div>
            <div *ngIf="!reviews?.length"
                 class="text-center py-lg text-on-surface-variant font-body-md">
              لا توجد تقييمات بعد
            </div>
          </div>
        </div>
      </div>

      <!-- الشريط الجانبي (1/3) -->
      <div class="flex flex-col gap-gutter">

        <!-- أوقات العمل -->
        <div class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant">
          <h2 class="font-headline-sm text-headline-sm text-on-surface mb-md flex items-center gap-xs">
            <span class="material-symbols-outlined text-primary">schedule</span>
            أوقات العمل
          </h2>
          <div class="flex flex-col gap-xs">
            <div *ngFor="let slot of availability"
                 class="flex justify-between items-center py-xs border-b border-outline-variant last:border-0">
              <span class="font-label-md text-label-md text-on-surface">{{ slot.dayOfWeek | arabicDay }}</span>
              <span class="font-body-sm text-body-sm text-primary">
                {{ slot.startTime }} — {{ slot.endTime }}
              </span>
            </div>
          </div>
        </div>

        <!-- رسوم الكشف -->
        <div class="bg-primary-fixed rounded-xl p-md">
          <p class="font-label-sm text-label-sm text-on-primary-fixed mb-xs">رسوم الكشف</p>
          <p class="font-headline-lg text-headline-lg text-on-primary-fixed">
            {{ doctor?.consultationFee || '—' }} <span class="font-body-md">جنيه</span>
          </p>
          <button
            (click)="bookAppointment()"
            class="w-full mt-md py-sm bg-primary text-on-primary font-label-md rounded-lg hover:bg-primary-container transition-colors">
            احجز الآن
          </button>
        </div>

      </div>
    </div>
  </div>
</div>
```

---

### المهام 11 & 12 — إصلاح صفحة weekly-availability (RTL + ترتيب الأيام)

**الملفات المتأثرة:**
- `frontend/src/app/features/schedule/weekly-availability/weekly-availability.component.html`
- `frontend/src/app/features/schedule/weekly-availability/weekly-availability.component.ts`

**الخطوة 1 — تعديل `weekly-availability.component.ts`:**

```typescript
// weekly-availability.component.ts

// ترتيب الأيام يبدأ من السبت (المهمة 12)
readonly DAYS_OF_WEEK = [
  { key: 'Saturday',  label: 'السبت' },
  { key: 'Sunday',    label: 'الأحد' },
  { key: 'Monday',    label: 'الاثنين' },
  { key: 'Tuesday',   label: 'الثلاثاء' },
  { key: 'Wednesday', label: 'الأربعاء' },
  { key: 'Thursday',  label: 'الخميس' },
  { key: 'Friday',    label: 'الجمعة' },
];

// باقي المنطق كما هو...
```

**الخطوة 2 — تعديل `weekly-availability.component.html`:**

```html
<!-- weekly-availability.component.html -->
<div class="w-full pt-16 bg-background min-h-screen animate-fade-in" dir="rtl">
  <div class="max-w-container-max mx-auto px-md md:px-xl py-xl">

    <!-- Header -->
    <div class="mb-lg">
      <h1 class="font-headline-lg text-headline-lg text-on-surface mb-xs">
        جدول المواعيد الأسبوعي
      </h1>
      <p class="font-body-md text-body-md text-on-surface-variant">
        حدد أيام وأوقات عملك لكل أسبوع
      </p>
    </div>

    <!-- كارت لكل يوم -->
    <div class="flex flex-col gap-sm stagger-children">
      <div *ngFor="let day of DAYS_OF_WEEK"
           class="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden animate-fade-in-up card-hover">

        <!-- رأس اليوم -->
        <div class="flex items-center justify-between p-md border-b border-outline-variant">
          <div class="flex items-center gap-sm">
            <span class="font-headline-sm text-headline-sm text-on-surface">{{ day.label }}</span>
            <!-- Badge عدد الجلسات -->
            <span *ngIf="getSlots(day.key).length > 0"
                  class="inline-flex items-center px-sm py-xs bg-primary-fixed rounded-full">
              <span class="font-label-sm text-label-sm text-on-primary-fixed">
                {{ getSlots(day.key).length }} جلسة
              </span>
            </span>
          </div>
          <!-- Toggle تفعيل اليوم -->
          <div class="flex items-center gap-sm">
            <span class="font-body-sm text-body-sm text-on-surface-variant">
              {{ isDayActive(day.key) ? 'مفعّل' : 'مغلق' }}
            </span>
            <button
              (click)="toggleDay(day.key)"
              [class]="isDayActive(day.key)
                ? 'relative w-12 h-6 rounded-full bg-primary transition-colors'
                : 'relative w-12 h-6 rounded-full bg-outline-variant transition-colors'">
              <span [class]="isDayActive(day.key)
                ? 'absolute top-1 right-1 w-4 h-4 rounded-full bg-on-primary transition-transform'
                : 'absolute top-1 left-1 w-4 h-4 rounded-full bg-surface transition-transform'">
              </span>
            </button>
          </div>
        </div>

        <!-- محتوى اليوم عند التفعيل -->
        <div *ngIf="isDayActive(day.key)" class="p-md">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
            <!-- وقت البداية -->
            <div>
              <label class="font-label-md text-label-md text-on-surface mb-xs block">وقت البداية</label>
              <input type="time"
                     [(ngModel)]="getSlot(day.key).startTime"
                     class="w-full px-sm py-xs border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface bg-surface-container-lowest" />
            </div>
            <!-- وقت النهاية -->
            <div>
              <label class="font-label-md text-label-md text-on-surface mb-xs block">وقت النهاية</label>
              <input type="time"
                     [(ngModel)]="getSlot(day.key).endTime"
                     class="w-full px-sm py-xs border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface bg-surface-container-lowest" />
            </div>
            <!-- مدة الجلسة -->
            <div>
              <label class="font-label-md text-label-md text-on-surface mb-xs block">مدة الجلسة (دقيقة)</label>
              <select [(ngModel)]="getSlot(day.key).slotDurationMinutes"
                      class="w-full px-sm py-xs border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface bg-surface-container-lowest">
                <option value="15">15 دقيقة</option>
                <option value="20">20 دقيقة</option>
                <option value="30">30 دقيقة</option>
                <option value="45">45 دقيقة</option>
                <option value="60">ساعة كاملة</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- زرار الحفظ -->
    <div class="mt-lg flex justify-start">
      <button (click)="saveSchedule()"
              class="px-xl py-sm bg-primary text-on-primary font-label-md rounded-xl hover:bg-primary-container transition-colors">
        <span class="material-symbols-outlined text-[18px] align-middle ml-xs">save</span>
        حفظ الجدول
      </button>
    </div>

  </div>
</div>
```

---

## المرحلة 2 — Auth · Routing · Data

---

### المهمة 2 — إصلاح Redirect بعد تسجيل المريض

**المشكلة:** بعد register المريض يروح `dashboard/doctor` بدل `dashboard/patient`.

**الملف المتأثر:**
- `frontend/src/app/features/auth/register/register.component.ts`

**التعديل:**

```typescript
// register.component.ts
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// في دالة onSubmit أو register():
async register() {
  try {
    const response = await this.authService.register(this.formData).toPromise();

    // ✅ التوجيه الصحيح حسب الـ role
    const role = response?.user?.role || this.formData.role;

    if (role === 'doctor') {
      this.router.navigate(['/dashboard/doctor']);
    } else if (role === 'patient') {
      this.router.navigate(['/dashboard/patient']);
    } else if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/']);
    }

  } catch (error) {
    console.error('Registration failed:', error);
    this.errorMessage = 'حدث خطأ أثناء التسجيل، حاول مرة أخرى';
  }
}
```

**تحقق أيضاً في `auth.service.ts`:** بعد نجاح الـ login، نفس المنطق:

```typescript
// auth.service.ts
login(credentials): Observable<any> {
  return this.http.post('/api/auth/login', credentials).pipe(
    tap((response: any) => {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      // الـ redirect يتم في الـ component مش هنا
    })
  );
}

// helper method
getRoleBasedRoute(role: string): string {
  const routes: Record<string, string> = {
    patient: '/dashboard/patient',
    doctor:  '/dashboard/doctor',
    admin:   '/admin/dashboard',
  };
  return routes[role] || '/';
}
```

---

### المهمة 6 — Admin Dashboard بصلاحيات كاملة

**المطلوب:**
- حساب admin ثابت في الـ seed
- Admin dashboard يعرض: كل المرضى، كل الدكاترة، إحصائيات
- صلاحيات CRUD كاملة على أي entity

**الملفات المتأثرة (Backend):**
- `backend/models/Users.js` ← لا تعديل (admin role موجود)
- `backend/controllers/authController.js` ← إضافة seed admin
- `backend/middlewares/auth.js` ← middleware التحقق من admin
- `backend/routes/` ← routes خاصة بالـ admin

**الملفات المتأثرة (Frontend):**
- `frontend/src/app/features/` ← مجلد `admin/` جديد

**الخطوة 1 — Seed Admin Account:**

```javascript
// backend/seedAdmin.js (ملف جديد)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/Users');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const exists = await User.findOne({ email: 'admin@medbook.com' });
  if (exists) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const password_hash = await bcrypt.hash('Admin@MedBook2025', 12);

  await User.create({
    email: 'admin@medbook.com',
    password_hash,
    role: 'admin',
  });

  console.log('✅ Admin created: admin@medbook.com / Admin@MedBook2025');
  process.exit(0);
}

seedAdmin().catch(console.error);
```

```bash
# شغّل مرة واحدة:
node backend/seedAdmin.js
```

**بيانات الدخول:**
```
Email:    admin@medbook.com
Password: Admin@MedBook2025
```

**الخطوة 2 — Admin Middleware:**

```javascript
// backend/middlewares/isAdmin.js
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = isAdmin;
```

**الخطوة 3 — Admin Routes:**

```javascript
// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const User = require('../models/Users');
const Doctor = require('../models/Doctors');
const Patient = require('../models/Patients');
const Appointment = require('../models/Appointments');

// ✅ كل routes محمية بـ verifyToken + isAdmin
router.use(verifyToken, isAdmin);

// === Stats ===
router.get('/stats', async (req, res) => {
  try {
    const [doctors, patients, appointments] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Appointment.countDocuments(),
    ]);
    res.json({ doctors, patients, appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === Doctors CRUD ===
router.get('/doctors', async (req, res) => {
  const doctors = await Doctor.find().populate('userId', 'email createdAt');
  res.json(doctors);
});

router.delete('/doctors/:id', async (req, res) => {
  await Doctor.findByIdAndDelete(req.params.id);
  // حذف الـ user account أيضاً
  await User.findOneAndDelete({ _id: /* userId */ req.body.userId });
  res.json({ message: 'Doctor deleted' });
});

router.patch('/doctors/:id', async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(doctor);
});

// === Patients CRUD ===
router.get('/patients', async (req, res) => {
  const patients = await Patient.find().populate('userId', 'email createdAt');
  res.json(patients);
});

router.delete('/patients/:id', async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  await User.findByIdAndDelete(patient.userId);
  res.json({ message: 'Patient deleted' });
});

router.patch('/patients/:id', async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(patient);
});

// === Appointments (view all + force cancel) ===
router.get('/appointments', async (req, res) => {
  const appointments = await Appointment.find()
    .populate('patientId', 'fullName')
    .populate('doctorId', 'fullName specialization')
    .sort({ appointmentDate: -1 });
  res.json(appointments);
});

router.patch('/appointments/:id/cancel', async (req, res) => {
  const appt = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: 'Cancelled' },
    { new: true }
  );
  res.json(appt);
});

module.exports = router;
```

```javascript
// backend/index.js — أضف:
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);
```

**الخطوة 4 — Admin Frontend (Angular):**

```
frontend/src/app/features/admin/
├── admin.module.ts
├── admin-routing.module.ts
├── dashboard/
│   ├── admin-dashboard.component.ts
│   └── admin-dashboard.component.html
├── doctors-list/
│   ├── admin-doctors.component.ts
│   └── admin-doctors.component.html
└── patients-list/
    ├── admin-patients.component.ts
    └── admin-patients.component.html
```

```html
<!-- admin-dashboard.component.html -->
<div class="w-full pt-16 bg-background min-h-screen animate-fade-in" dir="rtl">
  <div class="max-w-container-max mx-auto px-md md:px-xl py-xl">
    <h1 class="font-headline-lg text-headline-lg text-on-surface mb-lg">لوحة تحكم الأدمين</h1>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-xl stagger-children">
      <div class="bg-primary-fixed rounded-xl p-md animate-fade-in-up">
        <p class="font-label-sm text-label-sm text-on-primary-fixed">عدد الأطباء</p>
        <p class="font-headline-lg text-headline-lg text-on-primary-fixed">{{ stats?.doctors }}</p>
      </div>
      <div class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant animate-fade-in-up">
        <p class="font-label-sm text-label-sm text-on-surface-variant">عدد المرضى</p>
        <p class="font-headline-lg text-headline-lg text-on-surface">{{ stats?.patients }}</p>
      </div>
      <div class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant animate-fade-in-up">
        <p class="font-label-sm text-label-sm text-on-surface-variant">إجمالي المواعيد</p>
        <p class="font-headline-lg text-headline-lg text-on-surface">{{ stats?.appointments }}</p>
      </div>
    </div>

    <!-- Quick Navigation -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-gutter">
      <a routerLink="/admin/doctors"
         class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant card-hover flex items-center gap-md">
        <span class="material-symbols-outlined text-primary text-[32px]">medical_services</span>
        <div>
          <p class="font-headline-sm text-headline-sm text-on-surface">إدارة الأطباء</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant">إضافة، تعديل، حذف الأطباء</p>
        </div>
      </a>
      <a routerLink="/admin/patients"
         class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant card-hover flex items-center gap-md">
        <span class="material-symbols-outlined text-primary text-[32px]">group</span>
        <div>
          <p class="font-headline-sm text-headline-sm text-on-surface">إدارة المرضى</p>
          <p class="font-body-sm text-body-sm text-on-surface-variant">عرض وتعديل بيانات المرضى</p>
        </div>
      </a>
    </div>
  </div>
</div>
```

---

### المهمة 10 — تظبيط أسماء الدكاترة في الـ Seed

**الملف المتأثر:**
- ملف الـ seed الخاص بالدكاترة (عادةً `backend/seed.js` أو `backend/seedDoctors.js`)

**الأسماء المقترحة (مصرية حقيقية + تخصصات):**

```javascript
const doctors = [
  {
    fullName: 'د. محمد عبد الرحمن',
    specialization: 'طب القلب والأوعية الدموية',
    education: 'MBBS، دكتوراه في القلب — جامعة القاهرة',
    qualifications: 'بورد أمريكي في القلب، عضو الجمعية المصرية للقلب',
    yearsOfExperience: 18,
    bio: 'استشاري أول طب القلب، متخصص في قسطرة القلب وعلاج الشرايين',
  },
  {
    fullName: 'د. سارة أحمد حسن',
    specialization: 'طب الأطفال',
    education: 'MBBS، ماجستير طب الأطفال — جامعة عين شمس',
    qualifications: 'عضو الجمعية المصرية لطب الأطفال',
    yearsOfExperience: 12,
    bio: 'طبيبة متخصصة في رعاية الأطفال وتغذيتهم وأمراض الجهاز التنفسي',
  },
  {
    fullName: 'د. خالد إبراهيم الشافعي',
    specialization: 'جراحة العظام والمفاصل',
    education: 'MBBS، دكتوراه في جراحة العظام — جامعة المنصورة',
    qualifications: 'استشاري جراحة العظام، زمالة الكلية الملكية البريطانية',
    yearsOfExperience: 22,
    bio: 'متخصص في استبدال مفصل الركبة والورك وإصابات الرياضيين',
  },
  {
    fullName: 'د. منى السيد عمر',
    specialization: 'أمراض النساء والتوليد',
    education: 'MBBS، ماجستير أمراض النساء — جامعة الإسكندرية',
    qualifications: 'عضو الجمعية المصرية لأطباء النساء والتوليد',
    yearsOfExperience: 15,
    bio: 'متخصصة في متابعة الحمل والولادة وعلاج الأمراض النسائية',
  },
  {
    fullName: 'د. أحمد محمود النجار',
    specialization: 'الطب الباطني',
    education: 'MBBS، دكتوراه في الباطنة — جامعة أسيوط',
    qualifications: 'استشاري الطب الباطني، عضو الجمعية الأوروبية للطب الداخلي',
    yearsOfExperience: 20,
    bio: 'متخصص في علاج السكري وضغط الدم وأمراض الغدة الدرقية',
  },
  {
    fullName: 'د. ريم حسن عبدالله',
    specialization: 'الأمراض الجلدية والتجميل',
    education: 'MBBS، ماجستير أمراض الجلد — جامعة القاهرة',
    qualifications: 'عضو الجمعية المصرية للجلدية',
    yearsOfExperience: 10,
    bio: 'متخصصة في الأمراض الجلدية والليزر وعلاج مشاكل الشعر والأظافر',
  },
  {
    fullName: 'د. عمر فاروق حسين',
    specialization: 'طب وجراحة العيون',
    education: 'MBBS، دكتوراه في طب العيون — جامعة القاهرة',
    qualifications: 'استشاري طب العيون، زمالة الكلية الملكية للجراحين',
    yearsOfExperience: 16,
    bio: 'متخصص في تصحيح النظر بالليزر وجراحة الماء الأبيض',
  },
  {
    fullName: 'د. نهى كامل إبراهيم',
    specialization: 'الطب النفسي',
    education: 'MBBS، دكتوراه في الطب النفسي — جامعة عين شمس',
    qualifications: 'عضو الجمعية المصرية للطب النفسي، زمالة دولية في العلاج المعرفي',
    yearsOfExperience: 14,
    bio: 'متخصصة في علاج الاكتئاب والقلق وإدارة الضغوط النفسية',
  },
];
```

---

## المرحلة 3 — Features & Business Logic

---

### المهمة 4 — Dark Mode يتحفظ ويتطبق في المشروع كله

**الملفات المتأثرة:**
- `frontend/src/app/core/services/theme.service.ts` ← جديد
- `frontend/src/app/app.component.ts` ← تطبيق الـ class
- صفحة الإعدادات (settings component)
- `frontend/src/styles.css` ← dark mode variables

**الخطوة 1 — `ThemeService`:**

```typescript
// frontend/src/app/core/services/theme.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'medbook_theme';

  // القيمة الابتدائية من localStorage
  private _theme$ = new BehaviorSubject<Theme>(this.getSavedTheme());
  theme$ = this._theme$.asObservable();

  get currentTheme(): Theme {
    return this._theme$.value;
  }

  // يُستدعى من زرار Toggle (لا يحفظ بعد — ينتظر زرار الحفظ)
  previewTheme(theme: Theme): void {
    this.applyTheme(theme);
    this._theme$.next(theme);
  }

  // يُستدعى من زرار "حفظ" في صفحة الإعدادات
  saveTheme(theme: Theme): void {
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme(theme);
    this._theme$.next(theme);
  }

  // يُطبَّق عند فتح التطبيق (من AppComponent)
  initTheme(): void {
    this.applyTheme(this.getSavedTheme());
  }

  private getSavedTheme(): Theme {
    return (localStorage.getItem(this.STORAGE_KEY) as Theme) || 'light';
  }

  private applyTheme(theme: Theme): void {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }
}
```

**الخطوة 2 — `AppComponent` يبدأ الـ theme:**

```typescript
// app.component.ts
import { ThemeService } from './core/services/theme.service';

export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // يطبق الـ theme المحفوظ فور فتح التطبيق
    this.themeService.initTheme();
  }
}
```

**الخطوة 3 — صفحة الإعدادات:**

```typescript
// settings.component.ts
export class SettingsComponent implements OnInit {
  selectedTheme: 'light' | 'dark' = 'light';
  savedTheme: 'light' | 'dark' = 'light'; // لمعرفة هل في تغيير

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.selectedTheme = this.themeService.currentTheme;
    this.savedTheme = this.selectedTheme;
  }

  onThemeChange(theme: 'light' | 'dark') {
    this.selectedTheme = theme;
    // Preview فوري بدون حفظ
    this.themeService.previewTheme(theme);
  }

  saveSettings() {
    // حفظ الـ theme فقط عند الضغط على "حفظ"
    this.themeService.saveTheme(this.selectedTheme);
    this.savedTheme = this.selectedTheme;
    // أي إعدادات تانية...
    alert('تم حفظ الإعدادات');
  }
}
```

```html
<!-- settings.component.html -->
<div class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant mb-gutter">
  <h2 class="font-headline-sm text-headline-sm text-on-surface mb-md">المظهر</h2>

  <div class="flex gap-sm">
    <!-- Light Mode Card -->
    <button
      (click)="onThemeChange('light')"
      [class]="selectedTheme === 'light'
        ? 'flex-1 p-md rounded-xl border-2 border-primary bg-surface-container-low transition-all'
        : 'flex-1 p-md rounded-xl border border-outline-variant hover:border-outline transition-all'">
      <span class="material-symbols-outlined text-[28px] text-amber-500 block mb-xs">light_mode</span>
      <p class="font-label-md text-label-md text-on-surface">فاتح</p>
    </button>

    <!-- Dark Mode Card -->
    <button
      (click)="onThemeChange('dark')"
      [class]="selectedTheme === 'dark'
        ? 'flex-1 p-md rounded-xl border-2 border-primary bg-surface-container-low transition-all'
        : 'flex-1 p-md rounded-xl border border-outline-variant hover:border-outline transition-all'">
      <span class="material-symbols-outlined text-[28px] text-primary block mb-xs">dark_mode</span>
      <p class="font-label-md text-label-md text-on-surface">داكن</p>
    </button>
  </div>
</div>

<!-- زرار الحفظ (ضروري قبل التطبيق الدائم) -->
<button
  (click)="saveSettings()"
  class="w-full md:w-auto px-xl py-sm bg-primary text-on-primary font-label-md rounded-xl hover:bg-primary-container transition-colors">
  <span class="material-symbols-outlined text-[18px] align-middle ml-xs">save</span>
  حفظ الإعدادات
</button>
```

**الخطوة 4 — Dark Mode CSS في `styles.css`:**

```css
/* styles.css */
/* Dark mode overrides */
.dark {
  --color-background: #191c1d;
  --color-surface: #1e2122;
  --color-surface-container-lowest: #14181a;
  --color-surface-container-low: #191c1d;
  --color-surface-container: #1e2122;
  --color-on-surface: #e1e3e4;
  --color-on-surface-variant: #bcc9c6;
  --color-outline: #6d7a77;
  --color-outline-variant: #3d4947;
  --color-primary: #6bd8cb;
  --color-on-primary: #003732;
}

.dark body {
  background-color: var(--color-background);
  color: var(--color-on-surface);
}
```

---

### المهمة 5 — تغيير اللغة (عربي/إنجليزي) في المشروع كله

**الملفات المتأثرة:**
- `frontend/src/app/core/services/language.service.ts` ← جديد
- `frontend/src/assets/i18n/ar.json` ← ملف عربي
- `frontend/src/assets/i18n/en.json` ← ملف إنجليزي
- صفحة الإعدادات

**الخطوة 1 — ملفات الترجمة:**

```json
// frontend/src/assets/i18n/ar.json
{
  "nav": {
    "findDoctor": "ابحث عن طبيب",
    "myAppointments": "مواعيدي",
    "prescriptions": "الروشيتات",
    "settings": "الإعدادات",
    "logout": "تسجيل الخروج"
  },
  "appointments": {
    "title": "مواعيدي",
    "subtitle": "تابع مواعيدك القادمة واستعرض السجل الطبي",
    "upcoming": "القادمة",
    "completed": "المكتملة",
    "cancelled": "الملغاة",
    "bookNow": "احجز الآن",
    "cancel": "إلغاء الموعد",
    "confirm": "تأكيد الموعد",
    "status": {
      "Pending": "بانتظار التأكيد",
      "Confirmed": "مؤكد",
      "Completed": "مكتمل",
      "Cancelled": "ملغي",
      "No-Show": "لم يحضر"
    }
  },
  "settings": {
    "title": "الإعدادات",
    "appearance": "المظهر",
    "light": "فاتح",
    "dark": "داكن",
    "language": "اللغة",
    "save": "حفظ الإعدادات",
    "saved": "تم الحفظ"
  },
  "days": {
    "Saturday":  "السبت",
    "Sunday":    "الأحد",
    "Monday":    "الاثنين",
    "Tuesday":   "الثلاثاء",
    "Wednesday": "الأربعاء",
    "Thursday":  "الخميس",
    "Friday":    "الجمعة"
  }
}
```

```json
// frontend/src/assets/i18n/en.json
{
  "nav": {
    "findDoctor": "Find a Doctor",
    "myAppointments": "My Appointments",
    "prescriptions": "Prescriptions",
    "settings": "Settings",
    "logout": "Logout"
  },
  "appointments": {
    "title": "My Appointments",
    "subtitle": "Track your upcoming visits and medical history",
    "upcoming": "Upcoming",
    "completed": "Completed",
    "cancelled": "Cancelled",
    "bookNow": "Book Now",
    "cancel": "Cancel Appointment",
    "confirm": "Confirm",
    "status": {
      "Pending": "Pending",
      "Confirmed": "Confirmed",
      "Completed": "Completed",
      "Cancelled": "Cancelled",
      "No-Show": "No Show"
    }
  },
  "settings": {
    "title": "Settings",
    "appearance": "Appearance",
    "light": "Light",
    "dark": "Dark",
    "language": "Language",
    "save": "Save Settings",
    "saved": "Saved"
  },
  "days": {
    "Saturday":  "Saturday",
    "Sunday":    "Sunday",
    "Monday":    "Monday",
    "Tuesday":   "Tuesday",
    "Wednesday": "Wednesday",
    "Thursday":  "Thursday",
    "Friday":    "Friday"
  }
}
```

**الخطوة 2 — `LanguageService`:**

```typescript
// frontend/src/app/core/services/language.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export type Lang = 'ar' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'medbook_lang';
  private _lang$ = new BehaviorSubject<Lang>(this.getSavedLang());
  private _translations: Record<string, any> = {};

  lang$ = this._lang$.asObservable();

  constructor(private http: HttpClient) {
    this.loadTranslations(this.getSavedLang());
  }

  get currentLang(): Lang { return this._lang$.value; }
  get isRTL(): boolean { return this._lang$.value === 'ar'; }

  translate(key: string): string {
    const keys = key.split('.');
    let val: any = this._translations;
    for (const k of keys) {
      val = val?.[k];
      if (val === undefined) return key;
    }
    return val || key;
  }

  // Preview بدون حفظ
  previewLang(lang: Lang): void {
    this.applyLang(lang);
    this._lang$.next(lang);
    this.loadTranslations(lang);
  }

  // حفظ دائم
  saveLang(lang: Lang): void {
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.applyLang(lang);
    this._lang$.next(lang);
    this.loadTranslations(lang);
  }

  initLang(): void {
    this.applyLang(this.getSavedLang());
    this.loadTranslations(this.getSavedLang());
  }

  private getSavedLang(): Lang {
    return (localStorage.getItem(this.STORAGE_KEY) as Lang) || 'ar';
  }

  private applyLang(lang: Lang): void {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }

  private loadTranslations(lang: Lang): void {
    this.http.get<Record<string, any>>(`/assets/i18n/${lang}.json`).subscribe(t => {
      this._translations = t;
    });
  }
}
```

**الخطوة 3 — Pipe للترجمة:**

```typescript
// frontend/src/app/shared/pipes/translate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  constructor(private lang: LanguageService) {}
  transform(key: string): string {
    return this.lang.translate(key);
  }
}
```

**الاستخدام في templates:**

```html
<!-- أي template -->
<h1>{{ 'appointments.title' | translate }}</h1>
<button>{{ 'nav.findDoctor' | translate }}</button>
```

---

### المهمة 13 — إصلاح فشل تحميل التشخيصات في medical/catalog

**المشكلة:** التشخيصات مش بتتحمل في صفحة الكتالوج.

**خطوات التشخيص والإصلاح:**

**الخطوة 1 — تحقق من Backend:**

```javascript
// backend/routes/Diagnosisroutes.js
// تأكد إن الـ route موجود ومتصل:
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const DiagnosisController = require('../controllers/DiagnosisController');

// ✅ GET كل التشخيصات
router.get('/', verifyToken, DiagnosisController.getAll);

// ✅ Search
router.get('/search', verifyToken, DiagnosisController.search);

module.exports = router;
```

```javascript
// backend/controllers/DiagnosisController.js
// تأكد إن getAll موجودة وصح:
const Diagnosis = require('../models/Diagnosis');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = search
      ? { $or: [
          { name: { $regex: search, $options: 'i' } },
          { icdCode: { $regex: search, $options: 'i' } }
        ]}
      : {};

    const [diagnoses, total] = await Promise.all([
      Diagnosis.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ name: 1 }),
      Diagnosis.countDocuments(query)
    ]);

    res.json({ diagnoses, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Diagnosis getAll error:', err);
    res.status(500).json({ message: err.message });
  }
};
```

```javascript
// backend/index.js — تأكد الـ route متعرف عليه:
const diagnosisRoutes = require('./routes/Diagnosisroutes');
app.use('/api/diagnoses', diagnosisRoutes);
```

**الخطوة 2 — تحقق من Frontend:**

```typescript
// catalog.service.ts
getDiagnoses(page = 1, search = ''): Observable<any> {
  // ✅ تأكد المسار صح
  return this.http.get(`/api/diagnoses?page=${page}&search=${search}&limit=20`);
}
```

```typescript
// catalog-management.component.ts
ngOnInit() {
  this.loadDiagnoses();
}

loadDiagnoses() {
  this.loading = true;
  this.catalogService.getDiagnoses().subscribe({
    next: (res) => {
      this.diagnoses = res.diagnoses;
      this.loading = false;
    },
    error: (err) => {
      console.error('Failed to load diagnoses:', err);
      this.errorMessage = 'فشل تحميل التشخيصات';
      this.loading = false;
    }
  });
}
```

**أسباب المشكلة الشائعة:**
- الـ route مش معرّف في `index.js`
- الـ token مش بيتبعت في الـ request
- اسم الـ collection في MongoDB مختلف عن المتوقع
- الـ Diagnosis model مش export صح

---

### المهمة 14 — إضافة 100 دواء في الـ Seed

**الملف:** `backend/seedMedications.js` (جديد)

```javascript
// backend/seedMedications.js
const mongoose = require('mongoose');
const Medication = require('./models/Medications');
require('dotenv').config();

const medications = [
  // ========= قلب وضغط (Cardiology) =========
  { name: 'أتينولول 50مج', genericName: 'Atenolol', type: 'خافض ضغط - حاصر بيتا' },
  { name: 'أملوديبين 5مج', genericName: 'Amlodipine', type: 'خافض ضغط - حاصر كالسيوم' },
  { name: 'ليزينوبريل 10مج', genericName: 'Lisinopril', type: 'خافض ضغط - ACE مثبط' },
  { name: 'لوسارتان 50مج', genericName: 'Losartan', type: 'خافض ضغط - ARB' },
  { name: 'هيدروكلوروثيازيد 25مج', genericName: 'Hydrochlorothiazide', type: 'مدر للبول' },
  { name: 'فيروسيمايد 40مج', genericName: 'Furosemide', type: 'مدر للبول قوي' },
  { name: 'واقين 5مج', genericName: 'Warfarin', type: 'مضاد تخثر' },
  { name: 'أسبرين 100مج', genericName: 'Aspirin', type: 'مضاد تخثر - مسكن' },
  { name: 'كلوبيدوجريل 75مج', genericName: 'Clopidogrel', type: 'مضاد تخثر' },
  { name: 'أتورفاستاتين 20مج', genericName: 'Atorvastatin', type: 'خافض كوليسترول - ستاتين' },
  { name: 'روسوفاستاتين 10مج', genericName: 'Rosuvastatin', type: 'خافض كوليسترول - ستاتين' },
  { name: 'نيتروجليسرين قرص', genericName: 'Nitroglycerin', type: 'موسع أوعية - طارئ' },
  { name: 'إيزوسوربيد مونونيترات 40مج', genericName: 'Isosorbide Mononitrate', type: 'موسع أوعية' },
  { name: 'ديجوكسين 0.25مج', genericName: 'Digoxin', type: 'مقوي عضلة القلب' },
  { name: 'أميودارون 200مج', genericName: 'Amiodarone', type: 'مضاد اضطرابات نظم القلب' },

  // ========= سكري (Endocrinology) =========
  { name: 'ميتفورمين 500مج', genericName: 'Metformin', type: 'خافض سكر - بيجوانيد' },
  { name: 'ميتفورمين 1000مج', genericName: 'Metformin', type: 'خافض سكر - بيجوانيد' },
  { name: 'جليبينكلاميد 5مج', genericName: 'Glibenclamide', type: 'خافض سكر - سلفونيلوريا' },
  { name: 'جليكلازيد 80مج', genericName: 'Gliclazide', type: 'خافض سكر - سلفونيلوريا' },
  { name: 'سيتاجليبتين 100مج', genericName: 'Sitagliptin', type: 'خافض سكر - DPP-4' },
  { name: 'إمباجليفلوزين 10مج', genericName: 'Empagliflozin', type: 'خافض سكر - SGLT-2' },
  { name: 'أنسولين نوفومكس 30', genericName: 'Insulin Novomix', type: 'أنسولين مخلوط' },
  { name: 'أنسولين جلارجين', genericName: 'Insulin Glargine', type: 'أنسولين بطيء' },
  { name: 'ليفوثيروكسين 50ميكروجرام', genericName: 'Levothyroxine', type: 'هرمون الغدة الدرقية' },
  { name: 'ليفوثيروكسين 100ميكروجرام', genericName: 'Levothyroxine', type: 'هرمون الغدة الدرقية' },

  // ========= مضادات حيوية (Antibiotics) =========
  { name: 'أموكسيسيلين 500مج', genericName: 'Amoxicillin', type: 'مضاد حيوي - بنسيلين' },
  { name: 'أوجمنتين 1جم', genericName: 'Amoxicillin/Clavulanate', type: 'مضاد حيوي - بنسيلين مقوى' },
  { name: 'أزيثروميسين 500مج', genericName: 'Azithromycin', type: 'مضاد حيوي - ماكروليد' },
  { name: 'كلاريثروميسين 500مج', genericName: 'Clarithromycin', type: 'مضاد حيوي - ماكروليد' },
  { name: 'سيبروفلوكساسين 500مج', genericName: 'Ciprofloxacin', type: 'مضاد حيوي - فلوروكينولون' },
  { name: 'ليفوفلوكساسين 500مج', genericName: 'Levofloxacin', type: 'مضاد حيوي - فلوروكينولون' },
  { name: 'ميترونيدازول 500مج', genericName: 'Metronidazole', type: 'مضاد حيوي - نيتروإيميدازول' },
  { name: 'دوكسيسيكلين 100مج', genericName: 'Doxycycline', type: 'مضاد حيوي - تيتراسيكلين' },
  { name: 'سيفاليكسين 500مج', genericName: 'Cefalexin', type: 'مضاد حيوي - سيفالوسبورين' },
  { name: 'سيفيكسيم 400مج', genericName: 'Cefixime', type: 'مضاد حيوي - سيفالوسبورين' },
  { name: 'كليندامايسين 300مج', genericName: 'Clindamycin', type: 'مضاد حيوي - لينكوساميد' },

  // ========= مسكنات (Pain Management) =========
  { name: 'باراسيتامول 500مج', genericName: 'Paracetamol', type: 'مسكن - خافض حرارة' },
  { name: 'باراسيتامول 1جم IV', genericName: 'Paracetamol IV', type: 'مسكن وريدي' },
  { name: 'إيبوبروفين 400مج', genericName: 'Ibuprofen', type: 'مسكن - NSAIDs' },
  { name: 'ديكلوفيناك 50مج', genericName: 'Diclofenac', type: 'مسكن - NSAIDs' },
  { name: 'ديكلوفيناك جل', genericName: 'Diclofenac Gel', type: 'مسكن موضعي' },
  { name: 'نابروكسين 500مج', genericName: 'Naproxen', type: 'مسكن - NSAIDs' },
  { name: 'كيتوبروفين 100مج', genericName: 'Ketoprofen', type: 'مسكن - NSAIDs' },
  { name: 'ترامادول 50مج', genericName: 'Tramadol', type: 'مسكن - أفيوني خفيف' },
  { name: 'كودايين 30مج', genericName: 'Codeine', type: 'مسكن - أفيوني' },
  { name: 'بريجابالين 75مج', genericName: 'Pregabalin', type: 'مسكن ألم عصبي' },

  // ========= معدة وجهاز هضمي (Gastroenterology) =========
  { name: 'أوميبرازول 20مج', genericName: 'Omeprazole', type: 'مثبط مضخة البروتون' },
  { name: 'بانتوبرازول 40مج', genericName: 'Pantoprazole', type: 'مثبط مضخة البروتون' },
  { name: 'إيزوميبرازول 40مج', genericName: 'Esomeprazole', type: 'مثبط مضخة البروتون' },
  { name: 'رانيتيدين 150مج', genericName: 'Ranitidine', type: 'مضاد H2' },
  { name: 'ميتوكلوبراميد 10مج', genericName: 'Metoclopramide', type: 'مضاد قيء - محرك معوي' },
  { name: 'دومبيريدون 10مج', genericName: 'Domperidone', type: 'محرك معوي - مضاد قيء' },
  { name: 'أونداسيترون 4مج', genericName: 'Ondansetron', type: 'مضاد قيء - 5-HT3' },
  { name: 'لوبيراميد 2مج', genericName: 'Loperamide', type: 'مضاد إسهال' },
  { name: 'بيسيكوديل 5مج', genericName: 'Bisacodyl', type: 'ملين' },
  { name: 'لاكتولوز شراب', genericName: 'Lactulose', type: 'ملين أوسموزي' },
  { name: 'رابيبرازول 20مج', genericName: 'Rabeprazole', type: 'مثبط مضخة البروتون' },

  // ========= الجهاز التنفسي (Pulmonology) =========
  { name: 'سالبوتامول بخاخ', genericName: 'Salbutamol Inhaler', type: 'موسع شعب - قصير المفعول' },
  { name: 'فلوتيكازون بخاخ', genericName: 'Fluticasone Inhaler', type: 'كورتيزون استنشاق' },
  { name: 'بديسونيد بخاخ', genericName: 'Budesonide Inhaler', type: 'كورتيزون استنشاق' },
  { name: 'مونتيلوكاست 10مج', genericName: 'Montelukast', type: 'مضاد مستقبلات ليكوترين' },
  { name: 'ثيوفيلين 100مج', genericName: 'Theophylline', type: 'موسع شعب - زانثين' },
  { name: 'ديكساميثازون 4مج', genericName: 'Dexamethasone', type: 'كورتيزون جهازي' },
  { name: 'بريدنيزون 5مج', genericName: 'Prednisone', type: 'كورتيزون جهازي' },
  { name: 'ناك 600مج', genericName: 'N-Acetylcysteine', type: 'مذيب بلغم' },
  { name: 'أمبروكسول 30مج', genericName: 'Ambroxol', type: 'مذيب بلغم' },
  { name: 'كودايين شراب', genericName: 'Codeine Syrup', type: 'مضاد سعال' },

  // ========= الجهاز العصبي / نفسي =========
  { name: 'فلوكسيتين 20مج', genericName: 'Fluoxetine', type: 'مضاد اكتئاب - SSRI' },
  { name: 'سيرترالين 50مج', genericName: 'Sertraline', type: 'مضاد اكتئاب - SSRI' },
  { name: 'إيسيتالوبرام 10مج', genericName: 'Escitalopram', type: 'مضاد اكتئاب - SSRI' },
  { name: 'أميتريبتيلين 25مج', genericName: 'Amitriptyline', type: 'مضاد اكتئاب ثلاثي' },
  { name: 'فينلافاكسين 75مج', genericName: 'Venlafaxine', type: 'مضاد اكتئاب - SNRI' },
  { name: 'ألبرازولام 0.25مج', genericName: 'Alprazolam', type: 'مضاد قلق - بنزوديازيبين' },
  { name: 'ديازيبام 5مج', genericName: 'Diazepam', type: 'مضاد قلق - بنزوديازيبين' },
  { name: 'هالوبيريدول 5مج', genericName: 'Haloperidol', type: 'مضاد ذهان - تقليدي' },
  { name: 'أوليانزابين 5مج', genericName: 'Olanzapine', type: 'مضاد ذهان - غير تقليدي' },
  { name: 'زولبيديم 10مج', genericName: 'Zolpidem', type: 'منوم' },
  { name: 'فينيتوين 100مج', genericName: 'Phenytoin', type: 'مضاد صرع' },
  { name: 'كاربامازيبين 200مج', genericName: 'Carbamazepine', type: 'مضاد صرع' },
  { name: 'ليفيتيراسيتام 500مج', genericName: 'Levetiracetam', type: 'مضاد صرع' },

  // ========= عظام ومفاصل =========
  { name: 'ميثوتريكسات 7.5مج', genericName: 'Methotrexate', type: 'مضاد روماتيزم' },
  { name: 'هيدروكسي كلوروكين 200مج', genericName: 'Hydroxychloroquine', type: 'مضاد روماتيزم' },
  { name: 'ألندرونات 70مج', genericName: 'Alendronate', type: 'مضاد هشاشة عظام' },
  { name: 'كالسيوم + فيتامين D3', genericName: 'Calcium Carbonate + Vit D3', type: 'مكمل غذائي - عظام' },
  { name: 'كولشيسين 0.5مج', genericName: 'Colchicine', type: 'مضاد النقرس - حاد' },
  { name: 'ألوبيورينول 300مج', genericName: 'Allopurinol', type: 'خافض حمض اليوريك' },
  { name: 'ميلوكسيكام 15مج', genericName: 'Meloxicam', type: 'مسكن - NSAIDs انتقائي' },

  // ========= جلدية =========
  { name: 'بيتاميثازون كريم', genericName: 'Betamethasone Cream', type: 'كورتيزون موضعي' },
  { name: 'هيدروكورتيزون كريم 1%', genericName: 'Hydrocortisone Cream', type: 'كورتيزون موضعي خفيف' },
  { name: 'كلوتريمازول كريم', genericName: 'Clotrimazole Cream', type: 'مضاد فطريات موضعي' },
  { name: 'فلوكونازول 150مج', genericName: 'Fluconazole', type: 'مضاد فطريات جهازي' },
  { name: 'أسيكلوفير 200مج', genericName: 'Acyclovir', type: 'مضاد فيروسات' },
  { name: 'تريتينوين كريم 0.025%', genericName: 'Tretinoin Cream', type: 'ريتينويد موضعي' },
  { name: 'بنزويل بيروكسيد 5%', genericName: 'Benzoyl Peroxide', type: 'علاج حب الشباب' },
  { name: 'إيزوتريتينوين 10مج', genericName: 'Isotretinoin', type: 'علاج حب الشباب - جهازي' },

  // ========= فيتامينات ومكملات =========
  { name: 'فيتامين D3 1000 وحدة', genericName: 'Cholecalciferol', type: 'فيتامين - مكمل' },
  { name: 'فيتامين B12 1000ميكروجرام', genericName: 'Cyanocobalamin', type: 'فيتامين - مكمل' },
  { name: 'حمض الفوليك 5مج', genericName: 'Folic Acid', type: 'فيتامين - مكمل' },
  { name: 'حديد فيروس سلفات 200مج', genericName: 'Ferrous Sulfate', type: 'مكمل حديد' },
  { name: 'زنك 10مج', genericName: 'Zinc', type: 'مكمل معدني' },
  { name: 'أوميجا 3 1000مج', genericName: 'Omega-3 Fish Oil', type: 'مكمل - أحماض دهنية' },
];

async function seedMedications() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  let added = 0, skipped = 0;

  for (const med of medications) {
    try {
      await Medication.create(med);
      added++;
    } catch (err) {
      if (err.code === 11000) {
        skipped++; // Duplicate — skip
      } else {
        console.error(`Error inserting ${med.name}:`, err.message);
      }
    }
  }

  console.log(`✅ Done: ${added} added, ${skipped} skipped (duplicates)`);
  process.exit(0);
}

seedMedications().catch(console.error);
```

```bash
# تشغيل الـ seed:
node backend/seedMedications.js
```

---

### المهمة 15 — إصلاح خطأ "slotDuration is not defined"

**المشكلة:** لما الدكتور يضيف إجازة (Schedule Exception) ويجي مريض يختار يوم في نفس الفترة، بيطلع خطأ `slotDuration is not defined`.

**السبب:** في `availabilityController.js`، لما اليوم يكون في فترة استثناء، الكود ما بيجيبش الـ `slotDurationMinutes` من الـ WeeklyAvailability قبل ما يحاول يحسب الـ slots.

**الملف المتأثر:**
- `backend/controllers/availabilityController.js`

**الإصلاح:**

```javascript
// availabilityController.js
const WeeklyAvailability = require('../models/WeeklyAvailability');
const ScheduleException = require('../models/ScheduleException');
const Appointment = require('../models/Appointments');

exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // 1. تحويل التاريخ
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // 2. ابحث عن جدول الدكتور ليوم الأسبوع ده
    const weeklySchedule = await WeeklyAvailability.findOne({
      doctorId,
      dayOfWeek,
    });

    // لو مافيش جدول لليوم ده — مش متاح
    if (!weeklySchedule) {
      return res.json({
        available: false,
        slots: [],
        message: 'الدكتور غير متاح في هذا اليوم من الأسبوع',
      });
    }

    // ✅ الإصلاح: استخرج الـ slotDuration هنا قبل أي شيء
    const slotDuration = weeklySchedule.slotDurationMinutes;

    // 3. تحقق من الاستثناءات
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const exception = await ScheduleException.findOne({
      doctorId,
      startDate: { $lte: endOfDay },
      endDate:   { $gte: startOfDay },
    });

    // لو في استثناء — مش متاح + ارجع السبب
    if (exception) {
      return res.json({
        available: false,
        slots: [],
        exceptionType: exception.type,
        message: `الدكتور غير متاح: ${
          exception.type === 'Vacation' ? 'إجازة' :
          exception.type === 'Emergency' ? 'طارئ' : 'محجوب'
        }${exception.reason ? ' — ' + exception.reason : ''}`,
      });
    }

    // 4. حساب الـ slots من startTime إلى endTime بفارق slotDuration
    const slots = generateSlots(
      weeklySchedule.startTime,
      weeklySchedule.endTime,
      slotDuration  // ✅ الآن متعرف عليها
    );

    // 5. احذف الـ slots المحجوزة مسبقاً
    const existingAppointments = await Appointment.find({
      doctorId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $in: ['Pending', 'Confirmed'] },
    });

    const bookedTimes = existingAppointments.map(a => a.appointmentTime);
    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

    return res.json({
      available: true,
      slots: availableSlots,
      slotDuration,
      workingHours: {
        start: weeklySchedule.startTime,
        end: weeklySchedule.endTime,
      },
    });

  } catch (err) {
    console.error('getAvailableSlots error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Helper — يولّد الـ slots
function generateSlots(startTime, endTime, durationMinutes) {
  const slots = [];

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += durationMinutes;
  }

  return slots;
}
```

---

## المرحلة 4 — ميزات متقدمة

---

### المهمة 16 — Calendar ديناميكي للمريض

**المطلوب:**
- الكالندر يعرض الأيام المتاحة للدكتور بس (حسب WeeklyAvailability)
- الأيام المغلقة أو الاستثناءات تتعطّل (disabled)
- لو المريض اختار يوم استثناء يجيله رسالة توضيحية

**Endpoint جديد في Backend:**

```javascript
// backend/routes/AppointmentRoutes.js — أضف:
router.get('/doctors/:doctorId/available-days', verifyToken, getAvailableDays);
```

```javascript
// backend/controllers/AppointmentController.js — أضف:
exports.getAvailableDays = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { month, year } = req.query; // مثلاً: month=8&year=2026

    const m = parseInt(month);
    const y = parseInt(year);

    // أيام الأسبوع اللي الدكتور شغال فيها
    const weeklySchedule = await WeeklyAvailability.find({ doctorId });
    const availableDayNames = weeklySchedule.map(s => s.dayOfWeek);
    // مثال: ['Saturday', 'Monday', 'Wednesday']

    // استثناءات الشهر ده
    const startOfMonth = new Date(y, m - 1, 1);
    const endOfMonth   = new Date(y, m, 0, 23, 59, 59);

    const exceptions = await ScheduleException.find({
      doctorId,
      startDate: { $lte: endOfMonth },
      endDate:   { $gte: startOfMonth },
    });

    // بناء قائمة الأيام
    const daysInMonth = new Date(y, m, 0).getDate();
    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(y, m - 1, day);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = date.toISOString().split('T')[0];

      const isWorkingDay = availableDayNames.includes(dayName);

      // تحقق هل اليوم في استثناء
      const exception = exceptions.find(ex => {
        const start = new Date(ex.startDate);
        const end   = new Date(ex.endDate);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        return date >= start && date <= end;
      });

      result.push({
        date:      dateStr,
        dayName,
        available: isWorkingDay && !exception,
        exception: exception ? {
          type:   exception.type,
          reason: exception.reason,
        } : null,
        isPast: date < new Date(new Date().setHours(0,0,0,0)),
      });
    }

    res.json({ days: result, availableDayNames });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

**Frontend — Booking Form Calendar:**

```typescript
// booking-form.component.ts
export class BookingFormComponent implements OnInit {
  availableDays: any[] = [];
  selectedDate: string | null = null;
  hoveredUnavailableDay: any = null;

  currentMonth = new Date().getMonth() + 1;
  currentYear  = new Date().getFullYear();

  loadAvailableDays(doctorId: string) {
    this.appointmentService
      .getAvailableDays(doctorId, this.currentMonth, this.currentYear)
      .subscribe(res => {
        this.availableDays = res.days;
      });
  }

  getDayInfo(dateStr: string) {
    return this.availableDays.find(d => d.date === dateStr);
  }

  selectDate(dateStr: string) {
    const info = this.getDayInfo(dateStr);
    if (!info || !info.available) return;
    this.selectedDate = dateStr;
    this.loadSlots(dateStr);
  }

  onHoverUnavailable(info: any) {
    if (info && !info.available && info.exception) {
      this.hoveredUnavailableDay = info;
    } else {
      this.hoveredUnavailableDay = null;
    }
  }
}
```

```html
<!-- booking-form.component.html — Calendar Section -->
<div class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant">
  <div class="flex items-center justify-between mb-md">
    <h3 class="font-headline-sm text-headline-sm text-on-surface">اختر تاريخ الكشف</h3>
    <div class="flex items-center gap-sm">
      <button (click)="prevMonth()" class="p-xs rounded-lg hover:bg-surface-container-low transition-colors">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
      <span class="font-label-md text-label-md text-on-surface">
        {{ currentMonth }}/{{ currentYear }}
      </span>
      <button (click)="nextMonth()" class="p-xs rounded-lg hover:bg-surface-container-low transition-colors">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
    </div>
  </div>

  <!-- رسالة الاستثناء -->
  <div *ngIf="hoveredUnavailableDay?.exception"
       class="mb-md p-sm bg-error-container rounded-lg flex items-start gap-xs animate-fade-in">
    <span class="material-symbols-outlined text-on-error-container text-[18px]">warning</span>
    <div>
      <p class="font-label-md text-label-md text-on-error-container">
        الدكتور غير متاح في هذا اليوم
      </p>
      <p class="font-body-sm text-body-sm text-on-error-container">
        {{ hoveredUnavailableDay.exception.type === 'Vacation' ? 'إجازة' :
           hoveredUnavailableDay.exception.type === 'Emergency' ? 'طارئ' : 'محجوب' }}
        {{ hoveredUnavailableDay.exception.reason ? '— ' + hoveredUnavailableDay.exception.reason : '' }}
      </p>
    </div>
  </div>

  <!-- Calendar Grid -->
  <div class="grid grid-cols-7 gap-xs">
    <!-- أيام الأسبوع -->
    <div *ngFor="let d of ['س','ح','ن','ث','ر','خ','ج']"
         class="text-center font-label-sm text-label-sm text-on-surface-variant py-xs">
      {{ d }}
    </div>

    <!-- أيام الشهر -->
    <ng-container *ngFor="let dayInfo of availableDays">
      <button
        [disabled]="!dayInfo.available || dayInfo.isPast"
        (click)="selectDate(dayInfo.date)"
        (mouseenter)="onHoverUnavailable(dayInfo)"
        (mouseleave)="hoveredUnavailableDay = null"
        [class]="getDayClass(dayInfo)">
        {{ dayInfo.date | slice:8:10 }}
        <!-- نقطة صغيرة للاستثناء -->
        <span *ngIf="dayInfo.exception && !dayInfo.isPast"
              class="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-error">
        </span>
      </button>
    </ng-container>
  </div>

  <!-- Legend -->
  <div class="flex flex-wrap gap-sm mt-md">
    <div class="flex items-center gap-xs">
      <div class="w-3 h-3 rounded-full bg-primary"></div>
      <span class="font-body-sm text-body-sm text-on-surface-variant">متاح</span>
    </div>
    <div class="flex items-center gap-xs">
      <div class="w-3 h-3 rounded-full bg-outline-variant"></div>
      <span class="font-body-sm text-body-sm text-on-surface-variant">غير متاح</span>
    </div>
    <div class="flex items-center gap-xs">
      <div class="w-3 h-3 rounded-full bg-error"></div>
      <span class="font-body-sm text-body-sm text-on-surface-variant">استثناء</span>
    </div>
  </div>
</div>
```

```typescript
// getDayClass helper:
getDayClass(dayInfo: any): string {
  const base = 'relative py-sm rounded-lg text-center font-label-sm transition-all ';
  if (dayInfo.isPast) return base + 'text-outline-variant cursor-not-allowed opacity-40';
  if (this.selectedDate === dayInfo.date) return base + 'bg-primary text-on-primary font-bold';
  if (dayInfo.exception) return base + 'bg-error-container text-on-error-container cursor-pointer opacity-70';
  if (!dayInfo.available) return base + 'text-outline-variant cursor-not-allowed';
  return base + 'bg-surface-container-low text-on-surface hover:bg-primary-fixed cursor-pointer';
}
```

---

### المهمة 17 — تجربة الروشيتة الكاملة (UX/UI)

**المطلوب:**
- الدكتور يختار أدوية من قائمة مع autocomplete
- يحدد الجرعة والمدة والتكرار
- بعد التأكيد تتحفظ وتظهر للمريض في patient history

**الملفات المتأثرة:**
- `frontend/src/app/features/medical/prescription-form/prescription-form.component.ts`
- `frontend/src/app/features/medical/prescription-form/prescription-form.component.html`
- `backend/controllers/Prescriptioncontroller.js`

**Frontend — Prescription Form:**

```typescript
// prescription-form.component.ts
export class PrescriptionFormComponent implements OnInit {
  // البيانات
  appointmentId: string;
  patientId: string;
  doctorId: string;

  // الأدوية المتاحة في الكتالوج
  allMedications: any[] = [];
  filteredMedications: any[] = [];
  searchTerm = '';

  // الروشيتة الحالية
  selectedMedications: PrescribedMedication[] = [];

  // التشخيصات
  allDiagnoses: any[] = [];
  selectedDiagnoses: string[] = [];

  // نوتة الدكتور
  notes = '';

  // حالة الفورم
  isSubmitting = false;
  submitted = false;

  ngOnInit() {
    this.loadMedications();
    this.loadDiagnoses();
  }

  loadMedications() {
    this.catalogService.getMedications().subscribe(res => {
      this.allMedications = res.medications;
      this.filteredMedications = this.allMedications;
    });
  }

  loadDiagnoses() {
    this.catalogService.getDiagnoses().subscribe(res => {
      this.allDiagnoses = res.diagnoses;
    });
  }

  onSearchMedication(term: string) {
    this.filteredMedications = this.allMedications.filter(m =>
      m.name.toLowerCase().includes(term.toLowerCase()) ||
      m.genericName?.toLowerCase().includes(term.toLowerCase())
    );
  }

  addMedication(med: any) {
    // لو مضافة قبل كده، لا تضيفها
    if (this.selectedMedications.find(m => m.medicationId === med._id)) return;

    this.selectedMedications.push({
      medicationId:  med._id,
      medicationName: med.name,
      genericName:   med.genericName,
      dosage:        '',
      frequency:     '',
      duration:      '',
      instructions:  '',
      notes:         '',
    });
    this.searchTerm = '';
    this.filteredMedications = this.allMedications;
  }

  removeMedication(index: number) {
    this.selectedMedications.splice(index, 1);
  }

  async submitPrescription() {
    // Validation
    if (this.selectedMedications.length === 0) {
      alert('أضف دواء واحد على الأقل');
      return;
    }

    const invalid = this.selectedMedications.find(
      m => !m.dosage || !m.frequency || !m.duration
    );
    if (invalid) {
      alert('تأكد من إدخال الجرعة والتكرار والمدة لكل دواء');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      appointmentId: this.appointmentId,
      patientId:     this.patientId,
      doctorId:      this.doctorId,
      diagnosisIds:  this.selectedDiagnoses,
      medications:   this.selectedMedications.map(m => ({
        medicationId:  m.medicationId,
        dosage:        m.dosage,
        frequency:     m.frequency,
        duration:      m.duration,
        instructions:  m.instructions,
        notes:         m.notes,
      })),
      notes: this.notes,
    };

    this.prescriptionService.create(payload).subscribe({
      next: () => {
        this.submitted = true;
        this.isSubmitting = false;
        // انتقل لصفحة patient history أو appointments
        this.router.navigate(['/medical/history']);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        alert('حدث خطأ أثناء حفظ الروشيتة');
      }
    });
  }
}

interface PrescribedMedication {
  medicationId:   string;
  medicationName: string;
  genericName?:   string;
  dosage:         string;
  frequency:      string;
  duration:       string;
  instructions:   string;
  notes:          string;
}
```

```html
<!-- prescription-form.component.html -->
<div class="w-full pt-16 bg-background min-h-screen animate-fade-in" dir="rtl">
  <div class="max-w-4xl mx-auto px-md py-xl">

    <div class="mb-lg">
      <h1 class="font-headline-lg text-headline-lg text-on-surface mb-xs">كتابة الروشيتة</h1>
      <p class="font-body-md text-body-md text-on-surface-variant">
        اختر الأدوية وحدد الجرعات والمدة
      </p>
    </div>

    <!-- اختيار التشخيص -->
    <div class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant mb-gutter">
      <h2 class="font-headline-sm text-headline-sm text-on-surface mb-md flex items-center gap-xs">
        <span class="material-symbols-outlined text-primary">diagnosis</span>
        التشخيص
      </h2>
      <div class="flex flex-wrap gap-xs">
        <label *ngFor="let diag of allDiagnoses"
               class="inline-flex items-center gap-xs px-sm py-xs rounded-full border cursor-pointer transition-all"
               [class]="selectedDiagnoses.includes(diag._id)
                 ? 'border-primary bg-primary-fixed text-on-primary-fixed'
                 : 'border-outline-variant hover:border-primary text-on-surface-variant'">
          <input type="checkbox" class="hidden"
                 [checked]="selectedDiagnoses.includes(diag._id)"
                 (change)="toggleDiagnosis(diag._id)" />
          {{ diag.name }}
        </label>
      </div>
    </div>

    <!-- إضافة الأدوية -->
    <div class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant mb-gutter">
      <h2 class="font-headline-sm text-headline-sm text-on-surface mb-md flex items-center gap-xs">
        <span class="material-symbols-outlined text-primary">medication</span>
        الأدوية
      </h2>

      <!-- Search Bar -->
      <div class="relative mb-md">
        <span class="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (ngModelChange)="onSearchMedication($event)"
          placeholder="ابحث عن دواء..."
          class="w-full pr-xl pl-sm py-xs border border-outline rounded-lg focus:border-primary focus:outline-none bg-surface-container-lowest text-on-surface" />
      </div>

      <!-- قائمة الأدوية المقترحة -->
      <div *ngIf="searchTerm" class="border border-outline rounded-lg overflow-hidden mb-md max-h-48 overflow-y-auto">
        <button
          *ngFor="let med of filteredMedications | slice:0:8"
          (click)="addMedication(med)"
          class="w-full flex items-center justify-between px-md py-sm hover:bg-surface-container-low transition-colors border-b border-outline-variant last:border-0">
          <div class="text-right">
            <p class="font-label-md text-label-md text-on-surface">{{ med.name }}</p>
            <p class="font-body-sm text-body-sm text-on-surface-variant">{{ med.genericName }} · {{ med.type }}</p>
          </div>
          <span class="material-symbols-outlined text-primary text-[20px]">add_circle</span>
        </button>
        <div *ngIf="filteredMedications.length === 0"
             class="px-md py-sm text-on-surface-variant font-body-sm">
          لم يتم العثور على نتائج
        </div>
      </div>

      <!-- الأدوية المضافة -->
      <div class="flex flex-col gap-md">
        <div *ngFor="let med of selectedMedications; let i = index"
             class="bg-surface-container-low rounded-xl p-md border border-outline-variant animate-fade-in-up">

          <!-- اسم الدواء -->
          <div class="flex items-start justify-between mb-md">
            <div>
              <p class="font-headline-sm text-headline-sm text-on-surface">{{ med.medicationName }}</p>
              <p class="font-body-sm text-body-sm text-on-surface-variant">{{ med.genericName }}</p>
            </div>
            <button (click)="removeMedication(i)"
                    class="p-xs rounded-lg hover:bg-error-container transition-colors">
              <span class="material-symbols-outlined text-error text-[20px]">delete</span>
            </button>
          </div>

          <!-- تفاصيل الجرعة — grid 3 أعمدة -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-sm mb-sm">
            <div>
              <label class="font-label-sm text-label-sm text-on-surface-variant mb-xs block">الجرعة *</label>
              <input type="text"
                     [(ngModel)]="med.dosage"
                     placeholder="مثال: 500مج"
                     class="w-full px-sm py-xs border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface bg-surface-container-lowest" />
            </div>
            <div>
              <label class="font-label-sm text-label-sm text-on-surface-variant mb-xs block">التكرار *</label>
              <select [(ngModel)]="med.frequency"
                      class="w-full px-sm py-xs border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface bg-surface-container-lowest">
                <option value="">اختر التكرار</option>
                <option value="مرة يومياً">مرة يومياً</option>
                <option value="مرتين يومياً">مرتين يومياً</option>
                <option value="3 مرات يومياً">3 مرات يومياً</option>
                <option value="4 مرات يومياً">4 مرات يومياً</option>
                <option value="كل 8 ساعات">كل 8 ساعات</option>
                <option value="كل 12 ساعة">كل 12 ساعة</option>
                <option value="عند الحاجة">عند الحاجة</option>
              </select>
            </div>
            <div>
              <label class="font-label-sm text-label-sm text-on-surface-variant mb-xs block">المدة *</label>
              <select [(ngModel)]="med.duration"
                      class="w-full px-sm py-xs border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface bg-surface-container-lowest">
                <option value="">اختر المدة</option>
                <option value="3 أيام">3 أيام</option>
                <option value="5 أيام">5 أيام</option>
                <option value="7 أيام">أسبوع</option>
                <option value="10 أيام">10 أيام</option>
                <option value="14 يوم">أسبوعان</option>
                <option value="شهر">شهر</option>
                <option value="مستمر">مستمر</option>
              </select>
            </div>
          </div>

          <!-- تعليمات إضافية -->
          <div>
            <label class="font-label-sm text-label-sm text-on-surface-variant mb-xs block">تعليمات إضافية</label>
            <input type="text"
                   [(ngModel)]="med.instructions"
                   placeholder="مثال: بعد الأكل، ابتعد عن القيادة..."
                   class="w-full px-sm py-xs border border-outline rounded-lg focus:border-primary focus:outline-none text-on-surface bg-surface-container-lowest" />
          </div>
        </div>

        <!-- رسالة لو مافيش أدوية -->
        <div *ngIf="selectedMedications.length === 0"
             class="text-center py-xl text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl">
          <span class="material-symbols-outlined text-[48px] block mb-xs opacity-40">medication</span>
          ابحث وأضف الأدوية من خانة البحث أعلاه
        </div>
      </div>
    </div>

    <!-- ملاحظات الدكتور -->
    <div class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant mb-gutter">
      <h2 class="font-headline-sm text-headline-sm text-on-surface mb-md flex items-center gap-xs">
        <span class="material-symbols-outlined text-primary">note</span>
        ملاحظات الدكتور
      </h2>
      <textarea
        [(ngModel)]="notes"
        rows="4"
        placeholder="أي تعليمات أو ملاحظات إضافية للمريض..."
        class="w-full px-sm py-xs border border-outline rounded-lg focus:border-primary focus:outline-none resize-none text-on-surface bg-surface-container-lowest">
      </textarea>
    </div>

    <!-- زرار الحفظ -->
    <div class="flex items-center justify-between">
      <button routerLink="../"
              class="px-lg py-sm border border-outline text-on-surface font-label-md rounded-xl hover:bg-surface-container-low transition-colors">
        إلغاء
      </button>
      <button (click)="submitPrescription()"
              [disabled]="isSubmitting || selectedMedications.length === 0"
              class="px-xl py-sm bg-primary text-on-primary font-label-md rounded-xl hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-xs">
        <span *ngIf="isSubmitting" class="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
        <span class="material-symbols-outlined text-[18px]" *ngIf="!isSubmitting">save</span>
        {{ isSubmitting ? 'جاري الحفظ...' : 'حفظ الروشيتة' }}
      </button>
    </div>

  </div>
</div>
```

---

### المهمة 18 — نظام الدفع (Instapay / Vodafone Cash)

**المطلوب:**
- عرض رقم Instapay أو Vodafone Cash للدكتور عند الحجز
- الدكتور يأكد استلام الدفع
- إلغاء تلقائي لو المريض مدفعش 5 ساعات قبل الموعد

**الخطوة 1 — تعديل Schema الـ Doctor لإضافة معلومات الدفع:**

```javascript
// backend/models/Doctors.js — أضف للـ schema:
const doctorSchema = new mongoose.Schema({
  // ... الحقول الحالية ...

  // معلومات الدفع
  consultationFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  paymentMethods: {
    instapay:      { type: String, default: '' },  // رقم Instapay
    vodafoneCash:  { type: String, default: '' },  // رقم Vodafone Cash
  },
}, { timestamps: true });
```

**الخطوة 2 — تعديل Schema الـ Appointment لإضافة Payment:**

```javascript
// backend/models/Appointments.js — أضف للـ schema:
const appointmentSchema = new mongoose.Schema({
  // ... الحقول الحالية ...

  // نظام الدفع
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Pending_Confirmation', 'Paid', 'Refunded'],
    default: 'Unpaid',
  },
  paymentMethod: {
    type: String,
    enum: ['Instapay', 'Vodafone_Cash', 'Cash_At_Clinic'],
    default: null,
  },
  paymentDeadline: {
    type: Date,
    default: null,
    // تُحسب = appointmentDate - 5 ساعات
  },
  paymentConfirmedAt: {
    type: Date,
    default: null,
  },
  paymentConfirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });
```

**الخطوة 3 — تعديل `createAppointment` لحساب Payment Deadline:**

```javascript
// backend/controllers/AppointmentController.js
exports.createAppointment = async (req, res) => {
  try {
    // ... منطق التحقق الحالي ...

    const appointmentDate = new Date(`${req.body.appointmentDate}T${req.body.appointmentTime}`);

    // حساب الـ Payment Deadline = 5 ساعات قبل الموعد
    const paymentDeadline = new Date(appointmentDate.getTime() - (5 * 60 * 60 * 1000));

    const appointment = new Appointment({
      ...req.body,
      paymentDeadline,
      paymentStatus: 'Unpaid',
    });

    await appointment.save();

    // جيب بيانات الدفع للدكتور
    const doctor = await Doctor.findById(req.body.doctorId);

    res.status(201).json({
      appointment,
      paymentInfo: {
        amount:          doctor.consultationFee,
        deadline:        paymentDeadline,
        instapay:        doctor.paymentMethods?.instapay,
        vodafoneCash:    doctor.paymentMethods?.vodafoneCash,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

**الخطوة 4 — Route تأكيد الدفع من الدكتور:**

```javascript
// backend/routes/AppointmentRoutes.js
// الدكتور يأكد استلام الدفع
router.patch('/:id/confirm-payment', verifyToken, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);

    if (!appt) return res.status(404).json({ message: 'Appointment not found' });

    // تحقق إن الطالب هو الدكتور صاحب الموعد
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || appt.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appt.paymentStatus        = 'Paid';
    appt.paymentConfirmedAt   = new Date();
    appt.paymentConfirmedBy   = req.user.id;
    appt.status               = 'Confirmed'; // تأكيد الموعد تلقائياً بعد الدفع

    await appt.save();
    res.json({ appointment: appt, message: 'تم تأكيد الدفع والموعد' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

**الخطوة 5 — Cron Job للإلغاء التلقائي:**

```javascript
// backend/jobs/cancelUnpaidAppointments.js (ملف جديد)
const cron = require('node-cron');
const Appointment = require('../models/Appointments');

// يشتغل كل 30 دقيقة
cron.schedule('*/30 * * * *', async () => {
  try {
    const now = new Date();

    // ابحث عن مواعيد:
    // - حالتها Pending
    // - الدفع Unpaid
    // - الـ paymentDeadline فات
    const overdueAppointments = await Appointment.find({
      status:          'Pending',
      paymentStatus:   'Unpaid',
      paymentDeadline: { $lt: now },
    });

    if (overdueAppointments.length === 0) return;

    const ids = overdueAppointments.map(a => a._id);

    await Appointment.updateMany(
      { _id: { $in: ids } },
      {
        status: 'Cancelled',
        $set: { cancelReason: 'auto_cancelled_unpaid' }
      }
    );

    console.log(`[Cron] Auto-cancelled ${overdueAppointments.length} unpaid appointments`);

  } catch (err) {
    console.error('[Cron] Error cancelling unpaid appointments:', err);
  }
});
```

```bash
# تثبيت node-cron:
npm install node-cron
```

```javascript
// backend/index.js — فعّل الـ Cron:
require('./jobs/cancelUnpaidAppointments');
```

**الخطوة 6 — Frontend — شاشة الدفع بعد الحجز:**

```html
<!-- payment-info.component.html -->
<div class="w-full pt-16 bg-background min-h-screen animate-fade-in" dir="rtl">
  <div class="max-w-lg mx-auto px-md py-xl">

    <!-- Success Header -->
    <div class="text-center mb-xl">
      <div class="w-20 h-20 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-md">
        <span class="material-symbols-outlined text-primary text-[40px]">check_circle</span>
      </div>
      <h1 class="font-headline-lg text-headline-lg text-on-surface mb-xs">تم الحجز بنجاح!</h1>
      <p class="font-body-md text-body-md text-on-surface-variant">
        يرجى إتمام الدفع لتأكيد موعدك
      </p>
    </div>

    <!-- تفاصيل الموعد -->
    <div class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant mb-gutter">
      <h2 class="font-headline-sm text-headline-sm text-on-surface mb-md">تفاصيل الموعد</h2>
      <div class="flex flex-col gap-sm">
        <div class="flex justify-between">
          <span class="font-body-sm text-body-sm text-on-surface-variant">الطبيب</span>
          <span class="font-label-md text-label-md text-on-surface">{{ appointment?.doctorName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-body-sm text-body-sm text-on-surface-variant">التاريخ</span>
          <span class="font-label-md text-label-md text-on-surface">{{ appointment?.appointmentDate | date:'EEEE، d MMMM y' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="font-body-sm text-body-sm text-on-surface-variant">الوقت</span>
          <span class="font-label-md text-label-md text-on-surface">{{ appointment?.appointmentTime }}</span>
        </div>
        <div class="flex justify-between border-t border-outline-variant pt-sm mt-xs">
          <span class="font-label-md text-label-md text-on-surface">رسوم الكشف</span>
          <span class="font-headline-sm text-headline-sm text-primary">{{ paymentInfo?.amount }} جنيه</span>
        </div>
      </div>
    </div>

    <!-- تحذير الموعد النهائي للدفع -->
    <div class="bg-error-container rounded-xl p-md mb-gutter flex items-start gap-sm">
      <span class="material-symbols-outlined text-on-error-container text-[24px] shrink-0">schedule</span>
      <div>
        <p class="font-label-md text-label-md text-on-error-container">موعد نهائي للدفع</p>
        <p class="font-body-md text-body-md text-on-error-container">
          {{ paymentInfo?.deadline | date:'EEEE، d MMMM y — h:mm a' }}
        </p>
        <p class="font-body-sm text-body-sm text-on-error-container mt-xs">
          سيُلغى الحجز تلقائياً إذا لم يتم الدفع قبل هذا الموعد
        </p>
      </div>
    </div>

    <!-- طرق الدفع -->
    <div class="bg-surface-container-lowest rounded-xl p-md border border-outline-variant mb-gutter">
      <h2 class="font-headline-sm text-headline-sm text-on-surface mb-md">طرق الدفع</h2>

      <!-- Instapay -->
      <div *ngIf="paymentInfo?.instapay"
           class="flex items-center justify-between p-sm bg-surface-container-low rounded-lg mb-sm">
        <div class="flex items-center gap-sm">
          <div class="w-10 h-10 bg-primary-fixed rounded-lg flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-[20px]">account_balance</span>
          </div>
          <div>
            <p class="font-label-md text-label-md text-on-surface">Instapay</p>
            <p class="font-headline-sm text-headline-sm text-primary">{{ paymentInfo?.instapay }}</p>
          </div>
        </div>
        <button (click)="copyToClipboard(paymentInfo?.instapay)"
                class="p-xs rounded-lg hover:bg-surface-container transition-colors">
          <span class="material-symbols-outlined text-on-surface-variant">content_copy</span>
        </button>
      </div>

      <!-- Vodafone Cash -->
      <div *ngIf="paymentInfo?.vodafoneCash"
           class="flex items-center justify-between p-sm bg-surface-container-low rounded-lg">
        <div class="flex items-center gap-sm">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:#e60000">
            <span class="font-bold text-white text-sm">VF</span>
          </div>
          <div>
            <p class="font-label-md text-label-md text-on-surface">Vodafone Cash</p>
            <p class="font-headline-sm text-headline-sm text-primary">{{ paymentInfo?.vodafoneCash }}</p>
          </div>
        </div>
        <button (click)="copyToClipboard(paymentInfo?.vodafoneCash)"
                class="p-xs rounded-lg hover:bg-surface-container transition-colors">
          <span class="material-symbols-outlined text-on-surface-variant">content_copy</span>
        </button>
      </div>

      <!-- لو مافيش طرق دفع إلكتروني -->
      <div *ngIf="!paymentInfo?.instapay && !paymentInfo?.vodafoneCash"
           class="p-md bg-surface-container-low rounded-lg text-center">
        <span class="material-symbols-outlined text-on-surface-variant text-[32px] block mb-xs">payments</span>
        <p class="font-body-md text-body-md text-on-surface-variant">الدفع نقداً في العيادة</p>
      </div>
    </div>

    <!-- بعد الدفع اضغط "تم الدفع" -->
    <p class="font-body-sm text-body-sm text-on-surface-variant text-center mb-sm">
      بعد إتمام التحويل، أبلغ الطبيب وانتظر تأكيده
    </p>

    <button routerLink="/dashboard/patient"
            class="w-full py-sm bg-primary text-on-primary font-label-md rounded-xl hover:bg-primary-container transition-colors">
      العودة للرئيسية
    </button>

  </div>
</div>
```

**في صفحة الدكتور — زرار تأكيد الدفع:**

```html
<!-- doctor-appointments.component.html — في كارت الموعد -->
<div *ngIf="appt.paymentStatus === 'Unpaid' && appt.status === 'Pending'"
     class="mt-sm p-sm bg-error-container rounded-lg flex items-center justify-between">
  <div class="flex items-center gap-xs">
    <span class="material-symbols-outlined text-on-error-container text-[18px]">payments</span>
    <span class="font-label-sm text-label-sm text-on-error-container">في انتظار الدفع</span>
  </div>
  <button (click)="confirmPayment(appt._id)"
          class="px-sm py-xs bg-primary text-on-primary font-label-sm rounded-lg hover:bg-primary-container transition-colors">
    تأكيد الاستلام
  </button>
</div>

<div *ngIf="appt.paymentStatus === 'Paid'"
     class="mt-sm p-sm bg-surface-container-low rounded-lg flex items-center gap-xs">
  <span class="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
  <span class="font-label-sm text-label-sm text-on-surface-variant">
    تم الدفع — {{ appt.paymentConfirmedAt | date:'shortDate' }}
  </span>
</div>
```

---

## ملخص الملفات الجديدة

| الملف | النوع | الغرض |
|-------|-------|--------|
| `backend/seedAdmin.js` | Backend | إنشاء حساب admin |
| `backend/seedMedications.js` | Backend | إضافة 100 دواء |
| `backend/middlewares/isAdmin.js` | Backend | التحقق من صلاحية admin |
| `backend/routes/adminRoutes.js` | Backend | Admin CRUD routes |
| `backend/jobs/cancelUnpaidAppointments.js` | Backend | Cron إلغاء تلقائي |
| `frontend/src/app/core/services/theme.service.ts` | Frontend | إدارة الـ Dark Mode |
| `frontend/src/app/core/services/language.service.ts` | Frontend | إدارة اللغة |
| `frontend/src/app/shared/pipes/translate.pipe.ts` | Frontend | Pipe الترجمة |
| `frontend/src/assets/i18n/ar.json` | Frontend | نصوص عربية |
| `frontend/src/assets/i18n/en.json` | Frontend | نصوص إنجليزية |
| `frontend/src/app/features/admin/` | Frontend | Admin Dashboard |

## ملخص الملفات المعدّلة

| الملف | التعديل |
|-------|---------|
| `backend/models/Doctors.js` | إضافة `consultationFee`، `paymentMethods` |
| `backend/models/Appointments.js` | إضافة `paymentStatus`، `paymentDeadline`، ... |
| `backend/controllers/AppointmentController.js` | حساب paymentDeadline + getAvailableDays |
| `backend/controllers/availabilityController.js` | إصلاح `slotDuration is not defined` |
| `backend/index.js` | تسجيل الـ routes الجديدة + تفعيل Cron |
| `frontend/src/styles.css` | Animations + Dark Mode variables |
| `frontend/src/app/app.component.ts` | Route animations + initTheme + initLang |
| `frontend/src/app/features/auth/register/register.component.ts` | إصلاح Redirect |
| `frontend/src/app/features/auth/register/register.component.html` | تكبير الفورم |
| `frontend/src/app/features/appointments/patient-appointments/...html` | إزالة nav داخلي |
| `frontend/src/app/features/appointments/doctor-appointments/...html` | إزالة nav داخلي |
| `frontend/src/app/features/profiles/doctor-detail/...html` | إصلاح UI كامل |
| `frontend/src/app/features/schedule/weekly-availability/...ts` | ترتيب الأيام + RTL |
| `frontend/src/app/features/schedule/weekly-availability/...html` | UI مطابق للـ design system |
| `frontend/src/app/features/medical/prescription-form/...html` | UX الروشيتة الكاملة |
| `frontend/src/app/features/medical/prescription-form/...ts` | منطق الروشيتة |
| `frontend/src/app/features/appointments/booking-form/...html` | Calendar ديناميكي |
| `frontend/src/app/features/appointments/booking-form/...ts` | منطق الـ Calendar |

---

## ترتيب التنفيذ الموصى به

```
المرحلة 1 (UI — أسرع نتائج ظاهرة):
  1 → 3 → 8 → 11+12 → 7

المرحلة 2 (Auth & Data — تأثير على الـ flow):
  2 → 10 → 6

المرحلة 3 (Features — تعتمد على المرحلة 2):
  15 → 13 → 14 → 4 → 5

المرحلة 4 (Advanced — تعتمد على كل ما قبلها):
  16 → 17 → 18
```

---

*نهاية الوثيقة — كل مهمة مكتملة بالكود والملفات والتعليمات*
