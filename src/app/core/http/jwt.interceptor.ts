import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

const AUTH_EXCLUDED_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const isApiRequest = req.url.includes('/api/');
  const isExcluded = AUTH_EXCLUDED_PATHS.some((path) => req.url.includes(path));

  if (!token || !isApiRequest || isExcluded) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
  return next(cloned);
};
