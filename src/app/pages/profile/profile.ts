import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { AppTranslateService } from '../../services/translate';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {

  // Section infos
  name = '';
  email = '';
  savingProfile = false;
  profileStatus: 'success' | 'error' | '' = '';
  profileErrors: any = {};

  // Section mot de passe
  currentPassword = '';
  newPassword = '';
  newPasswordConfirmation = '';
  savingPassword = false;
  passwordStatus: 'success' | 'error' | '' = '';
  passwordErrors: any = {};

  constructor(
    public auth: Auth,
    public translateService: AppTranslateService
  ) {
    const user = this.auth.currentUser();
    if (user) {
      this.name = user.name;
      this.email = user.email;
    }
  }

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  saveProfile() {
    this.profileStatus = '';
    this.profileErrors = {};
    this.savingProfile = true;

    this.auth.updateProfile({ name: this.name, email: this.email }).subscribe({
      next: () => {
        this.savingProfile = false;
        this.profileStatus = 'success';
      },
      error: (err) => {
        this.savingProfile = false;
        this.profileStatus = 'error';
        this.profileErrors = err.error?.errors || {};
      }
    });
  }

  changePassword() {
    this.passwordStatus = '';
    this.passwordErrors = {};

    if (this.newPassword !== this.newPasswordConfirmation) {
      this.passwordErrors = { new_password_confirmation: [this.t('Les mots de passe ne correspondent pas.', 'Passwords do not match.')] };
      this.passwordStatus = 'error';
      return;
    }

    this.savingPassword = true;

    this.auth.changePassword({
      current_password: this.currentPassword,
      new_password: this.newPassword,
      new_password_confirmation: this.newPasswordConfirmation
    }).subscribe({
      next: () => {
        this.savingPassword = false;
        this.passwordStatus = 'success';
        this.currentPassword = '';
        this.newPassword = '';
        this.newPasswordConfirmation = '';
      },
      error: (err) => {
        this.savingPassword = false;
        this.passwordStatus = 'error';
        this.passwordErrors = err.error?.errors || {};
      }
    });
  }
}