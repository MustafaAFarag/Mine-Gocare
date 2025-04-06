import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarBannerComponent } from '../navbar-banner/navbar-banner.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule, NavbarBannerComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  toggleGocare() {
    const body = document.body;
    body.classList.toggle('gocare'); // Toggle the 'gocare' class
  }
}
