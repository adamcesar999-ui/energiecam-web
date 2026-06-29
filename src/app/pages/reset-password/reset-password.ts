import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppTranslateService } from '../../services/translate';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
  email = '';
  token = '';
  password = '';
  password_confirmation = '';
  loading = false;
  success = false;
  error = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    public translateService: AppTranslateService
  ) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
    });
  }

  submit() {
    if (!this.password || !this.password_confirmation) return;
    if (this.password !== this.password_confirmation) {
      this.error = this.t('Les mots de passe ne correspondent pas.', 'Passwords do not match.');
      return;
    }
    this.loading = true;
    this.error = '';

    this.http.post(`${environment.apiUrl}/reset-password`, {
      email: this.email,
      token: this.token,
      password: this.password,
      password_confirmation: this.password_confirmation,
    }).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.error = err.error?.message || this.t('Une erreur est survenue.', 'An error occurred.');
        this.loading = false;
      }
    });
  }
}
