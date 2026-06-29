import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { NewsService, NewsItem } from '../../services/news';
import { AppTranslateService } from '../../services/translate';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  news: NewsItem[] = [];
  loadingNews = true;

  constructor(
    public auth: Auth,
    private router: Router,
    private newsService: NewsService,
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
}
