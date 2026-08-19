# 📋 ملف التعديلات المطلوبة — نظام حجز المواعيد الطبية

> **الحالة:** قيد التنفيذ  
> **آخر تحديث:** 2026-08-19  
> **المسؤول عن التنفيذ:** الفريق بالكامل  

---

## فهرس التعديلا�| 1 | صفحة Not Found بدلاً من Redirect | 🔴 عالية | `app-routing.module.ts` | ✅ |
| 2 | حماية صفحات الدكتور | 🔴 عالية | `role.guard.ts`, Routes | ✅ |
| 3 | حماية صفحات المريض | 🔴 عالية | `role.guard.ts`, Routes | ✅ |
| 4 | خطوط Google Fonts للعربي والإنجليزي | 🟡 متوسطة | `index.html`, `styles.css` | ✅ |
| 5 | ملف README.md احترافي | 🟢 منخفضة | `README.md` | ✅ |
| 6 | Dark Mode / Themes | 🟡 متوسطة | `styles.css`, `ThemeService` | ✅ |
| 7 | صفحة الإعدادات | 🟡 متوسطة | `settings.component.*` | ✅ |
| 8 | PWA دعم كامل | 🟡 متوسطة | `angular.json`, `manifest.json` | ✅ |
| 9 | صفحة التسجيل بالعربي | 🔴 عالية | `register.component.*` | ✅ |
| 10 | i18n عربي في كل المشروع | 🟡 متوسطة | `styles.css`, كل المكونات | ✅ |
| 11 | فلتر وترتيب قائمة الأطباء | 🔴 عالية | `doctor-list.component.*` | ✅ |
| 12 | إضافة 20 دكتور بكامل بياناتهم | 🟡 متوسطة | `seed.js` / Backend | ✅ |
| 13 | Navbar مختلف للمريض والدكتور | 🔴 عالية | `navbar.component.*` | ✅ |
| 14 | Validation صفحة التسجيل | 🔴 عالية | `register.component.ts` | ✅ |
| 15 | الدكتور يُوجَّه للـ Dashboard مباشرة | 🔴 عالية | `authController.js`, `auth.guard.ts` | ✅ |
| 16 | إصلاح Role في صفحة مواعيد الدكتور | 🔴 عالية | `AppointmentRoutes.js`, Backend | ✅ |
| 17 | مواعيد أسبوعية فارغة للدكتور الجديد | 🔴 عالية | `availabilityController.js` | ✅ |
| 18 | السماح بأكثر من موعد في نفس اليوم | 🔴 عالية | `availabilityController.js`, Model | ✅ |
| 19 | لون Dashboard المريض يطابق الدكتور | 🟢 منخفضة | `patient-dashboard.component.css` | ✅ |�ية | `register.component.ts` | ✅ |
| 15 | الدكتور يُوجَّه للـ Dashboard مباشرة | 🔴 عالية | `authController.js`, `auth.guard.ts` | ✅ |
| 16 | إصلاح Role في صفحة مواعيد الدكتور | 🔴 عالية | `AppointmentRoutes.js`, Backend | ✅ |
| 17 | مواعيد أسبوعية فارغة للدكتور الجديد | 🔴 عالية | `availabilityController.js` | ✅ |
| 18 | السماح بأكثر من موعد في نفس اليوم | 🔴 عالية | `availabilityController.js`, Model | ✅ |
| 19 | لون Dashboard المريض يطابق الدكتور | 🟢 منخفضة | `patient-dashboard.component.css` | ✅ |

---

## التفاصيل الكاملة لكل تعديل

---

### 1. صفحة Not Found بدلاً من Redirect للـ Login

**المشكلة:** عند الدخول على أي مسار غير موجود، يُعاد التوجيه إلى `auth/login` بدلاً من عرض صفحة 404.

**الحل:**

#### `frontend/src/app/app-routing.module.ts`
```typescript
// أضف المسار الأخير في قائمة الـ routes:
{
  path: '**',
  loadChildren: () => import('./features/not-found/not-found.module')
    .then(m => m.NotFoundModule)
}

// احذف أي wildcard redirect موجود مثل:
// { path: '**', redirectTo: 'auth/login' }  ← احذف هذا
```

#### إنشاء `frontend/src/app/features/not-found/`
```
not-found/
├── not-found.module.ts
├── not-found-routing.module.ts
└── not-found.component.ts/.html/.css
```

**محتوى صفحة 404:**
- رسالة "الصفحة غير موجودة" باللغة العربية
- زر "العودة للرئيسية"
- تصميم يتوافق مع نظام الألوان الحالي (Primary: `#00685f`)
- RTL layout

---

### 2 & 3. حماية صفحات الدكتور والمريض (Role-Based Access Control)

**المشكلة:** لا توجد حماية كاملة تمنع المريض من الوصول لصفحات الدكتور والعكس.

**الحل:**

