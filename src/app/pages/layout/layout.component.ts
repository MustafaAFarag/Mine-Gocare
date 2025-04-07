import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { BottomMobileNavigationComponent } from '../../features/navbar/bottom-mobile-navigation/bottom-mobile-navigation.component';

@Component({
  selector: 'app-layout',
  imports: [
    NavbarComponent,
    RouterOutlet,
    FooterComponent,
    BottomMobileNavigationComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {}
