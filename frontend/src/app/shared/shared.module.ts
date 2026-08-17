import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LanguageToggleComponent } from './components/language-toggle/language-toggle.component';

@NgModule({
  declarations: [NavbarComponent, LanguageToggleComponent],
  imports: [CommonModule, RouterModule, TranslateModule],
  exports: [NavbarComponent, LanguageToggleComponent, TranslateModule]
})
export class SharedModule { }