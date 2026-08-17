import { Injectable }  from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject } from "rxjs";
export type AppLanguage = 'en'|'ar';
const STORAGE_KEY = 'pharmahub-lang';
const RTL_LANGUAGES: AppLanguage[]=['ar'];
@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<AppLanguage>('en');
  currentLang$ = this.currentLangSubject.asObservable();

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');
  }

  init() {
    const saved = (localStorage.getItem(STORAGE_KEY) as AppLanguage) || 'en';
    this.setLanguage(saved);
  }

  get currentLang(): AppLanguage {
    return this.currentLangSubject.value;
  }

  isRtl(lang: AppLanguage = this.currentLang): boolean {
    return RTL_LANGUAGES.includes(lang);
  }

  setLanguage(lang: AppLanguage) {
    this.translate.use(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    this.currentLangSubject.next(lang);

    const dir = this.isRtl(lang) ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);
  }

  toggle() {
    this.setLanguage(this.currentLang === 'en' ? 'ar' : 'en');
  }
}
