import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

  constructor(
    public auth: Auth,
    private messageService: MessageService,
    public translateService: AppTranslateService
  ) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  ngOnInit() {
    this.loadChatUsers();
    this.loadForum();
  }

  loadChatUsers() {
    this.messageService.getChatUsers().subscribe({
      next: (users) => {
        this.chatUsers = users;
        // Sélectionner l'admin par défaut s'il existe
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
    console.log('selectUser appelé avec', user);
    this.selectedUser = user;
    this.messageService.getConversation(user.id).subscribe({
      next: (msgs) => {
        console.log('conversation reçue', msgs);
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
