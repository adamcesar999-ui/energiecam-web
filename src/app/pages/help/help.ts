import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from '../../services/message';
import { AppTranslateService } from '../../services/translate';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './help.html',
  styleUrl: './help.css'
})
export class Help {
  comment = '';
  sending = false;
  successStatus = false;
  errorStatus = false;

  constructor(
    private messageService: MessageService,
    public translateService: AppTranslateService
  ) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  get successMessage(): string {
    return this.successStatus
      ? this.t('✅ Votre commentaire a été envoyé à l\'administrateur. Merci !', '✅ Your comment has been sent to the administrator. Thank you!')
      : '';
  }

  get errorMessage(): string {
    return this.errorStatus
      ? this.t('⚠️ Une erreur est survenue. Réessayez.', '⚠️ An error occurred. Please try again.')
      : '';
  }

  sendComment() {
    if (!this.comment.trim()) return;
    this.sending = true;
    this.successStatus = false;
    this.errorStatus = false;

    this.messageService.sendHelp(this.comment).subscribe({
      next: () => {
        this.sending = false;
        this.successStatus = true;
        this.comment = '';
      },
      error: () => {
        this.sending = false;
        this.errorStatus = true;
      }
    });
  }
}
