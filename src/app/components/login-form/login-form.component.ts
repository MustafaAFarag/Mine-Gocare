import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-form',
  standalone: true,
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
  imports: [CommonModule],
  providers: [],
})
export class LoginFormComponent {
  @Output() toggle = new EventEmitter<boolean>();

  // Emit the toggle event to switch to the signup form
  toggleMode() {
    this.toggle.emit(false);
  }
}
