import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) 
  },
  { 
    path: 'admin-dashboard', 
    canActivate: [AuthGuard, RoleGuard], 
    data: { expectedRole: 'admin' } 
  },
  { 
    path: 'doctor-dashboard', 

    canActivate: [AuthGuard, RoleGuard], 
    data: { expectedRole: 'doctor' } 
  },
  { 
    path: 'appointments', 

    canActivate: [AuthGuard, RoleGuard], 
    data: { expectedRole: 'patient' } 
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }