import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'light' | 'dark';
const STORAGE_KEY = 'tammeni-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<AppTheme>('light');

  public theme$ = this.themeSubject.asObservable();
  public currentTheme$ = this.themeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  public initTheme(): void {
    const saved = (localStorage.getItem(STORAGE_KEY) as AppTheme) || 'light';
    this.setTheme(saved);
  }

  public loadSavedTheme(): void {
    this.initTheme();
  }

  public get currentTheme(): AppTheme {
    return this.themeSubject.value;
  }

  public isDark(): boolean {
    return this.currentTheme === 'dark';
  }

  public setTheme(theme: AppTheme): void {
    this.themeSubject.next(theme);
    localStorage.setItem(STORAGE_KEY, theme);

    document.documentElement.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  public toggleTheme(): void {
    const next = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }
}