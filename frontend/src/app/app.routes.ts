import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AnimalsComponent } from './components/animals/animals.component';
import { AnimalDetailComponent } from './components/animal-detail/animal-detail.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'animals', 
    component: AnimalsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'animals/:id', 
    component: AnimalDetailComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
