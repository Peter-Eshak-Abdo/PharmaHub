import { Component } from '@angular/core';
import { LanguageService, AppLanguage } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-toggle',
  template: `
    <button
      type="button"
      (click)="onToggle()"
      class="lang-toggle-btn"
      [attr.aria-label]="'Switch language'"
    >
      <span class="material-symbols-outlined" style="font-size: 18px;">language</span>
      <span>{{ (currentLang === 'en' ? 'LANG.AR' : 'LANG.EN') | translate }}</span>
    </button>
  `,
  styles: [`
    .lang-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid rgba(0,0,0,0.12);
      background: rgba(255,255,255,0.6);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .lang-toggle-btn:hover {
      background: rgba(0,0,0,0.05);
    }
  `]
})
export class LanguageToggleComponent {
  currentLang: AppLanguage;

  constructor(private languageService: LanguageService) {
    this.currentLang = this.languageService.currentLang;
    this.languageService.currentLang$.subscribe(lang => (this.currentLang = lang));
  }

  onToggle() {
    this.languageService.toggle();
  }
}