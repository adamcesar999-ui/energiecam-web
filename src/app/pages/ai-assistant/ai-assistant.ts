import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AiService, ChatHistoryEntry } from '../../services/ai';
import { AppTranslateService } from '../../services/translate';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  time: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.css'
})
export class AiAssistant {
  activeTab: 'chat' | 'recommend' | 'predict' = 'chat';

  // Chat
  messages: ChatMessage[] = [];
  chatInput = '';
  chatLoading = false;

  // Recommandation
  recConsumption = 0;
  recCity = '';
  recSunHours = 0;
  recWindSpeed = 0;
  recBudget: number | null = null;
  recResult = '';
  recLoading = false;

  // Prédiction
  predAppliances: any[] = [
    { name: 'Ampoule LED', power: 10, hours: 6, qty: 4 },
    { name: 'Téléviseur', power: 80, hours: 4, qty: 1 },
    { name: 'Réfrigérateur', power: 150, hours: 24, qty: 1 },
  ];
  predResult = '';
  predLoading = false;

  constructor(
    private aiService: AiService,
    public translateService: AppTranslateService
  ) {
    this.messages = [
      {
        role: 'ai',
        content: this.t(
          'Je suis votre assistant spécialisé en énergies renouvelables pour le Cameroun. Posez vos questions sur le solaire, l\'éolien, ou l\'interprétation de vos résultats de dimensionnement.',
          'I am your assistant specializing in renewable energy for Cameroon. Ask your questions about solar, wind, or interpreting your sizing results.'
        ),
        time: this.currentTime()
      }
    ];
  }

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  currentTime(): string {
    const locale = this.translateService.getCurrentLang() === 'fr' ? 'fr-FR' : 'en-US';
    return new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  }

  get totalConsumption(): number {
    return this.predAppliances.reduce((s, a) => s + a.power * a.hours * a.qty, 0);
  }

  switchTab(tab: 'chat' | 'recommend' | 'predict') {
    this.activeTab = tab;
  }

  // ===== CHAT =====
  private buildHistory(): ChatHistoryEntry[] {
    // On exclut le tout premier message d'accueil (index 0) pour ne pas polluer l'historique envoyé à l'IA
    return this.messages.slice(1).map(m => ({
      role: m.role === 'user' ? 'user' as const : 'assistant' as const,
      content: m.content
    }));
  }

  sendChat() {
    if (!this.chatInput.trim() || this.chatLoading) return;
    const userMsg = this.chatInput.trim();

    const history = this.buildHistory();

    this.messages.push({
      role: 'user',
      content: userMsg,
      time: this.currentTime()
    });
    this.chatInput = '';
    this.chatLoading = true;

    this.aiService.chat(userMsg, history).subscribe({
      next: (res) => {
        this.messages.push({
          role: 'ai',
          content: res.response,
          time: this.currentTime()
        });
        this.chatLoading = false;
        setTimeout(() => {
          const log = document.getElementById('chatLog');
          if (log) log.scrollTop = log.scrollHeight;
        }, 100);
      },
      error: () => {
        this.messages.push({
          role: 'ai',
          content: this.t('Erreur de connexion à l\'IA. Vérifiez que le serveur Laravel est démarré.', 'AI connection error. Check that the Laravel server is running.'),
          time: this.currentTime()
        });
        this.chatLoading = false;
      }
    });
  }
onChatKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    this.sendChat();
  }
}

  // ===== RECOMMANDATION =====
  getRecommendation() {
    if (!this.recCity || !this.recConsumption) return;
    this.recLoading = true;
    this.recResult = '';

    this.aiService.recommend({
      consumption: this.recConsumption,
      city: this.recCity,
      sun_hours: this.recSunHours,
      wind_speed: this.recWindSpeed,
      budget: this.recBudget ?? undefined
    }).subscribe({
      next: (res) => {
        this.recResult = res.recommendation;
        this.recLoading = false;
      },
      error: () => {
        this.recResult = this.t('Erreur de connexion à l\'IA.', 'AI connection error.');
        this.recLoading = false;
      }
    });
  }

  // ===== PRÉDICTION =====
  getPrediction() {
    this.predLoading = true;
    this.predResult = '';

    this.aiService.predict({
      appliances: this.predAppliances,
      current_consumption: this.totalConsumption
    }).subscribe({
      next: (res) => {
        this.predResult = res.prediction;
        this.predLoading = false;
      },
      error: () => {
        this.predResult = this.t('Erreur de connexion à l\'IA.', 'AI connection error.');
        this.predLoading = false;
      }
    });
  }

  addAppliance() {
    this.predAppliances.push({ name: this.t('Nouvel appareil', 'New appliance'), power: 50, hours: 4, qty: 1 });
  }

  removeAppliance(i: number) {
    this.predAppliances.splice(i, 1);
  }
}