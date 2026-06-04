import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators'; 
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-age-verification',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './age-verification.html',
  styleUrl: './age-verification.css'
})
export class AgeVerification implements OnInit {
   showModal: boolean = false;
  
  private exemptPages = ['/terms', '/privacy'];

  constructor(private router: Router) {}

ngOnInit() {
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe(() => {
    this.checkAgeVerification();
  });

  setTimeout(() => this.checkAgeVerification(), 300);
}

checkAgeVerification() {
  const currentUrl = this.router.url.split('?')[0];
  console.log('Current URL:', currentUrl);

  const exemptPages = ['/terms', '/privacy'];

  const isExemptPage = exemptPages.some(page =>
    currentUrl === page || currentUrl === `${page}/`
  );

  if (isExemptPage) {
    console.log('Exempt page detected, skipping age verification.');
    this.showModal = false;
    document.body.style.overflow = 'auto';
    return;
  }

  const ageVerified = sessionStorage.getItem('alcotime_age_verified');

  if (!ageVerified) {
    console.log('Age not verified, showing modal.');
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  } else {
    this.showModal = false;
    document.body.style.overflow = 'auto';
  }
}
  confirmAge() {
    sessionStorage.setItem('alcotime_age_verified', 'true');
    this.showModal = false;
    document.body.style.overflow = 'auto';
  }

  denyAge() {
    window.location.href = 'https://www.google.com';
  }
}