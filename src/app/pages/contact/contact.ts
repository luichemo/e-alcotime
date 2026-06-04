import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, addDoc } from 'firebase/firestore';
import { AuthService } from '../../services/auth';
import { Email } from '../../services/email';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule, RouterLink],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact implements OnInit {
  name: string = '';
  email: string = '';
  subject: string = '';
  message: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private firestore: Firestore,
    private translateService: TranslateService,
    private emailService: Email
  ) {}

  ngOnInit(): void {
    // Autofill name and email if logged in
    this.authService.getCurrentUserData().subscribe(user => {
      if (user) {
        this.name = user.displayName || '';
        this.email = user.email || '';
      }
    });
  }

  getCurrentLang(): string {
    return this.translateService.currentLang || 'en';
  }

  async onSubmit(): Promise<void> {
    if (!this.name.trim() || !this.email.trim() || !this.subject.trim() || !this.message.trim()) {
      let errorTitle = 'Error!';
      let errorText = 'Please fill in all required fields.';
      
      const lang = this.getCurrentLang();
      if (lang === 'ka') {
        errorTitle = 'შეცდომა!';
        errorText = 'გთხოვთ შეავსოთ ყველა სავალდებულო ველი.';
      } else if (lang === 'ru') {
        errorTitle = 'Ошибка!';
        errorText = 'Пожалуйста, заполните все обязательные поля.';
      }

      Swal.fire({
        title: errorTitle,
        text: errorText,
        icon: 'error',
        background: '#1c1c1a',
        color: '#f5f3f0',
        confirmButtonColor: '#c0a27c'
      });
      return;
    }

    this.loading = true;

    try {
      const contactsCol = collection(this.firestore, 'contacts');
      await addDoc(contactsCol, {
        name: this.name,
        email: this.email,
        subject: this.subject,
        message: this.message,
        createdAt: new Date()
      });

      // Capture current form values for the background email task
      const emailName = this.name;
      const emailAddr = this.email;
      const emailSub = this.subject;
      const emailMsg = this.message;

      // Reset loading immediately so the submit button spinner terminates instantly
      this.loading = false;

      // Dispatch background notification email to alcotimeinfo@gmail.com (non-blocking)
      this.emailService.sendContactInquiry(emailName, emailAddr, emailSub, emailMsg).catch(emailError => {
        console.warn('Could not send notification email to alcotimeinfo@gmail.com. Please ensure template_vy0l68d is configured in your EmailJS dashboard.', emailError);
      });

      // Translate success alerts
      let title = 'Message Sent!';
      let text = 'Thank you for contacting us. We will get back to you shortly.';
      
      const lang = this.getCurrentLang();
      if (lang === 'ka') {
        title = 'გზავნილი გაიგზავნა!';
        text = 'გმადლობთ დაკავშირებისთვის. ჩვენ მალე გიპასუხებთ.';
      } else if (lang === 'ru') {
        title = 'Сообщение отправлено!';
        text = 'Спасибо за обращение. Мы ответим вам в ближайшее время.';
      }

      await Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        background: '#1c1c1a',
        color: '#f5f3f0',
        confirmButtonColor: '#c0a27c'
      });

      // Clear subject and message, keep name/email if logged in, or clear if guest
      this.subject = '';
      this.message = '';
      
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.name = '';
        this.email = '';
      }

    } catch (error) {
      this.loading = false;
      console.error('Error saving contact message:', error);
      
      let failTitle = 'Error!';
      let failText = 'Failed to send message. Please try again later.';
      
      const lang = this.getCurrentLang();
      if (lang === 'ka') {
        failTitle = 'შეცდომა!';
        failText = 'შეტყობინების გაგზავნა ვერ მოხერხდა. სცადეთ მოგვიანებით.';
      } else if (lang === 'ru') {
        failTitle = 'Ошибка!';
        failText = 'Не удалось отправить сообщение. Пожалуйста, попробуйте позже.';
      }

      await Swal.fire({
        title: failTitle,
        text: failText,
        icon: 'error',
        background: '#1c1c1a',
        color: '#f5f3f0',
        confirmButtonColor: '#c0a27c'
      });
    }
  }
}
