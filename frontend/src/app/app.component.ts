import { Component, OnInit } from '@angular/core';
import { LanguageService } from './core/services/language.servics';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';

  constructor(private languageService: LanguageService) {}

  ngOnInit() {
    this.languageService.init();
  }
}