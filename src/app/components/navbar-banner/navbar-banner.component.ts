import { Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar-banner',
  imports: [TranslateModule],
  templateUrl: './navbar-banner.component.html',
  styleUrl: './navbar-banner.component.css',
})
export class NavbarBannerComponent {
  translate: TranslateService = inject(TranslateService);

  translateLanguage(lang: string) {
    this.translate.use(lang);
  }
}
