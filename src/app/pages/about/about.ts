import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule, TranslateModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  constructor(private translateService: TranslateService) {}

  getCurrentLang(): string {
    return this.translateService.currentLang || 'en';
  }
}
