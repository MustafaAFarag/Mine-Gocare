import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-congrats-modal',
  standalone: true,
  imports: [DialogModule, CommonModule, TranslateModule],
  templateUrl: './congrats-modal.component.html',
  styleUrl: './congrats-modal.component.css',
})
export class CongratsModalComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  closeDialog() {
    this.visibleChange.emit(false);
  }
}
