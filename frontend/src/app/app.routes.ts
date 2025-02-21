import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { EmailVerificationComponent } from './components/email-verification/email-verification.component';
import { AnimalsComponent } from './components/animals/animals.component';
import { AnimalDetailComponent } from './components/animal-detail/animal-detail.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { emailVerifiedGuard } from './guards/email-verified.guard';
import { VerifyEmailNoticeComponent } from './components/verify-email-notice/verify-email-notice.component';

export const routes: Routes = [
  {
    path: '',
    component: AnimalsComponent,
    canActivate: [authGuard, emailVerifiedGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'verify-email-notice',
    component: VerifyEmailNoticeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'verify-email/:token',
    component: EmailVerificationComponent,
  },
  {
    path: 'reset-password/:token',
    component: PasswordResetComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard, emailVerifiedGuard],
  },
  {
    path: 'animals/:id',
    component: AnimalDetailComponent,
    canActivate: [authGuard, emailVerifiedGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
