import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './terms.html',
  styleUrl: './terms.css'
})
export class Terms {
  lastUpdated = 'January 15, 2025';
  lastUpdatedKa = '15 იანვარი, 2025';
  lastUpdatedRu = '15 января 2025 г.';

  constructor(private translateService: TranslateService) {}

  getCurrentLang(): string {
    return this.translateService.currentLang || 'en';
  }
}
