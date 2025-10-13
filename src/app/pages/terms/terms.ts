import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms',
  imports: [RouterModule, CommonModule],
  templateUrl: './terms.html',
  styleUrl: './terms.css'
})
export class Terms {
  lastUpdated = 'January 15, 2025';
}
