import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { NotificationService, AppNotification } from '../../services/notification';
import { AppTranslateService } from '../../services/translate';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  notifications: AppNotification[] = [];
  showNotifPanel = false;
  showLogoutConfirm = false;
  darkMode = false;
  showShareMenu = false;

  constructor(
    public auth: Auth,
    private router: Router,
    private notifService: NotificationService,
    private elementRef: ElementRef,
    public translateService: AppTranslateService
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.loadNotifications();
    }
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.darkMode = true;
      document.body.classList.add('dark-mode');
    }
  }

  get currentLang(): string {
    return this.translateService.getCurrentLang().toUpperCase();
  }

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  loadNotifications() {
    this.notifService.getAll().subscribe({
      next: (data) => this.notifications = data
    });
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showNotifPanel = false;
      this.showShareMenu = false;
    }
  }

  toggleLang() {
    this.translateService.toggleLanguage();
  }

  toggleShareMenu() {
    this.showShareMenu = !this.showShareMenu;
    this.showNotifPanel = false;
  }

  shareWhatsApp() {
    const url = encodeURIComponent('https://energiecam.cm');
    window.open(`https://wa.me/?text=Découvrez EnergieCam, le logiciel de dimensionnement solaire et éolien pour le Cameroun ! ${url}`, '_blank');
  }

  shareEmail() {
    window.location.href = `mailto:?subject=EnergieCam&body=Découvrez EnergieCam, le logiciel de dimensionnement solaire et éolien pour le Cameroun : https://energiecam.cm`;
  }

  shareSMS() {
    window.location.href = `sms:?body=Découvrez EnergieCam : https://energiecam.cm`;
  }

  copyLink() {
    navigator.clipboard.writeText('https://energiecam.cm').then(() => {
      alert(this.t('Lien copié dans le presse-papiers !', 'Link copied to clipboard!'));
    });
  }

  toggleNotifPanel() {
    this.showNotifPanel = !this.showNotifPanel;
    if (this.showNotifPanel) {
      this.loadNotifications();
    }
  }

  markAllRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifService.markAllRead().subscribe({
      error: () => console.log('Erreur markAllRead')
    });
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode', this.darkMode);
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
  }

  confirmLogout() {
    this.showLogoutConfirm = true;
  }

  cancelLogout() {
    this.showLogoutConfirm = false;
  }

  doLogout() {
    this.auth.logout().subscribe({
      next: () => {
        this.showLogoutConfirm = false;
        this.router.navigate(['/login']);
      },
      error: () => {
        this.auth.clearSession();
        this.showLogoutConfirm = false;
        this.router.navigate(['/login']);
      }
    });
  }
}
