import { Component, OnInit } from '@angular/core';
import { ThemeService, AppTheme } from 'src/app/core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button 
      (click)="toggleTheme()" 
      class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm"
      [title]="isDark ? 'التحويل للوضع الفاتح (Light Mode)' : 'التحويل للوضع الداكن (Dark Mode)'">
      <span class="material-symbols-outlined text-lg">
        {{ isDark ? 'light_mode' : 'dark_mode' }}
      </span>
      <span class="hidden sm:inline">
        {{ isDark ? 'مضيء' : 'داكن' }}
      </span>
    </button>
  `
})
export class ThemeToggleComponent implements OnInit {
  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.initTheme();
  }

  get isDark(): boolean {
    return this.themeService.isDark();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
