import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private currentThemeSubject = new BehaviorSubject<AppTheme>('light');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {}

  get currentTheme(): AppTheme {
    return this.currentThemeSubject.value;
  }

  setTheme(theme: AppTheme): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.currentThemeSubject.next(theme);
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  loadSavedTheme(): void {
    const saved = (localStorage.getItem(this.THEME_KEY) as AppTheme) || 'light';
    this.setTheme(saved);
  }
}
