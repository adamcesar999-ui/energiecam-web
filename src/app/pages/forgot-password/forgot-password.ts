import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppTranslateService } from '../../services/translate';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  email = '';
  loading = false;
  success = false;
  error = '';

  constructor(
    private http: HttpClient,
    public translateService: AppTranslateService
  ) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  submit() {
    if (!this.email) return;
    this.loading = true;
    this.error = '';

    this.http.post(`${environment.apiUrl}/forgot-password`, { email: this.email })
      .subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || this.t('Une erreur est survenue.', 'An error occurred.');
          this.loading = false;
        }
      });
  }
}
