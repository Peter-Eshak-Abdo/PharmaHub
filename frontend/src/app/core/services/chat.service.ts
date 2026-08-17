import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: Date;
  contextSummary?: {
    hasHistory: boolean;
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
          return of({ success: false, summary: null as any });
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

    let welcomeText = `مرحباً بك في **PharmaHub AI Assistant** 🩺\nأنا مساعدك الطبي الذكي، جاهز للإجابة عن استفساراتك حول أدويتك، الجرعات، التفاعلات الدوائية، وإرشادات الرعاية الصحية.`;

    if (context?.hasHistory) {
      welcomeText += `\n\n✅ **تم ربط المحادثة بسجلك الطبي بنجاح:**\n`;
      if (context.diagnoses?.length) {
        welcomeText += `• **التشخيصات المسجلة**: ${context.diagnoses.join('، ')}\n`;
      }
      if (context.medications?.length) {
        welcomeText += `• **الأدوية الحالية**: ${context.medications.join('، ')}\n`;
      }
      welcomeText += `\nيمكنك سؤالي مباشرة عن أي تعارضات دوائية أو نصائح متعلقة بعلاجك!`;
    } else {
      welcomeText += `\n\nكيف يمكنني مساعدتك اليوم بخصوص صحتك أو أدويتك؟`;
    }

    const welcomeMsg: ChatMessage = {
      id: 'welcome-' + Date.now(),
      sender: 'bot',
      text: welcomeText,
      timestamp: new Date(),
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

    this.http.post<{ success: boolean; reply: string; contextSummary?: ContextSummary }>(
      `${this.apiUrl}/message`,
      {
        message: trimmed,
        history: historyPayload
      }
    ).pipe(
      catchError(err => {
        console.error('Chat API Error:', err);
        const errorReply = err?.error?.message || 'عذراً، حدث خطأ أثناء التواصل مع المساعد الذكي. يرجى المحاولة مرة أخرى.';
        return of<{ success: boolean; reply: string; contextSummary?: ContextSummary }>({
          success: false,
          reply: `⚠️ **تنبيه**: ${errorReply}`
        });
      }),
      tap(() => this.isLoadingSubject.next(false))
    ).subscribe(res => {
      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: res.reply || 'تم استلام رد فارغ من المساعد.',
        timestamp: new Date(),
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
