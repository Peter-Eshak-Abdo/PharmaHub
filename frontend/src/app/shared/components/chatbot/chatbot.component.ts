import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessage, ContextSummary } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';

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

  suggestedQuestions: string[] = [
    'هل يوجد تعارض بين أدويتي الحالية؟',
    'ما هي الجرعات ومواعيد تناول العلاج الموصوف؟',
    'ما هي الآثار الجانبية الشائعة لأدويتي؟',
    'نصائح وإرشادات عامة لصحتي'
  ];

  private subs: Subscription = new Subscription();
  private shouldScrollToBottom = false;

  constructor(
    public chatService: ChatService,
    private authService: AuthService
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

  formatMessage(text: string): string {
    if (!text) return '';
    
    // Convert Markdown bold **text** to <strong>text</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
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
