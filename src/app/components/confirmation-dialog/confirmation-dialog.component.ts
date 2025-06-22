import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [DialogModule, CommonModule, TranslateModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css',
})
export class ConfirmationDialogComponent {
  @Input() visible: boolean = false;
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() type: 'warning' | 'error' | 'info' = 'warning';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  closeDialog() {
    this.visibleChange.emit(false);
  }

  onConfirm() {
    this.confirmed.emit();
    this.closeDialog();
  }

  onCancel() {
    this.cancelled.emit();
    this.closeDialog();
  }

  getIconClass(): string {
    switch (this.type) {
      case 'error':
        return 'ri-error-warning-line text-red-500';
      case 'warning':
        return 'ri-alert-line text-orange-500';
      case 'info':
        return 'ri-information-line text-blue-500';
      default:
        return 'ri-alert-line text-orange-500';
    }
  }

  getButtonClass(): string {
    switch (this.type) {
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      case 'warning':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-orange-500 hover:bg-orange-600';
    }
  }
}
