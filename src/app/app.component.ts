import { ViewportScroller } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { LanguageService } from './services/language.service';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { AuthModalService } from './auth-modal.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AuthModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Berryat';
  private router = inject(Router);
  private viewportScroller = inject(ViewportScroller);
  private languageService = inject(LanguageService);
  private authModalService = inject(AuthModalService);
  showAuthModal = false;

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.viewportScroller.scrollToPosition([0, 0]);
      });

    // Subscribe to auth modal state changes
    this.authModalService.showModal$.subscribe((show) => {
      this.showAuthModal = show;
    });
  }

  onAuthModalClose() {
    this.authModalService.hideModal();
  }
}
