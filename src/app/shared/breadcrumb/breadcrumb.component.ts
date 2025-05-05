import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-breadcrumb',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
  @Input() name?: string;
  @Input() soloRoute?: string;
  currentRoute: string = '';

  constructor(
    public router: Router,
    private route: ActivatedRoute,
  ) {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }
}
