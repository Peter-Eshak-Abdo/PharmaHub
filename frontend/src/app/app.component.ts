import { Component, OnInit } from '@angular/core';
import { LanguageService } from './core/services/language.service';
import { ThemeService } from './core/services/theme.service';
import { PwaService } from './core/services/pwa.service';
import { SyncService } from './core/services/sync.service';
import { ToastService, ToastMessage } from './core/services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  isInstallable$: Observable<boolean>;
  isOnline$: Observable<boolean>;
  toasts$: Observable<ToastMessage[]>;

  constructor(
    private languageService: LanguageService,
    private themeService: ThemeService,
    public pwaService: PwaService,
    private syncService: SyncService,
    public toastService: ToastService
  ) {
    this.isInstallable$ = this.pwaService.isInstallable$;
    this.isOnline$ = this.pwaService.isOnline$;
    this.toasts$ = this.toastService.toasts$;
  }

  ngOnInit() {
    this.languageService.init();
    this.themeService.loadSavedTheme();
  }

  installPwa(): void {
    this.pwaService.promptInstall().then((accepted) => {
      if (accepted) {
        this.toastService.success('شكراً لتثبيت تطبيق PharmaHub على جهازك!');
      }
    });
  }

  dismissInstall(): void {
    this.pwaService.dismissPrompt();
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }
}

