import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  user: User | null = null;
  editMode: boolean = false;
  loading: boolean = true;
  saving: boolean = false;
  error: string = '';
  successMessage: string = '';

  editData = {
    displayName: '',
    phoneNumber: '',
    dateOfBirth: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
    }, 1000);
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadUserProfile(): Promise<void> {
    this.loading = true;

    try {
      const firebaseUser = await firstValueFrom(this.authService.currentUser$);

      if (!firebaseUser) {
        this.router.navigate(['/login']);
        return;
      }

      this.authService.getUserData(firebaseUser.uid)
        .pipe(takeUntil(this.destroy$))
        .subscribe({

          next: (userData) => {
            this.user = userData;
            if (this.user?.dateOfBirth && typeof this.user.dateOfBirth.toDate === 'function') {
              this.user.dateOfBirth = this.user.dateOfBirth.toDate();
            }
            if (this.user?.createdAt && typeof this.user.createdAt.toDate === 'function') {
              this.user.createdAt = this.user.createdAt.toDate();
            }
            this.loading = false;

            if (this.user) {
              let dateString = '';
              if (this.user.dateOfBirth) {
                try {
                  let date: Date;

                  if (this.user.dateOfBirth && typeof this.user.dateOfBirth === 'object' && 'toDate' in this.user.dateOfBirth) {
                    date = (this.user.dateOfBirth as any).toDate();
                  } else if (this.user.dateOfBirth instanceof Date) {
                    date = this.user.dateOfBirth;
                  } else {
                    date = new Date(this.user.dateOfBirth);
                  }

                  if (!isNaN(date.getTime())) {
                    dateString = date.toISOString().split('T')[0];
                  }
                } catch (e) {
                  console.error('Invalid date:', e);
                }
              }

              this.editData = {
                displayName: this.user.displayName || '',
                phoneNumber: this.user.phoneNumber || '',
                dateOfBirth: dateString
              };
            }
          },
          error: (error) => {
            console.error('Error loading profile:', error);
            this.error = 'Failed to load profile';
            this.loading = false;
          }
        });
    } catch (error) {
      console.error('Error getting user:', error);
      this.router.navigate(['/login']);
    }
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.error = '';
    this.successMessage = '';

    if (!this.editMode && this.user) {
      this.editData = {
        displayName: this.user.displayName || '',
        phoneNumber: this.user.phoneNumber || '',
        dateOfBirth: this.user.dateOfBirth ?
          new Date(this.user.dateOfBirth).toISOString().split('T')[0] : ''
      };
    }
  }

  async saveProfile(): Promise<void> {
    if (!this.user) return;

    if (!this.editData.displayName.trim()) {
      this.error = 'Full name cannot be empty.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.successMessage = '';

    try {
      const updateData: Partial<User> = {
        displayName: this.editData.displayName,
        phoneNumber: this.editData.phoneNumber
      };

      if (this.editData.dateOfBirth) {
        updateData.dateOfBirth = new Date(this.editData.dateOfBirth);
      }
      setTimeout(() => {
      }, 2000);
      await this.authService.updateUserProfile(this.user.uid, updateData);

      this.user = { ...this.user, ...updateData };

      this.successMessage = 'Profile updated successfully!';
      this.editMode = false;
      this.saving = false;

      this.successMessage = '';

    } catch (error: any) {
      console.error('Error updating profile:', error);
      this.error = error.message || 'Failed to update profile';
      this.saving = false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  calculateAge(): number {
    if (!this.user?.dateOfBirth) return 0;

    const today = new Date();
    const birthDate = new Date(this.user.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  getMemberSince(): string {
    if (!this.user?.createdAt) return '';

    const date = new Date(this.user.createdAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }
}