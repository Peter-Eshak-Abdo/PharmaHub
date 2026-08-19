import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ActionButton {
  label: string;
  route: string;
  icon?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: Date;
  actionButtons?: ActionButton[];
  contextSummary?: {
    hasHistory: boolean;
    isGuest?: boolean;
    patientName?: string;
    totalVisits?: number;
    diagnosesCount?: number;
    medicationsCount?: number;
    diagnoses?: string[];
    medications?: string[];
  };
}

export interface ContextSummary {
  hasHistory: boolean;
  isGuest?: boolean;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  totalVisits: number;
  diagnosesCount: number;
  medicationsCount: number;
  diagnoses: string[];
  medications: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$ = this.isOpenSubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private contextSubject = new BehaviorSubject<ContextSummary | null>(null);
  public context$ = this.contextSubject.asObservable();

  constructor(private http: HttpClient) { }

  public toggleChat(): void {
    const nextState = !this.isOpenSubject.value;
    this.isOpenSubject.next(nextState);
    if (nextState && this.messagesSubject.value.length === 0) {
      this.loadContext();
    }
  }

  public openChat(): void {
    this.isOpenSubject.next(true);
    if (this.messagesSubject.value.length === 0) {
      this.loadContext();
    }
  }

  public closeChat(): void {
    this.isOpenSubject.next(false);
  }

  public loadContext(): void {
    this.http.get<{ success: boolean; summary: ContextSummary }>(`${this.apiUrl}/context`)
      .pipe(
        catchError(err => {
          console.warn('Could not load chat context:', err);
          return of({ success: false, summary: { hasHistory: false, isGuest: true, totalVisits: 0, diagnosesCount: 0, medicationsCount: 0, diagnoses: [], medications: [] } });
        })
      )
      .subscribe(res => {
        if (res?.success && res.summary) {
          this.contextSubject.next(res.summary);
          this.initWelcomeMessage(res.summary);
        } else {
          this.initWelcomeMessage(null);
        }
      });
  }

  private initWelcomeMessage(context: ContextSummary | null): void {
    if (this.messagesSubject.value.length > 0) return;

    let welcomeText = `مرحباً بك في **PharmaHub AI Assistant** 🩺\nأنا مساعدك الذكي، هنا لإرشادك في استخدام كل مميزات التطبيق، الإجابة عن استفسارات أدويتك وصحتك، وتسهيل حجز الكشوفات!`;
    const initialButtons: ActionButton[] = [
      { label: '📅 حجز موعد كشف', route: '/appointments/book', icon: 'calendar' },
      { label: '👨‍⚕️ قائمة الأطباء', route: '/profiles/doctor-list', icon: 'users' },
      { label: '💊 دليل الأدوية', route: '/medical/catalog', icon: 'package' }
    ];

    if (context?.hasHistory) {
      welcomeText += `\n\n✅ **تم ربط المحادثة بسجلك الطبي بنجاح:**\n`;
      if (context.diagnoses?.length) {
        welcomeText += `• **التشخيصات المسجلة**: ${context.diagnoses.join('، ')}\n`;
      }
      if (context.medications?.length) {
        welcomeText += `• **الأدوية الحالية**: ${context.medications.join('، ')}\n`;
      }
      welcomeText += `\nيمكنك سؤالي مباشرة عن أي تعارضات دوائية، مواعيد الجرعات، أو طلب التنقل لأي قسم!`;
      initialButtons.push({ label: '📋 عرض روشتاتي', route: '/medical/prescription-view', icon: 'file-text' });
    } else {
      welcomeText += `\n\nكيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن طريقة حجز كشف، دليل الأدوية، أو أي استشارة صحية!`;
    }

    const welcomeMsg: ChatMessage = {
      id: 'welcome-' + Date.now(),
      sender: 'bot',
      text: welcomeText,
      timestamp: new Date(),
      actionButtons: initialButtons.slice(0, 3),
      contextSummary: context || undefined
    };

    this.messagesSubject.next([welcomeMsg]);
  }

  public sendMessage(userText: string): void {
    if (!userText || !userText.trim()) return;

    const trimmed = userText.trim();
    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date()
    };

    // Add user message to state
    const currentList = this.messagesSubject.value;
    this.messagesSubject.next([...currentList, userMsg]);
    this.isLoadingSubject.next(true);

    // Format history for backend
    const historyPayload = currentList
      .filter(m => m.sender === 'user' || m.sender === 'bot')
      .slice(-6)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    this.http.post<{ success: boolean; reply: string; actionButtons?: ActionButton[]; contextSummary?: ContextSummary }>(
      `${this.apiUrl}/message`,
      {
        message: trimmed,
        history: historyPayload
      }
    ).pipe(
      catchError(err => {
        console.error('Chat API Error:', err);
        const errorReply = err?.error?.message || 'عذراً، حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.';
        return of<{ success: boolean; reply: string; actionButtons?: ActionButton[]; contextSummary?: ContextSummary }>({
          success: false,
          reply: `⚠️ **تنبيه**: ${errorReply}`,
          actionButtons: [
            { label: '📅 حجز كشف', route: '/appointments/book', icon: 'calendar' },
            { label: '👨‍⚕️ دليل الأطباء', route: '/profiles/doctor-list', icon: 'users' }
          ]
        });
      }),
      tap(() => this.isLoadingSubject.next(false))
    ).subscribe(res => {
      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: res.reply || 'تم استلام رد فارغ من المساعد.',
        timestamp: new Date(),
        actionButtons: res.actionButtons,
        contextSummary: res.contextSummary
      };

      if (res.contextSummary) {
        this.contextSubject.next(res.contextSummary);
      }

      this.messagesSubject.next([...this.messagesSubject.value, botMsg]);
    });
  }

  public clearChat(): void {
    this.messagesSubject.next([]);
    this.initWelcomeMessage(this.contextSubject.value);
  }
}