#### `frontend/src/app/core/guards/role.guard.ts`
```typescript
// التأكد من أن الـ Guard يُرجع صفحة خطأ وليس redirect فقط
// يجب إضافة رسالة واضحة عند منع الوصول

canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
  const requiredRole = route.data['role'];
  const currentUser = this.authService.getCurrentUser();

  if (!currentUser) {
    return this.router.createUrlTree(['/auth/login']);
  }

  if (currentUser.role !== requiredRole) {
    // توجيه لصفحة "غير مصرح" وليس 404
    return this.router.createUrlTree(['/unauthorized']);
  }

  return true;
}
```

#### إنشاء صفحة Unauthorized
```
frontend/src/app/features/unauthorized/
├── unauthorized.component.ts
├── unauthorized.component.html   ← رسالة "غير مصرح لك بالوصول"
└── unauthorized.component.css
```

#### تحديث الـ Routes — صفحات الدكتور:
```typescript
// في appointments-routing.module.ts
{
  path: 'doctor',
  component: DoctorAppointmentsComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { role: 'doctor' }
}

// في schedule-routing.module.ts
{
  path: 'weekly-availability',
  canActivate: [AuthGuard, RoleGuard],
  data: { role: 'doctor' }
}
```

#### تحديث الـ Routes — صفحات المريض:
```typescript
{
  path: 'patient',
  component: PatientAppointmentsComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { role: 'patient' }
}
{
  path: 'booking',
  component: BookingFormComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { role: 'patient' }
}
```

---

### 4. خطوط Google Fonts للعربي والإنجليزي

**الحل:**

#### `frontend/src/index.html`
```html
<head>
  <!-- خط عربي: Cairo — حديث ومميز وطبي -->
  <!-- خط إنجليزي: Inter — يتوافق مع Design System الحالي -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
```

#### `frontend/src/styles.css`
```css
:root {
  --font-arabic: 'Cairo', sans-serif;
  --font-english: 'Inter', sans-serif;
}

/* تطبيق الخط حسب اتجاه الصفحة */
[dir="rtl"], [lang="ar"] {
  font-family: var(--font-arabic);
}

[dir="ltr"], [lang="en"] {
  font-family: var(--font-english);
}

body {
  font-family: var(--font-arabic); /* الموقع عربي بالأساس */
}
```

> **ملاحظة:** خط Cairo يدعم كلاً من العربية والأرقام بشكل ممتاز وهو الأنسب للتطبيقات الطبية.

---

### 5. ملف README.md احترافي لـ GitHub

**المكان:** `/README.md` في جذر المشروع (root)

**المحتوى المطلوب:**
```markdown
# 🏥 نظام حجز المواعيد الطبية
## Doctor Appointment Management System

### شارة الحالة (Badges)
- Build Status
- License
- Angular version
- Node version

### نظرة عامة عن المشروع
### Tech Stack
### هيكل المشروع (Project Structure)
### متطلبات التشغيل
### خطوات الإعداد (Setup)
### API Endpoints
### أعضاء الفريق (Team Members) — جدول بالاسم والجزء والـ GitHub
### لقطات الشاشة (Screenshots)
### الترخيص
```

> **تنبيه:** يجب إضافة أسماء أعضاء الفريق الحقيقية وروابط GitHub الخاصة بهم في هذا القسم.

---

### 6. Dark Mode / Themes

**الحل:**

#### إنشاء `frontend/src/app/core/services/theme.service.ts`
```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';

  setTheme(theme: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  loadSavedTheme() {
    const saved = localStorage.getItem(this.THEME_KEY) || 'light';
    this.setTheme(saved as 'light' | 'dark');
  }
}
```

#### `frontend/src/styles.css` — متغيرات الـ Dark Mode
```css
[data-theme="dark"] {
  --md-sys-color-background: #0f1c1b;
  --md-sys-color-surface: #1a2625;
  --md-sys-color-on-surface: #e1e3e4;
  --md-sys-color-primary: #6bd8cb;
  --md-sys-color-on-primary: #00201d;
  --md-sys-color-surface-container: #1e2e2d;
  /* ... بقية المتغيرات */
}
```

#### `frontend/src/app/app.component.ts`
```typescript
ngOnInit() {
  this.themeService.loadSavedTheme(); // تحميل الثيم عند بدء التطبيق
}
```

---

### 7. صفحة الإعدادات (Settings)

**المسار:** `/settings`

**إنشاء:** `frontend/src/app/features/settings/`
```
settings/
├── settings.module.ts
├── settings-routing.module.ts
└── settings.component.ts/.html/.css
```

**محتوى الصفحة:**
```html
<!-- قسم المظهر -->
<section class="settings-section">
  <h2>المظهر</h2>
  <div class="theme-toggle">
    <button (click)="setTheme('light')">الوضع الفاتح ☀️</button>
    <button (click)="setTheme('dark')">الوضع الداكن 🌙</button>
  </div>
</section>

<!-- قسم اللغة -->
<section class="settings-section">
  <h2>اللغة</h2>
  <select (change)="setLanguage($event)">
    <option value="ar">العربية</option>
    <option value="en">English</option>
  </select>
</section>

<!-- تسجيل الخروج -->
<section class="settings-section danger-zone">
  <button class="btn-danger" (click)="logout()">
    تسجيل الخروج
  </button>
</section>
```

