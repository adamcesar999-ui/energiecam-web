import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdService, Advertisement } from '../../../services/ad';
import { AppTranslateService } from '../../../services/translate';

@Component({
  selector: 'app-ad-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ad-moderation.html',
  styleUrl: './ad-moderation.css'
})
export class AdModeration implements OnInit {
  ads: Advertisement[] = [];
  loading = true;
  currentFilter: string = 'pending';
  currentPage = 1;
  lastPage = 1;

  // Etat du modal de rejet
  showRejectModal = false;
  rejectingAd: Advertisement | null = null;
  rejectReason = '';

  // Etat du modal d'approbation / modification des dates
  showApproveModal = false;
  approvingAd: Advertisement | null = null;
  approveStartDate = '';
  approveEndDate = '';
  isEditingDates = false; // distingue "Approuver" (nouvelle pub) de "Modifier dates" (pub déjà active)

  actionMessage = '';
  actionError = '';

  constructor(
    private adService: AdService,
    public translateService: AppTranslateService
  ) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  ngOnInit() {
    this.loadAds();
  }

  setFilter(status: string) {
    this.currentFilter = status;
    this.currentPage = 1;
    this.loadAds();
  }

  loadAds() {
    this.loading = true;
    this.adService.getAllAds(this.currentFilter || undefined, this.currentPage).subscribe({
      next: (res) => {
        this.ads = res.data;
        this.lastPage = res.last_page;
        this.loading = false;
      },
      error: () => {
        this.ads = [];
        this.loading = false;
      }
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.lastPage) return;
    this.currentPage = page;
    this.loadAds();
  }

  // ===== Approbation (nouvelle pub) =====

  openApproveModal(ad: Advertisement) {
    this.approvingAd = ad;
    this.approveStartDate = new Date().toISOString().slice(0, 10);
    this.approveEndDate = '';
    this.isEditingDates = false;
    this.showApproveModal = true;
  }

  // ===== Modification des dates (pub déjà active) =====

  openEditDatesModal(ad: Advertisement) {
    this.approvingAd = ad;
    this.approveStartDate = ad.start_date ? ad.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10);
    this.approveEndDate = ad.end_date ? ad.end_date.slice(0, 10) : '';
    this.isEditingDates = true;
    this.showApproveModal = true;
  }

  confirmApprove() {
    if (!this.approvingAd) return;
    this.adService.approveAd(this.approvingAd.id, this.approveStartDate, this.approveEndDate || undefined).subscribe({
      next: () => {
        this.actionMessage = this.isEditingDates
          ? this.t('Dates mises à jour avec succès.', 'Dates updated successfully.')
          : this.t('Publicité approuvée avec succès.', 'Ad approved successfully.');
        this.showApproveModal = false;
        this.approvingAd = null;
        this.isEditingDates = false;
        this.loadAds();
        setTimeout(() => this.actionMessage = '', 3000);
      },
      error: () => {
        this.actionError = this.t('Erreur lors de l\'opération.', 'Error during operation.');
        setTimeout(() => this.actionError = '', 3000);
      }
    });
  }

  cancelApprove() {
    this.showApproveModal = false;
    this.approvingAd = null;
    this.isEditingDates = false;
  }

  // ===== Suspension (repasse en attente sans supprimer) =====

  suspendAd(ad: Advertisement) {
    if (!confirm(this.t(
      `Suspendre la publicité "${ad.title}" ? Elle repassera en statut "En attente" et ne sera plus visible sur le dashboard, mais restera enregistrée.`,
      `Suspend the ad "${ad.title}"? It will go back to "Pending" status and won't be visible on the dashboard, but will remain saved.`
    ))) return;

    this.adService.suspendAd(ad.id).subscribe({
      next: () => {
        this.actionMessage = this.t('Publicité suspendue.', 'Ad suspended.');
        this.loadAds();
        setTimeout(() => this.actionMessage = '', 3000);
      },
      error: () => {
        this.actionError = this.t('Erreur lors de la suspension.', 'Error suspending the ad.');
        setTimeout(() => this.actionError = '', 3000);
      }
    });
  }

  // ===== Rejet =====

  openRejectModal(ad: Advertisement) {
    this.rejectingAd = ad;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  confirmReject() {
    if (!this.rejectingAd) return;
    this.adService.rejectAd(this.rejectingAd.id, this.rejectReason).subscribe({
      next: () => {
        this.actionMessage = this.t('Publicité rejetée.', 'Ad rejected.');
        this.showRejectModal = false;
        this.rejectingAd = null;
        this.loadAds();
        setTimeout(() => this.actionMessage = '', 3000);
      },
      error: () => {
        this.actionError = this.t('Erreur lors du rejet.', 'Error rejecting the ad.');
        setTimeout(() => this.actionError = '', 3000);
      }
    });
  }

  cancelReject() {
    this.showRejectModal = false;
    this.rejectingAd = null;
  }

  // ===== Suppression =====

  deleteAd(ad: Advertisement) {
    if (!confirm(this.t(
      `Supprimer définitivement la publicité "${ad.title}" ?`,
      `Permanently delete the ad "${ad.title}"?`
    ))) return;

    this.adService.deleteAd(ad.id).subscribe({
      next: () => {
        this.actionMessage = this.t('Publicité supprimée.', 'Ad deleted.');
        this.loadAds();
        setTimeout(() => this.actionMessage = '', 3000);
      },
      error: () => {
        this.actionError = this.t('Erreur lors de la suppression.', 'Error deleting the ad.');
        setTimeout(() => this.actionError = '', 3000);
      }
    });
  }

  statusBadge(status?: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  }
}