import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService, AppTheme } from '../../core/services/theme.service';
import { LanguageService, AppLanguage } from '../../core/services/language.servics';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  currentTheme: AppTheme = 'light';
  currentLang: AppLanguage = 'ar';
  currentUser: any = null;

  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.currentTheme;
    this.themeService.currentTheme$.subscribe((t: AppTheme) => this.currentTheme = t);

    this.currentLang = this.languageService.currentLang;
    this.languageService.currentLang$.subscribe((l: AppLanguage) => this.currentLang = l);

    this.currentUser = this.authService.getCurrentUser();
  }

  setTheme(theme: AppTheme): void {
    this.themeService.setTheme(theme);
  }

  setLanguage(lang: AppLanguage): void {
    this.languageService.setLanguage(lang);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

