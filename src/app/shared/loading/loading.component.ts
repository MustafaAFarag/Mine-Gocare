import { Component } from '@angular/core';
import {
  ProgressSpinner,
  ProgressSpinnerModule,
} from 'primeng/progressspinner';

@Component({
  selector: 'app-loading',
  imports: [ProgressSpinnerModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
})
export class LoadingComponent {}
