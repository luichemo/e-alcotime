import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule, TranslateModule],
  templateUrl: './privacy.html',
  styleUrl: './privacy.css'
})
export class Privacy {
  lastUpdated = 'January 15, 2025';
  lastUpdatedKa = '15 იანვარი, 2025';
  lastUpdatedRu = '15 января 2025 г.';

  constructor(private translateService: TranslateService) {}

  getCurrentLang(): string {
    return this.translateService.currentLang || 'en';
  }
}
