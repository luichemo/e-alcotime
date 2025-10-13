import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators'; 
@Component({
  selector: 'app-age-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './age-verification.html',
  styleUrl: './age-verification.css'
})
export class AgeVerification implements OnInit {
   showModal: boolean = false;
  
  // Pages that don't require age verification
  private exemptPages = ['/terms', '/privacy'];

  constructor(private router: Router) {}

ngOnInit() {
  // Run only after router is stable (so redirects like / → /home don’t trigger false modal)
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe(() => {
    this.checkAgeVerification();
  });

  // Initial check (after small delay to let redirect finish)
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
    // Save to sessionStorage - will be cleared when browser/tab closes
    sessionStorage.setItem('alcotime_age_verified', 'true');
    this.showModal = false;
    // Re-enable body scroll
    document.body.style.overflow = 'auto';
  }

  denyAge() {
    // Redirect to a safe website (you can change this URL)
    window.location.href = 'https://www.google.com';
  }
}