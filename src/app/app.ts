import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Auth } from './services/auth';
import { AppTranslateService } from './services/translate';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'energiecam-web';

  constructor(
    public auth: Auth,
    public translateService: AppTranslateService
  ) {}

  get currentLang(): string {
    return this.translateService.getCurrentLang().toUpperCase();
  }

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  toggleLang() {
    this.translateService.toggleLanguage();
  }
}
