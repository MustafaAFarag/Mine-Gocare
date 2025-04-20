import { ViewportScroller } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Berryat';
  private router = inject(Router);
  private viewportScroller = inject(ViewportScroller);
  private languageService = inject(LanguageService);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.viewportScroller.scrollToPosition([0, 0]);
      });

    // The language service constructor will handle the initial language setup
    // by reading from localStorage or using the default
  }
}
