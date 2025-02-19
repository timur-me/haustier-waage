import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  // Clone the request and add the authorization header if token exists
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the response
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // If we get a 401 Unauthorized response, clear the token and redirect to login
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
}; 