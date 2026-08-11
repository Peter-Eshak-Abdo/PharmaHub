import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { DummyAdminComponent, DummyDoctorComponent, DummyPatientComponent } from './test-c';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) //[cite: 1]
  },
  { 
    path: 'admin-dashboard', 
    component: DummyAdminComponent, 
    canActivate: [AuthGuard, RoleGuard], //[cite: 1]
    data: { expectedRole: 'admin' } //[cite: 1]
  },
  { 
    path: 'doctor-dashboard', 
    component: DummyDoctorComponent, 
    canActivate: [AuthGuard, RoleGuard], //[cite: 1]
    data: { expectedRole: 'doctor' } //[cite: 1]
  },
  { 
    path: 'appointments', 
    component: DummyPatientComponent, 
    canActivate: [AuthGuard, RoleGuard], //[cite: 1]
    data: { expectedRole: 'patient' } //[cite: 1]
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }