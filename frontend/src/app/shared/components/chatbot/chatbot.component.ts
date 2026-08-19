import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessage, ContextSummary, ActionButton } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';

interface SuggestionCategory {
  id: 'nav' | 'meds' | 'health';
  label: string;
  icon: string;
  questions: string[];
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  isLoading = false;
  messages: ChatMessage[] = [];
  context: ContextSummary | null = null;
  inputText: string = '';
  isLoggedIn = false;
  copiedMessageId: string | null = null;

  activeCategory: 'nav' | 'meds' | 'health' = 'nav';

  suggestionCategories: SuggestionCategory[] = [
    {
      id: 'nav',
      label: 'خدمات وتنقل 🗺️',
      icon: 'map-pin',
      questions: [
        'ازاي احجز كشف مع طبيب؟',
        'قائمة الأطباء والتخصصات المتاحة',
        'أين أجد روشتاتي ووصفاتي الطبية؟',
        'عرض سجلي الطبي وتاريخ الكشوفات',
        'دليل وكتالوج الأدوية المتاحة'
      ]
    },
    {
      id: 'meds',
      label: 'أدوية وتفاعلات 💊',
      icon: 'package',
      questions: [
        'هل يوجد تعارض بين أدويتي الحالية؟',
        'ما هي مواعيد وجرعات أدويتي الموصوفة؟',
        'ما هي الآثار الجانبية الشائعة للعلاج؟',
        'تعليمات عند نسيان موعد جرعة الدواء'
      ]
    },
    {
      id: 'health',
      label: 'صحة واستشارات 🩺',
      icon: 'heart',
      questions: [
        'نصائح وإرشادات عامة لصحتي اليومية',
        'عندي صداع.. ما هي أفضل الإرشادات لتخفيفه؟',
        'نصائح سريعة لنزلات البرد والإنفلونزا',
        'أرقام الطوارئ والاستغاثة الطبية'
      ]
    }
  ];

  private subs: Subscription = new Subscription();
  private shouldScrollToBottom = false;

  constructor(
    public chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
      })
    );

    this.subs.add(
      this.chatService.isOpen$.subscribe(open => {
        this.isOpen = open;
        if (open) {
          this.shouldScrollToBottom = true;
        }
      })
    );

    this.subs.add(
      this.chatService.isLoading$.subscribe(loading => {
        this.isLoading = loading;
        if (loading) {
          this.shouldScrollToBottom = true;
        }
      })
    );

    this.subs.add(
      this.chatService.messages$.subscribe(msgs => {
        this.messages = msgs;
        this.shouldScrollToBottom = true;
      })
    );

    this.subs.add(
      this.chatService.context$.subscribe(ctx => {
        this.context = ctx;
      })
    );
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  toggleChat(): void {
    this.chatService.toggleChat();
  }

  closeChat(): void {
    this.chatService.closeChat();
  }

  selectCategory(catId: 'nav' | 'meds' | 'health'): void {
    this.activeCategory = catId;
  }

  get currentQuestions(): string[] {
    const found = this.suggestionCategories.find(c => c.id === this.activeCategory);
    return found ? found.questions : [];
  }

  sendMessage(text?: string): void {
    const msgToSend = (text !== undefined ? text : this.inputText).trim();
    if (!msgToSend || this.isLoading) return;

    this.chatService.sendMessage(msgToSend);
    this.inputText = '';
    this.shouldScrollToBottom = true;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onSuggestionClick(question: string): void {
    this.sendMessage(question);
  }

  clearChat(): void {
    this.chatService.clearChat();
  }

  navigateTo(route: string): void {
    if (!route) return;
    this.router.navigateByUrl(route);
  }

  handleMessageClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const linkEl = target.closest('[data-route]') as HTMLElement;
    if (linkEl) {
      event.preventDefault();
      const route = linkEl.getAttribute('data-route');
      if (route) {
        this.navigateTo(route);
      }
    }
  }

  copyMessage(text: string, msgId: string): void {
    if (!navigator.clipboard) return;
    
    // Strip markdown formatting for plain clipboard
    const plainText = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/#/g, '');

    navigator.clipboard.writeText(plainText).then(() => {
      this.copiedMessageId = msgId;
      setTimeout(() => {
        if (this.copiedMessageId === msgId) {
          this.copiedMessageId = null;
        }
      }, 2000);
    });
  }

  formatMessage(text: string): string {
    if (!text) return '';
    
    // Convert Markdown links [Title](/route) to interactive anchor buttons
    let formatted = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, title, url) => {
      return `<a href="javascript:void(0)" class="chat-nav-link" data-route="${url}"><span>${title}</span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg></a>`;
    });

    // Convert Markdown bold **text** to <strong>text</strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert bullet points
    formatted = formatted.replace(/^•\s+(.*)$/gm, '<li class="chat-bullet">$1</li>');
    formatted = formatted.replace(/^\*\s+(.*)$/gm, '<li class="chat-bullet">$1</li>');
    
    // Convert newlines to <br>
    formatted = formatted.replace(/\n/g, '<br/>');
    
    return formatted;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      // scroll container might not be initialized yet
    }
  }
}