**إضافة رابط في الـ Navbar:**
```html
<a routerLink="/settings">⚙️ الإعدادات</a>
```

---

### 8. PWA — Progressive Web App

**الحل:**

#### تثبيت الـ PWA Package
```bash
ng add @angular/pwa
```

#### `frontend/src/manifest.webmanifest`
```json
{
  "name": "نظام حجز المواعيد الطبية",
  "short_name": "مواعيد طبية",
  "description": "نظام متكامل لحجز المواعيد الطبية",
  "theme_color": "#00685f",
  "background_color": "#f8f9fa",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "dir": "rtl",
  "lang": "ar",
  "icons": [
    { "src": "assets/icons/icon-72x72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "assets/icons/icon-96x96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "assets/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "assets/icons/icon-144x144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "assets/icons/icon-152x152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "assets/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/icons/icon-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "assets/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

#### `frontend/ngsw-config.json` — إعداد Service Worker
```json
{
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/manifest.webmanifest", "/*.css", "/*.js"]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": ["/assets/**", "/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2|ani|eot)"]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-freshness",
      "urls": ["/api/**"],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 100,
        "maxAge": "3d",
        "timeout": "10s"
      }
    }
  ]
}
```

---

### 9. صفحة auth/register بالعربي الكامل

**الملفات المتأثرة:**
- `frontend/src/app/features/auth/register/register.component.html`
- `frontend/src/app/features/auth/register/register.component.ts`

**التحويلات المطلوبة في الـ HTML:**
```html
<!-- اتجاه RTL -->
<div dir="rtl" lang="ar">

<!-- العناوين -->
"Create Account"       → "إنشاء حساب جديد"
"Email"                → "البريد الإلكتروني"
"Password"             → "كلمة المرور"
"Full Name"            → "الاسم الكامل"
"Phone Number"         → "رقم الهاتف"
"Specialization"       → "التخصص الطبي"
"Years of Experience"  → "سنوات الخبرة"
"Register"             → "تسجيل"
"Already have account" → "لديك حساب بالفعل؟"
"Login"                → "تسجيل الدخول"
"Patient"              → "مريض"
"Doctor"               → "طبيب"
```

---

### 10. i18n العربي في كل المشروع

**الحل المقترح:** استخدام CSS + `dir="rtl"` على مستوى التطبيق بدلاً من مكتبة i18n كاملة (أبسط وأسرع للمشروع الحالي).

#### `frontend/src/index.html`
```html
<html lang="ar" dir="rtl">
```

#### `frontend/src/styles.css`
```css
/* ضمان اتجاه RTL لكل العناصر */
* {
  box-sizing: border-box;
}

body {
  direction: rtl;
  text-align: right;
  font-family: var(--font-arabic);
}

/* Icons الاتجاه المعكوس في RTL */
.icon-arrow-back {
  transform: scaleX(-1);
}
```

**ترجمات مطلوبة في كل صفحة:**

| الإنجليزية | العربية |
|-----------|--------|
| Dashboard | لوحة التحكم |
| Appointments | المواعيد |
| My Profile | ملفي الشخصي |
| Settings | الإعدادات |
| Logout | تسجيل الخروج |
| Book Appointment | حجز موعد |
| Upcoming | القادمة |
| Completed | المكتملة |
| Cancelled | الملغاة |
| Pending | قيد الانتظار |
| Confirmed | مؤكدة |
| Search | بحث |
| Filter | تصفية |
| Save | حفظ |
| Cancel | إلغاء |
| Loading... | جاري التحميل... |
| No data found | لا توجد بيانات |

---

### 11. فلتر وترتيب قائمة الأطباء

**المشكلة:** الفلتر والترتيب في `doctor-list` غير عاملين أو غير واضحين.

**الحل الكامل:**

#### `frontend/src/app/features/profiles/doctor-list/doctor-list.component.ts`
```typescript
// المتغيرات
specializations = ['باطنة', 'أطفال', 'قلب', 'جراحة', 'عيون', 'نساء وتوليد', 'عظام'];
selectedSpecialization = '';
sortBy: 'rating' | 'experience' | 'name' = 'rating';
sortOrder: 'asc' | 'desc' = 'desc';
searchQuery = '';
filteredDoctors: Doctor[] = [];

// دالة الفلترة والترتيب
applyFilters() {
  let result = [...this.allDoctors];

  // فلتر البحث النصي
  if (this.searchQuery.trim()) {
    result = result.filter(d =>
      d.fullName.includes(this.searchQuery) ||
      d.specialization.includes(this.searchQuery)
    );
  }

  // فلتر التخصص
  if (this.selectedSpecialization) {
    result = result.filter(d => d.specialization === this.selectedSpecialization);
  }

  // الترتيب
  result.sort((a, b) => {
    let valA = a[this.sortBy];
    let valB = b[this.sortBy];
    const dir = this.sortOrder === 'asc' ? 1 : -1;
    return valA > valB ? dir : -dir;
  });

  this.filteredDoctors = result;
}

// استدعاء عند كل تغيير
onFilterChange() { this.applyFilters(); }
onSortChange(field: string) {
  if (this.sortBy === field) {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortBy = field as any;
    this.sortOrder = 'desc';
  }
  this.applyFilters();
}
```

#### `frontend/src/app/features/profiles/doctor-list/doctor-list.component.html`
```html
<!-- شريط الفلتر -->
<div class="filter-bar" dir="rtl">
  <!-- بحث نصي -->
  <input type="search" [(ngModel)]="searchQuery"
         (ngModelChange)="onFilterChange()"
         placeholder="ابحث باسم الدكتور أو التخصص...">

  <!-- فلتر التخصص -->
  <select [(ngModel)]="selectedSpecialization" (change)="onFilterChange()">
    <option value="">كل التخصصات</option>
    <option *ngFor="let spec of specializations" [value]="spec">{{spec}}</option>
  </select>

  <!-- ترتيب -->
  <div class="sort-buttons">
    <button (click)="onSortChange('rating')" [class.active]="sortBy==='rating'">
      ⭐ التقييم {{ sortBy==='rating' ? (sortOrder==='desc'?'↓':'↑') : '' }}
    </button>
    <button (click)="onSortChange('yearsOfExperience')" [class.active]="sortBy==='yearsOfExperience'">
      📅 الخبرة {{ sortBy==='yearsOfExperience' ? (sortOrder==='desc'?'↓':'↑') : '' }}
    </button>
    <button (click)="onSortChange('fullName')" [class.active]="sortBy==='fullName'">
      🔤 الاسم
    </button>
  </div>

  <!-- عدد النتائج -->
  <span class="results-count">
    {{ filteredDoctors.length }} طبيب
  </span>
</div>

<!-- بطاقات الأطباء -->
<div class="doctors-grid">
  <app-doctor-card *ngFor="let doctor of filteredDoctors" [doctor]="doctor">
  </app-doctor-card>
  <p *ngIf="filteredDoctors.length === 0" class="no-results">
    لا يوجد أطباء تطابق معايير البحث
  </p>
</div>
```

---

### 12. إضافة 20 دكتور بكامل بياناتهم

**المكان:** إنشاء `backend/seeds/doctorSeed.js`

```javascript
const doctors = [
  {
    user: { email: 'dr.ahmed.hassan@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. أحمد حسن',
      specialization: 'باطنة',
      education: 'بكالوريوس طب وجراحة — جامعة القاهرة',
      qualifications: 'زمالة الباطنة المصرية، عضو الجمعية المصرية لأمراض الجهاز الهضمي',
      yearsOfExperience: 15,
      bio: 'متخصص في أمراض الجهاز الهضمي والكبد مع خبرة واسعة في التشخيص والعلاج.',
      rating: 4.8
    }
  },
  {
    user: { email: 'dr.mona.ali@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. منى علي',
      specialization: 'أطفال',
      education: 'بكالوريوس طب — جامعة عين شمس',
      qualifications: 'دكتوراه في طب الأطفال، زمالة أمراض الدم للأطفال',
      yearsOfExperience: 12,
      bio: 'طبيبة أطفال ذات خبرة في رعاية حديثي الولادة وأمراض الدم عند الأطفال.',
      rating: 4.9
    }
  },
  {
    user: { email: 'dr.khaled.omar@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. خالد عمر',
      specialization: 'قلب',
      education: 'بكالوريوس طب — جامعة الإسكندرية',
      qualifications: 'زمالة القلب الأمريكية (FACC)، دبلوم القسطرة القلبية',
      yearsOfExperience: 20,
      bio: 'استشاري قلب وأوعية دموية متخصص في القسطرة وجراحة القلب التدخلية.',
      rating: 4.7
    }
  },
  {
    user: { email: 'dr.sara.mahmoud@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. سارة محمود',
      specialization: 'جراحة',
      education: 'بكالوريوس طب — جامعة المنصورة',
      qualifications: 'ماجستير جراحة عامة، زمالة الجراحة التنظيرية',
      yearsOfExperience: 10,
      bio: 'جراحة عامة متخصصة في الجراحة بالمنظار وجراحة السمنة.',
      rating: 4.6
    }
  },
  {
    user: { email: 'dr.youssef.ibrahim@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. يوسف إبراهيم',
      specialization: 'عيون',
      education: 'بكالوريوس طب — جامعة أسيوط',
      qualifications: 'دكتوراه طب وجراحة عيون، زمالة جراحة الليزك',
      yearsOfExperience: 18,
      bio: 'متخصص في جراحة الليزك وعمليات الماء الأبيض وشبكية العين.',
      rating: 4.8
    }
  },
  {
    user: { email: 'dr.nadia.youssef@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. نادية يوسف',
      specialization: 'نساء وتوليد',
      education: 'بكالوريوس طب — جامعة طنطا',
      qualifications: 'ماجستير أمراض النساء والتوليد، دبلوم الحقن المجهري',
      yearsOfExperience: 14,
      bio: 'متخصصة في متابعة الحمل الخطر والعقم وتقنيات الإنجاب المساعد.',
      rating: 4.9
    }
  },
  {
    user: { email: 'dr.tarek.hussein@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. طارق حسين',
      specialization: 'عظام',
      education: 'بكالوريوس طب — جامعة القاهرة',
      qualifications: 'دكتوراه جراحة العظام، زمالة تبديل المفاصل',
      yearsOfExperience: 16,
      bio: 'جراح عظام متخصص في تبديل الركبة والورك والكسور المعقدة.',
      rating: 4.7
    }
  },
  {
    user: { email: 'dr.heba.salem@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. هبة سالم',
      specialization: 'باطنة',
      education: 'بكالوريوس طب — جامعة الزقازيق',
      qualifications: 'ماجستير الباطنة، دبلوم السكري والغدد الصماء',
      yearsOfExperience: 9,
      bio: 'متخصصة في علاج السكري وأمراض الغدة الدرقية وأمراض الكلى.',
      rating: 4.5
    }
  },
  {
    user: { email: 'dr.mostafa.ragab@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. مصطفى رجب',
      specialization: 'أطفال',
      education: 'بكالوريوس طب — جامعة بنها',
      qualifications: 'ماجستير طب الأطفال، دبلوم التغذية',
      yearsOfExperience: 7,
      bio: 'طبيب أطفال متخصص في اضطرابات النمو والتغذية عند الرضع والأطفال.',
      rating: 4.4
    }
  },
  {
    user: { email: 'dr.dina.fouad@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. دينا فؤاد',
      specialization: 'قلب',
      education: 'بكالوريوس طب — جامعة عين شمس',
      qualifications: 'زمالة الإيكو القلبي، دبلوم ضغط الدم',
      yearsOfExperience: 11,
      bio: 'أخصائية قلب متخصصة في الإيكو القلبي وعلاج ضغط الدم وضعف عضلة القلب.',
      rating: 4.6
    }
  },
  {
    user: { email: 'dr.ibrahim.mansour@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. إبراهيم منصور',
      specialization: 'جراحة',
      education: 'بكالوريوس طب — جامعة الإسماعيلية',
      qualifications: 'دكتوراه الجراحة العامة، زمالة جراحة الأورام',
      yearsOfExperience: 22,
      bio: 'جراح أورام بخبرة واسعة في استئصال أورام الكبد والقولون والبنكرياس.',
      rating: 4.8
    }
  },
  {
    user: { email: 'dr.rania.abdel@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. رانيا عبد الغني',
      specialization: 'عيون',
      education: 'بكالوريوس طب — جامعة الأزهر',
      qualifications: 'ماجستير عيون، زمالة شبكية العين',
      yearsOfExperience: 13,
      bio: 'متخصصة في أمراض شبكية العين والزرق والإبر الداخلية.',
      rating: 4.7
    }
  },
  {
    user: { email: 'dr.walid.nour@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. وليد نور',
      specialization: 'نساء وتوليد',
      education: 'بكالوريوس طب — جامعة المنوفية',
      qualifications: 'ماجستير التوليد، زمالة الجراحة التنظيرية النسائية',
      yearsOfExperience: 17,
      bio: 'متخصص في الجراحة التنظيرية النسائية واستئصال الأورام الليفية.',
      rating: 4.5
    }
  },
  {
    user: { email: 'dr.amira.kamal@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. أميرة كمال',
      specialization: 'عظام',
      education: 'بكالوريوس طب — جامعة سوهاج',
      qualifications: 'ماجستير جراحة العمود الفقري، دبلوم إصابات الملاعب',
      yearsOfExperience: 8,
      bio: 'متخصصة في إصابات الملاعب وجراحة العمود الفقري وعلاج الهشاشة.',
      rating: 4.3
    }
  },
  {
    user: { email: 'dr.hassan.zaki@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. حسن زكي',
      specialization: 'باطنة',
      education: 'بكالوريوس طب — جامعة أسوان',
      qualifications: 'دكتوراه الباطنة العامة، زمالة أمراض الروماتيزم',
      yearsOfExperience: 19,
      bio: 'استشاري الروماتيزم وأمراض المناعة والتهاب المفاصل.',
      rating: 4.9
    }
  },
  {
    user: { email: 'dr.ola.samy@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. علا سامي',
      specialization: 'أطفال',
      education: 'بكالوريوس طب — جامعة كفر الشيخ',
      qualifications: 'دكتوراه طب الأطفال، زمالة أمراض الجهاز العصبي للأطفال',
      yearsOfExperience: 15,
      bio: 'متخصصة في اضطرابات الجهاز العصبي والتوحد وصعوبات التعلم عند الأطفال.',
      rating: 4.8
    }
  },
  {
    user: { email: 'dr.fady.botros@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. فادي بطرس',
      specialization: 'قلب',
      education: 'بكالوريوس طب — جامعة أكتوبر',
      qualifications: 'زمالة أمراض القلب، دبلوم رسم القلب التشخيصي',
      yearsOfExperience: 6,
      bio: 'أخصائي قلب يُركّز على الوقاية من أمراض القلب وإعادة التأهيل القلبي.',
      rating: 4.4
    }
  },
  {
    user: { email: 'dr.magda.ali@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. مجدة علي',
      specialization: 'جراحة',
      education: 'بكالوريوس طب — جامعة الفيوم',
      qualifications: 'ماجستير جراحة الأورام، دبلوم جراحة الثدي',
      yearsOfExperience: 13,
      bio: 'جراحة متخصصة في أورام الثدي والغدة الدرقية بالمنظار.',
      rating: 4.6
    }
  },
  {
    user: { email: 'dr.adel.naguib@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. عادل نجيب',
      specialization: 'عيون',
      education: 'بكالوريوس طب — جامعة بورسعيد',
      qualifications: 'دكتوراه جراحة المياه البيضاء، زمالة طب العيون التشخيصي',
      yearsOfExperience: 21,
      bio: 'رائد في جراحة الماء الأبيض بالليزر وزراعة العدسات الإضافية.',
      rating: 4.7
    }
  },
  {
    user: { email: 'dr.yasmin.hamdy@clinic.com', role: 'doctor' },
    profile: {
      fullName: 'د. ياسمين حمدي',
      specialization: 'نساء وتوليد',
      education: 'بكالوريوس طب — جامعة دمنهور',
      qualifications: 'ماجستير نساء وتوليد، دبلوم تنظيم الأسرة',
      yearsOfExperience: 10,
      bio: 'متخصصة في صحة المرأة وسرطانات النساء والإجراءات التنظيرية.',
      rating: 4.5
    }
  }
];
```

**لتشغيل الـ Seed:**
```bash
node backend/seeds/doctorSeed.js
```

**التخصصات السبعة المعتمدة:**
1. باطنة
2. أطفال
3. قلب
4. جراحة
5. عيون
6. نساء وتوليد
7. عظام

---

### 13. Navbar مختلف للمريض والدكتور

**الحل:**

#### `frontend/src/app/shared/components/navbar/navbar.component.ts`
```typescript
get isDoctor(): boolean {
  return this.authService.getCurrentUser()?.role === 'doctor';
}

get isPatient(): boolean {
  return this.authService.getCurrentUser()?.role === 'patient';
}
```

#### `frontend/src/app/shared/components/navbar/navbar.component.html`
```html
<nav dir="rtl">
  <!-- Logo -->
  <div class="logo">
    <span>🏥 طبيبك</span>
  </div>

  <!-- روابط الدكتور -->
  <ul *ngIf="isDoctor" class="nav-links doctor-nav">
    <li><a routerLink="/dashboard">لوحة التحكم</a></li>
    <li><a routerLink="/appointments/doctor">مواعيدي</a></li>
    <li><a routerLink="/schedule/weekly-availability">جدول العمل</a></li>
    <li><a routerLink="/schedule/exceptions">الإجازات</a></li>
    <li><a routerLink="/profiles/doctor-profile">ملفي الشخصي</a></li>
    <li><a routerLink="/settings">⚙️ الإعدادات</a></li>
  </ul>

  <!-- روابط المريض -->
  <ul *ngIf="isPatient" class="nav-links patient-nav">
    <li><a routerLink="/dashboard">الرئيسية</a></li>
    <li><a routerLink="/profiles/doctors">الأطباء</a></li>
    <li><a routerLink="/appointments/patient">مواعيدي</a></li>
    <li><a routerLink="/profiles/patient-profile">ملفي</a></li>
    <li><a routerLink="/settings">⚙️ الإعدادات</a></li>
  </ul>
</nav>
```

> **ملاحظة:** الـ Navbar يظهر في كل صفحات التطبيق عدا صفحات `auth/login` و `auth/register`.

---

### 14. Validation صفحة التسجيل

**القواعد المطلوبة:**

#### للمريض:
| الحقل | القاعدة |
|-------|---------|
| الاسم الكامل | مطلوب، 3 أحرف على الأقل |
| البريد الإلكتروني | صيغة بريد صحيحة، مطلوب |
| كلمة المرور | 8 أحرف على الأقل، حرف كبير + رقم |
| رقم الهاتف | **11 رقماً بالضبط**، يبدأ بـ 010, 011, 012, 015 |
| العمر | بين 0 و 120 |

#### للدكتور:
| الحقل | القاعدة |
|-------|---------|
| الاسم الكامل | مطلوب، يبدأ بـ "د." اختياري |
| البريد الإلكتروني | صيغة بريد صحيحة، مطلوب |
| كلمة المرور | 8 أحرف على الأقل |
| التخصص | **من القائمة المحددة فقط** (7 تخصصات) |
| سنوات الخبرة | رقم موجب |

#### `frontend/src/app/features/auth/register/register.component.ts`
```typescript
// Validators للمريض
phoneNumber: ['', [
  Validators.required,
  Validators.pattern(/^(010|011|012|015)\d{8}$/)  // 11 رقم بالضبط
]]

// رسالة الخطأ
getPhoneError(): string {
  const ctrl = this.form.get('phoneNumber');
  if (ctrl?.errors?.['required']) return 'رقم الهاتف مطلوب';
  if (ctrl?.errors?.['pattern']) return 'رقم الهاتف يجب أن يكون 11 رقماً ويبدأ بـ 010/011/012/015';
  return '';
}

// Validator للتخصص
specialization: ['', [
  Validators.required,
  Validators.pattern(/^(باطنة|أطفال|قلب|جراحة|عيون|نساء وتوليد|عظام)$/)
]]
```

> **ملاحظة مهمة (الـ Filter):** لتسهيل الـ filter في قائمة الأطباء، يجب أيضاً تحديث:
> - `backend/models/Doctors.js` — إضافة `enum` للـ `specialization`
> - `backend/controllers/DoctorController.js` — إضافة Filter endpoint
> - هذا يضمن تناسق البيانات حتى لو جاء الدكتور من مصدر آخر

---

### 15. الدكتور يُوجَّه للـ Dashboard مباشرة بعد Login

**المشكلة:** بعد تسجيل الدخول، الدكتور لا يُوجَّه تلقائياً للـ Dashboard.

**الحل:**

#### `frontend/src/app/features/auth/login/login.component.ts`
```typescript
login() {
  this.authService.login(credentials).subscribe(user => {
    if (user.role === 'doctor') {
      this.router.navigate(['/dashboard']);      // dashboard الدكتور
    } else if (user.role === 'patient') {
      this.router.navigate(['/profiles/doctors']); // قائمة الأطباء للمريض
    }
  });
}
```

#### `frontend/src/app/core/guards/auth.guard.ts`
```typescript
// إذا كان المستخدم مسجلاً ويحاول الوصول لـ auth/login، أعده للـ Dashboard
canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
  if (this.authService.isLoggedIn()) {
    const role = this.authService.getCurrentUser()?.role;
    if (role === 'doctor') return this.router.createUrlTree(['/dashboard']);
    if (role === 'patient') return this.router.createUrlTree(['/profiles/doctors']);
  }
  return true;
}
```

---

### 16. إصلاح Role في صفحة مواعيد الدكتور

**المشكلة:** صفحة `appointments/doctor` ترفض طلبات الدكتور بسبب خطأ في التحقق من الصلاحيات.

**الأسباب المحتملة والحلول:**

#### 1. تحقق من Backend Middleware
```javascript
// backend/middlewares/auth.js
// التأكد من أن middleware يقرأ الـ role بشكل صحيح
const verifyRole = (allowedRoles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'غير مصرح' });

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'ليس لديك صلاحية' });
  }
  next();
};
```

#### 2. تحقق من AppointmentRoutes
```javascript
// backend/routes/AppoinmentRoutes.js
// مثال على المسارات الصحيحة:
router.get('/doctor/my-appointments',
  verifyToken,
  verifyRole(['doctor']),  // ← تأكد أن 'doctor' مكتوب بشكل صحيح
  AppointmentController.getDoctorAppointments
);

