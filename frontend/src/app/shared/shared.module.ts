import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LanguageToggleComponent } from './components/language-toggle/language-toggle.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  declarations: [
    NavbarComponent,
    LanguageToggleComponent,
    ThemeToggleComponent,
    ChatbotComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    NavbarComponent,
    LanguageToggleComponent,
    ThemeToggleComponent,
    ChatbotComponent,
    FooterComponent
  ]
})
export class SharedModule { }