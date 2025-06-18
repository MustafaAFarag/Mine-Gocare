import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-logout-confirm-modal',
  standalone: true,
  imports: [DialogModule, CommonModule, TranslateModule],
  templateUrl: './logout-confirm-modal.component.html',
  styleUrl: './logout-confirm-modal.component.css',
})
export class LogoutConfirmModalComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmLogout = new EventEmitter<void>();

  closeDialog() {
    this.visibleChange.emit(false);
  }

  onConfirm() {
    this.confirmLogout.emit();
    this.closeDialog();
  }
}
