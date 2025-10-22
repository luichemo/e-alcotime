import { sendPasswordResetEmail } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  user,
  User as FirebaseUser
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc
} from '@angular/fire/firestore';
import { Observable, from, of, switchMap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser$: Observable<FirebaseUser | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.currentUser$ = user(this.auth);
  }

  // Register new user with age verification
  async register(
    email: string, 
    password: string, 
    displayName: string,
    dateOfBirth: Date,
    phoneNumber?: string
  ): Promise<void> {
    try {
      // Check if user is over 18
      const isOver18 = this.calculateAge(dateOfBirth) >= 18;
      
      if (!isOver18) {
        throw new Error('You must be at least 18 years old to register');
      }

      // Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(
        this.auth, 
        email, 
        password
      );

      // Create user document in Firestore
      const userDoc: User = {
        uid: credential.user.uid,
        email: email,
        displayName: displayName,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth,
        isOver18: isOver18,
        role: 'customer',
        createdAt: new Date()
      };

      await setDoc(
        doc(this.firestore, 'users', credential.user.uid), 
        userDoc
      );

    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  async resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(this.auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw error;
  }
}
  // Login
  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Get user data from Firestore
  getUserData(uid: string): Observable<User | null> {
    const userDocRef = doc(this.firestore, 'users', uid);
    return from(getDoc(userDocRef)).pipe(
      switchMap(docSnap => {
        if (docSnap.exists()) {
          return of(docSnap.data() as User);
        } else {
          return of(null);
        }
      })
    );
  }

  // Get current user with full data
  getCurrentUserData(): Observable<User | null> {
    return this.currentUser$.pipe(
      switchMap((firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          return this.getUserData(firebaseUser.uid);
        } else {
          return of(null);
        }
      })
    );
  }

  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    const firebaseUser = this.auth.currentUser;
    if (!firebaseUser) return false;

    const userDoc = await getDoc(
      doc(this.firestore, 'users', firebaseUser.uid)
    );
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      return userData.role === 'admin';
    }
    
    return false;
  }

  // Calculate age from date of birth
  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Update user profile
  async updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      await setDoc(userDocRef, data, { merge: true });
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
}