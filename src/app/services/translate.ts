import { Injectable, signal, computed } from '@angular/core';

export type Lang = 'fr' | 'en';

@Injectable({ providedIn: 'root' })
export class AppTranslateService {
  private langSignal = signal<Lang>((localStorage.getItem('lang') as Lang) || 'fr');

  readonly lang = computed(() => this.langSignal());

  getCurrentLang(): Lang {
    return this.langSignal();
  }

  toggleLanguage() {
    const next: Lang = this.langSignal() === 'fr' ? 'en' : 'fr';
    this.langSignal.set(next);
    localStorage.setItem('lang', next);
  }

  t(fr: string, en: string): string {
    return this.langSignal() === 'fr' ? fr : en;
  }
}
