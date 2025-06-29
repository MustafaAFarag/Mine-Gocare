import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [DialogModule, CommonModule, TranslateModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.css',
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {
  @Input() visible: boolean = false;
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() confirmText: string = '';
  @Input() cancelText: string = '';
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private languageSubscription?: Subscription;

  constructor(private translateService: TranslateService) {}

  ngOnInit() {
    // Subscribe to language changes to ensure modal works properly
    this.languageSubscription = this.translateService.onLangChange.subscribe(
      () => {
        // Force a change detection cycle when language changes
        setTimeout(() => {
          // This ensures the modal content is properly updated
        }, 0);
      },
    );
  }

  ngOnDestroy() {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  closeDialog() {
    this.visibleChange.emit(false);
  }

  confirm() {
    this.confirmed.emit();
    this.closeDialog();
  }

  cancel() {
    this.cancelled.emit();
    this.closeDialog();
  }

  getIconClass(): string {
    switch (this.type) {
      case 'danger':
        return 'ri-error-warning-line text-red-500';
      case 'warning':
        return 'ri-alert-line text-yellow-500';
      case 'info':
        return 'ri-information-line text-blue-500';
      default:
        return 'ri-error-warning-line text-red-500';
    }
  }

  getBgClass(): string {
    switch (this.type) {
      case 'danger':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
        return 'bg-blue-50';
      default:
        return 'bg-red-50';
    }
  }

  getButtonClass(): string {
    switch (this.type) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-red-500 hover:bg-red-600';
    }
  }
}
