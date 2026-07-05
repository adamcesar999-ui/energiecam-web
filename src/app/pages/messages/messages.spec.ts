import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MessageService, ChatUser, Msg } from '../../services/message';
import { Auth } from '../../services/auth';
import { AppTranslateService } from '../../services/translate';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class Messages implements OnInit {

  activeTab: 'inbox' | 'forum' = 'inbox';

  chatUsers: ChatUser[] = [];
  selectedUser: ChatUser | null = null;
  conversation: Msg[] = [];
  chatInput = '';

  forumPosts: Msg[] = [];
  forumInput = '';

  // ⬅️ NOUVEAU : id utilisateur ciblé depuis une notification
  targetUserId: number | null = null;

  constructor(
    public auth: Auth,
    private messageService: MessageService,
    public translateService: AppTranslateService,
    private route: ActivatedRoute   // ⬅️ NOUVEAU
  ) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  ngOnInit() {
    // ⬅️ NOUVEAU : récupère ?userId=xxx dans l'URL (venant d'une notification)
    this.route.queryParams.subscribe(params => {
      const id = params['userId'];
      this.targetUserId = id ? Number(id) : null;
      this.activeTab = 'inbox'; // on s'assure d'être sur l'onglet inbox si on vient d'une notif
    });

    this.loadChatUsers();
    this.loadForum();
  }

  loadChatUsers() {
    this.messageService.getChatUsers().subscribe({
      next: (users) => {
        this.chatUsers = users;

        // ⬅️ MODIFIÉ : priorité à l'utilisateur ciblé par la notification
        if (this.targetUserId) {
          const target = users.find(u => u.id === this.targetUserId);
          if (target) {
            this.selectUser(target);
            return;
          }
        }

        // Comportement par défaut inchangé si pas de cible (ou cible introuvable)
        const admin = users.find(u => u.role === 'admin');
        if (admin) {
          this.selectUser(admin);
        } else if (users.length) {
          this.selectUser(users[0]);
        }
      }
    });
  }

  selectUser(user: ChatUser) {
    this.selectedUser = user;
    this.messageService.getConversation(user.id).subscribe({
      next: (msgs) => {
        this.conversation = msgs;
      },
      error: (err) => console.log('erreur conversation', err)
    });
  }

  sendMsg() {
    if (!this.chatInput.trim() || !this.selectedUser) return;
    this.messageService.sendPrivate(this.selectedUser.id, this.chatInput).subscribe({
      next: (msg) => {
        this.conversation.push(msg);
        this.chatInput = '';
      }
    });
  }

  loadForum() {
    this.messageService.getForum().subscribe({
      next: (posts) => this.forumPosts = posts
    });
  }

  postForum() {
    if (!this.forumInput.trim()) return;
    this.messageService.postForum(this.forumInput).subscribe({
      next: () => {
        this.forumInput = '';
        this.loadForum();
      }
    });
  }

  deleteForumPost(id: number) {
    if (!confirm(this.t('Supprimer ce message du forum ?', 'Delete this forum message?'))) return;
    this.messageService.deleteForum(id).subscribe({
      next: () => this.loadForum()
    });
  }

  switchTab(tab: 'inbox' | 'forum') {
    this.activeTab = tab;
  }
}