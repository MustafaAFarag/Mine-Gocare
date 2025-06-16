import {
  Component,
  EventEmitter,
  Input,
  Output,
  PLATFORM_ID,
  inject,
  OnInit,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { LoginFormComponent } from '../login-form/login-form.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SignupFormComponent } from '../signup-form/signup-form.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AuthModalService } from '../../auth-modal.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [
    DialogModule,
    LoginFormComponent,
    CommonModule,
    SignupFormComponent,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css',
})
export class AuthModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  isLoginMode: boolean = true;
  private platformId = inject(PLATFORM_ID);
  isBrowser: boolean;

  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private authModalService: AuthModalService,
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.authModalService.showModal$.subscribe((show) => {
      this.visible = show;
    });
  }

  // Toggle between login and signup forms
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  closeDialog() {
    this.authModalService.hideModal();
  }

  handleLoginSuccess() {
    if (this.isBrowser) {
      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant('login.loginToastSummary'),
        detail: this.translateService.instant('login.loginToast'),
        life: 3000,
        styleClass: 'top-left',
      });
    }
    this.closeDialog();
  }

  handleSignupSuccess() {
    if (this.isBrowser) {
      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant('signup.signupToastSummary'),
        detail: this.translateService.instant('signup.signupToast'),
        life: 2000,
        styleClass: 'black-text-toast',
      });
    }
    this.toggleMode();
  }

  handleLoginError(error: string) {
    if (this.isBrowser) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error,
        life: 2000,
        styleClass: 'black-text-toast',
      });
    }
  }
}
