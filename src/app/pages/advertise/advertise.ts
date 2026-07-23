import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdService } from '../../services/ad';
import { AppTranslateService } from '../../services/translate';

@Component({
  selector: 'app-advertise',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './advertise.html',
  styleUrl: './advertise.css'
})
export class Advertise {
  companyName = '';
  title = '';
  description = '';
  targetUrl = '';
  ctaLabel = '';
  contactEmail = '';
  imageFile: File | null = null;
  imagePreview: string | null = null;

  submitting = false;
  submitStatus: 'success' | 'error' | '' = '';
  errorMessage = '';

  constructor(
    private adService: AdService,
    public translateService: AppTranslateService
  ) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = this.t(
          'L\'image ne doit pas dépasser 2 Mo.',
          'Image must not exceed 2 MB.'
        );
        return;
      }

      this.imageFile = file;
      this.errorMessage = '';

      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  isFormValid(): boolean {
    return !!(
      this.companyName.trim() &&
      this.title.trim() &&
      this.description.trim() &&
      this.targetUrl.trim() &&
      this.contactEmail.trim() &&
      this.imageFile
    );
  }

  submit() {
    if (!this.isFormValid()) {
      this.errorMessage = this.t(
        'Veuillez remplir tous les champs obligatoires et ajouter une image.',
        'Please fill all required fields and add an image.'
      );
      return;
    }

    this.submitting = true;
    this.submitStatus = '';
    this.errorMessage = '';

    this.adService.submitAd({
      company_name: this.companyName,
      title: this.title,
      description: this.description,
      target_url: this.targetUrl,
      cta_label: this.ctaLabel,
      contact_email: this.contactEmail,
      image: this.imageFile!
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.submitStatus = 'success';
        this.resetForm();
      },
      error: (err) => {
        this.submitting = false;
        this.submitStatus = 'error';
        this.errorMessage = err?.error?.errors
          ? Object.values(err.error.errors).flat().join(' ')
          : this.t('Une erreur est survenue. Veuillez réessayer.', 'An error occurred. Please try again.');
      }
    });
  }

  resetForm() {
    this.companyName = '';
    this.title = '';
    this.description = '';
    this.targetUrl = '';
    this.ctaLabel = '';
    this.contactEmail = '';
    this.imageFile = null;
    this.imagePreview = null;
  }
}