router.patch('/:id/status',
  verifyToken,
  verifyRole(['doctor']),  // ← الدكتور يجب أن يقدر يغير الحالة
  AppointmentController.updateStatus
);
```

#### 3. تحقق من Frontend Service
```typescript
// frontend/src/app/features/appointments/services/appointment.service.ts
// التأكد من إرسال JWT في كل Request
getDoctorAppointments() {
  return this.http.get('/api/appointments/doctor/my-appointments');
  // JWT يُضاف تلقائياً عبر jwt.interceptor.ts
}
```

#### 4. تحقق من JWT Interceptor
```typescript
// frontend/src/app/core/interceptors/jwt.interceptor.ts
// التأكد من إضافة Authorization header
intercept(req, next) {
  const token = this.authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next.handle(req);
}
```

---

### 17. مواعيد أسبوعية فارغة للدكتور الجديد

**المشكلة:** عند إنشاء حساب دكتور جديد، يجد مواعيد موجودة في صفحة `schedule/weekly-availability`.

**السبب المحتمل:** لا يوجد فلتر بـ `doctorId` صحيح — ربما يُعاد كل المواعيد.

**الحل:**

#### `backend/controllers/availabilityController.js`
```javascript
// دالة الجلب — التأكد من الفلتر بـ doctorId
const getMyAvailability = async (req, res) => {
  try {
    // الـ doctorId يجب أن يأتي من الـ Token وليس من الـ URL
    const doctorProfile = await Doctor.findOne({ userId: req.user._id });

    if (!doctorProfile) {
      return res.status(404).json({ message: 'لم يُعثر على ملف الدكتور' });
    }

    const availability = await WeeklyAvailability.find({
      doctorId: doctorProfile._id  // ← فلتر بـ _id الدكتور الصحيح
    });

    res.json(availability); // يُرجع مصفوفة فارغة [] للدكتور الجديد
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

### 18. السماح بأكثر من موعد في نفس اليوم

**المشكلة:** الـ Backend يرفض إضافة موعد ثانٍ في نفس اليوم حتى لو كان الوقت مختلفاً.

**الحل:**

#### `backend/models/WeeklyAvailability.js`
```javascript
// احذف أو عدّل هذا الـ Unique Index:
// weeklyAvailabilitySchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });
//                                                                 ↑ هذا يمنع التكرار

// استبدله بـ:
// منع التداخل في نفس الوقت فقط
weeklyAvailabilitySchema.index(
  { doctorId: 1, dayOfWeek: 1, startTime: 1 },
  { unique: true }  // نفس الدكتور، نفس اليوم، نفس وقت البداية = مرفوض
);
```

#### `backend/controllers/availabilityController.js`
```javascript
// عند الإضافة، تحقق من التداخل الزمني فقط
const addAvailability = async (req, res) => {
  const { dayOfWeek, startTime, endTime, slotDurationMinutes } = req.body;
  const doctorId = doctorProfile._id;

  // تحقق من تداخل في الأوقات (وليس في اليوم فقط)
  const overlapping = await WeeklyAvailability.findOne({
    doctorId,
    dayOfWeek,
    $or: [
      // موعد جديد يبدأ أثناء موعد موجود
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });

  if (overlapping) {
    return res.status(409).json({
      message: 'هذا الوقت يتعارض مع موعد موجود في نفس اليوم'
    });
  }

  // إضافة الموعد الجديد
  const newAvailability = new WeeklyAvailability({
    doctorId, dayOfWeek, startTime, endTime, slotDurationMinutes
  });

  await newAvailability.save();
  res.status(201).json(newAvailability);
};
```

---

### 19. لون Dashboard المريض يطابق الدكتور (الأخضر)

**المشكلة:** Dashboard الدكتور بالأخضر، لكن Dashboard المريض بلون مختلف.

**الحل:**

#### `frontend/src/app/features/profiles/patient-profile/patient-profile.component.css`
أو ملف الـ Dashboard الخاص بالمريض (إن وُجد):

```css
/* استخدام نفس الألوان الخضراء الخاصة بالدكتور */
.dashboard-header {
  background: linear-gradient(135deg, var(--md-sys-color-primary), var(--md-sys-color-primary-container));
  color: var(--md-sys-color-on-primary);
}

.stat-card {
  border-right: 4px solid var(--md-sys-color-primary);  /* RTL */
}

.stat-card .stat-number {
  color: var(--md-sys-color-primary);
}

.btn-primary {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}
```

> اللون الأساسي `--md-sys-color-primary` هو `#00685f` وهو الأخضر الطبي الموحد للتطبيق.

---

## ملاحظات عامة للفريق

### الأولويات المقترحة للتنفيذ:

```
المرحلة 1 (الأساسيات الأمنية):
  ✅ #2 + #3 — حماية الصفحات بالـ Roles
  ✅ #1 — صفحة Not Found
  ✅ #15 — Redirect الدكتور بعد Login
  ✅ #16 — إصلاح صلاحيات مواعيد الدكتور
  ✅ #17 + #18 — إصلاح الـ Weekly Availability

المرحلة 2 (واجهة المستخدم):
  ✅ #9 — التسجيل بالعربي
  ✅ #13 — Navbar مختلف
  ✅ #14 — Validation قوي
  ✅ #11 — Filter + Sort الأطباء
  ✅ #4 — Google Fonts

المرحلة 3 (الإضافات والتحسينات):
  ✅ #6 — Dark Mode
  ✅ #7 — صفحة الإعدادات
  ✅ #19 — ألوان Dashboard المريض
  ✅ #10 — i18n العربي الكامل

المرحلة 4 (المحتوى والتشر):
  ✅ #12 — إضافة 20 دكتور
  ✅ #8 — PWA
  ✅ #5 — README.md
```

### اعتبارات مهمة:
- **التخصصات السبعة** يجب أن تُضاف في `backend/models/Doctors.js` كـ `enum` لضمان تناسق البيانات مع الـ Filter
- **RTL** يجب تطبيقه بشكل موحد — استخدام `dir="rtl"` على مستوى `<html>` في `index.html`
- **Dark Mode** المتغيرات تُضاف في `styles.css` ويُطبَّق عبر `data-theme` attribute
- **PWA** يتطلب HTTPS في الإنتاج للعمل الكامل

---

*تم إعداد هذا الملف بواسطة الفريق — يُحدَّث مع كل مرحلة من مراحل التنفيذ.*
