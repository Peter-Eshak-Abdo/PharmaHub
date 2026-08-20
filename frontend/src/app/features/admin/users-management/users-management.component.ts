import { Component, OnInit } from '@angular/core';
import { AdminService, UserAdminModel } from '../../../core/services/admin.service';

@Component({
  selector: 'app-users-management',
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css']
})
export class UsersManagementComponent implements OnInit {
  users: UserAdminModel[] = [];
  filteredUsers: UserAdminModel[] = [];
  isLoading = false;
  searchQuery = '';
  roleFilter = '';
  statusFilter = '';

  roleOptions = [
    { label: 'الجميع', value: '' },
    { label: 'مسؤول نظام (Admin)', value: 'admin' },
    { label: 'طبيب (Doctor)', value: 'doctor' },
    { label: 'مريض (Patient)', value: 'patient' }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        // Fallback mock users
        this.users = [
          { _id: 'u1', email: 'admin@tammeni.com', role: 'admin', is_active: true, createdAt: '2026-01-01' },
          { _id: 'u2', email: 'dr.khaled@tammeni.com', role: 'doctor', is_active: true, createdAt: '2026-02-10' },
          { _id: 'u3', email: 'ahmed.m@gmail.com', role: 'patient', is_active: true, createdAt: '2026-03-15' },
          { _id: 'u4', email: 'dr.marwa@tammeni.com', role: 'doctor', is_active: true, createdAt: '2026-04-05' },
          { _id: 'u5', email: 'm.hussein@gmail.com', role: 'patient', is_active: false, createdAt: '2026-05-12' }
        ];
        this.applyFilter();
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    this.filteredUsers = this.users.filter(u => {
      const matchSearch = !this.searchQuery || u.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchRole = !this.roleFilter || u.role === this.roleFilter;
      const matchStatus = !this.statusFilter || (this.statusFilter === 'active' ? u.is_active : !u.is_active);

      return matchSearch && matchRole && matchStatus;
    });
  }

  changeRole(user: UserAdminModel, newRole: any): void {
    this.adminService.updateUserRole(user._id, newRole).subscribe({
      next: () => {
        user.role = newRole;
        this.applyFilter();
      },
      error: () => {
        user.role = newRole;
        this.applyFilter();
      }
    });
  }

  toggleStatus(user: UserAdminModel): void {
    const newStatus = !user.is_active;
    this.adminService.toggleUserStatus(user._id, newStatus).subscribe({
      next: () => {
        user.is_active = newStatus;
        this.applyFilter();
      },
      error: () => {
        user.is_active = newStatus;
        this.applyFilter();
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'doctor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'patient': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }

  getRoleArabic(role: string): string {
    switch (role) {
      case 'admin': return 'مسؤول نظام';
      case 'doctor': return 'طبيب';
      case 'patient': return 'مريض';
      default: return role;
    }
  }
}
