import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then(
        (m) => m.AdminModule,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(
        (m) => m.DashboardModule,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'schedule',
    loadChildren: () =>
      import('./features/schedule/schedule.module').then(
        (m) => m.ScheduleModule,
      ),
    // component: WeeklyAvailabilityComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'appointments',
    loadChildren: () =>
      import('./features/appointments/appointments.module').then(
        (m) => m.AppointmentsModule,
      ),
    // component: PatientAppointmentsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'medical',
    loadChildren: () =>
      import('./features/medical/medical.module').then((m) => m.MedicalModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'profiles',
    loadChildren: () =>
      import('./features/profiles/profiles.module').then(
        (m) => m.ProfilesModule,
      ),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./features/settings/settings.module').then(
        (m) => m.SettingsModule,
      ),
  },
  {
    path: 'unauthorized',
    loadChildren: () =>
      import('./features/unauthorized/unauthorized.module').then(
        (m) => m.UnauthorizedModule,
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/landing/landing.module').then((m) => m.LandingModule),
  },
  {
    path: '**',
    loadChildren: () =>
      import('./features/not-found/not-found.module').then(
        (m) => m.NotFoundModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
