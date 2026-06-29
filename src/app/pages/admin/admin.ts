import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppTranslateService } from '../../services/translate';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  online: boolean;
  created_at: string;
  projects_count: number;
}

interface Stats {
  total_users: number;
  online_users: number;
  total_projects: number;
  help_messages: number;
}

interface HelpMsg {
  id: number;
  content: string;
  created_at: string;
  from_user: { name: string; email: string; role: string };
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  private apiUrl = 'https://zestful-joy-production-291d.up.railway.app/api';

  activeTab: 'users' | 'help' = 'users';

  stats: Stats | null = null;
  users: AdminUser[] = [];
  helpMessages: HelpMsg[] = [];

  editingUser: AdminUser | null = null;
  editName = '';
  editEmail = '';
  editRole = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    public translateService: AppTranslateService
  ) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
    this.loadHelpMessages();
  }

  loadStats() {
    this.http.get<Stats>(`${this.apiUrl}/admin/stats`).subscribe({
      next: (data) => this.stats = data,
      error: (err) => {
        if (err.status === 403) {
          alert(this.t('Accès réservé à l\'administrateur.', 'Access reserved for the administrator.'));
          this.router.navigate(['/dashboard']);
        }
      }
    });
  }

  loadUsers() {
    this.http.get<AdminUser[]>(`${this.apiUrl}/admin/users`).subscribe({
      next: (data) => this.users = data
    });
  }

  loadHelpMessages() {
    this.http.get<HelpMsg[]>(`${this.apiUrl}/admin/help-messages`).subscribe({
      next: (data) => this.helpMessages = data
    });
  }

  refresh() {
    this.loadStats();
    this.loadUsers();
    this.loadHelpMessages();
  }

  switchTab(tab: 'users' | 'help') {
    this.activeTab = tab;
  }

  startEdit(user: AdminUser) {
    this.editingUser = user;
    this.editName = user.name;
    this.editEmail = user.email;
    this.editRole = user.role;
  }

  cancelEdit() {
    this.editingUser = null;
  }

  saveEdit() {
    if (!this.editingUser) return;
    this.http.put(`${this.apiUrl}/admin/users/${this.editingUser.id}`, {
      name: this.editName,
      email: this.editEmail,
      role: this.editRole
    }).subscribe({
      next: () => {
        this.editingUser = null;
        this.loadUsers();
      },
      error: (err) => {
        alert(err.error?.errors ? Object.values(err.error.errors).flat().join(' ') : this.t('Erreur.', 'Error.'));
      }
    });
  }

  deleteUser(user: AdminUser) {
    if (!confirm(this.t(`Supprimer le compte de ${user.name} ?`, `Delete ${user.name}'s account?`))) return;
    this.http.delete(`${this.apiUrl}/admin/users/${user.id}`).subscribe({
      next: () => this.loadUsers(),
      error: (err) => alert(err.error?.message || this.t('Erreur.', 'Error.'))
    });
  }
}
