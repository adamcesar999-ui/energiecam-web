import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { NewsService, NewsItem } from '../../services/news';
import { AdService, Advertisement } from '../../services/ad';
import { AppTranslateService } from '../../services/translate';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  news: NewsItem[] = [];
  loadingNews = true;

  // ===== Publicités =====
  ads: Advertisement[] = [];
  currentAdIndex = 0;
  private adInterval: any;

  constructor(
    public auth: Auth,
    private router: Router,
    private newsService: NewsService,
    private adService: AdService,
    public translateService: AppTranslateService
  ) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  ngOnInit() {
    this.newsService.getLiveNews().subscribe({
      next: (data) => {
        this.news = data;
        this.loadingNews = false;
      },
      error: () => {
        this.newsService.getAll().subscribe({
          next: (data) => {
            this.news = data;
            this.loadingNews = false;
          }
        });
      }
    });

    this.loadAds();
  }

  ngOnDestroy() {
    if (this.adInterval) {
      clearInterval(this.adInterval);
    }
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.auth.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }

  categoryColor(cat: string): string {
    const colors: any = {
      'Régional'      : 'success',
      'International' : 'primary',
      'Potentiel'     : 'warning',
      'Cameroun'      : 'danger',
      'Industrie'     : 'info'
    };
    return colors[cat] || 'secondary';
  }

  // ===================================================
  // PUBLICITÉS
  // ===================================================

  loadAds() {
    this.adService.getActiveAds().subscribe({
      next: (ads) => {
        this.ads = ads;
        if (this.ads.length > 1) {
          this.adInterval = setInterval(() => this.nextAd(), 6000);
        }
      },
      error: () => {
        this.ads = [];
      }
    });
  }

  get currentAd(): Advertisement | null {
    return this.ads.length ? this.ads[this.currentAdIndex] : null;
  }

  nextAd() {
    if (!this.ads.length) return;
    this.currentAdIndex = (this.currentAdIndex + 1) % this.ads.length;
  }

  prevAd() {
    if (!this.ads.length) return;
    this.currentAdIndex = (this.currentAdIndex - 1 + this.ads.length) % this.ads.length;
  }

  goToAd(index: number) {
    this.currentAdIndex = index;
  }

  onAdClick(ad: Advertisement) {
    this.adService.trackClick(ad.id).subscribe();
    window.open(ad.target_url, '_blank', 'noopener');
  }
}