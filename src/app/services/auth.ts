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
import { Firestore } from '@angular/fire/firestore';
import { 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { Observable, from, of, switchMap, shareReplay } from 'rxjs';
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
    this.currentUser$ = user(this.auth).pipe(shareReplay(1));
  }

  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  async register(
    email: string, 
    password: string, 
    displayName: string,
    dateOfBirth: Date,
    phoneNumber?: string
  ): Promise<void> {
    try {
      const isOver18 = this.calculateAge(dateOfBirth) >= 18;
      
      if (!isOver18) {
        throw new Error('You must be at least 18 years old to register');
      }

      const credential = await createUserWithEmailAndPassword(
        this.auth, 
        email, 
        password
      );

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
  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getUserData(uid: string): Observable<User | null> {
    const userDocRef = doc(this.firestore, 'users', uid);
    return new Observable<User | null>(subscriber => {
      return onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          subscriber.next(docSnap.data() as User);
        } else {
          subscriber.next(null);
        }
      }, (error) => {
        subscriber.error(error);
      });
    });
  }

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