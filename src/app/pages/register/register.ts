import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { AppTranslateService } from '../../services/translate';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  name = '';
  email = '';
  password = '';
  role = 'particulier';
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private auth: Auth,
    private router: Router,
    public translateService: AppTranslateService
  ) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.auth.register({ name: this.name, email: this.email, password: this.password, role: this.role }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = this.t('Compte créé avec succès ! Vous pouvez vous connecter.', 'Account created successfully! You can now login.');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 422 && err.error?.errors) {
          const errors = err.error.errors;
          this.errorMessage = Object.values(errors).flat().join(' ');
        } else {
          this.errorMessage = this.t('Une erreur est survenue. Vérifiez que le serveur est démarré.', 'An error occurred. Check that the server is running.');
        }
      }
    });
  }
}
