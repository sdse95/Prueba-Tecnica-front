import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

/** JSON body shape returned by the API on validation/conflict errors. */
export interface ApiErrorBody {
  message?: string;
  details?: string[];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function extractErrorMessage(error: HttpErrorResponse): string {
  const status = error.status;
  const body = error.error;

  if (typeof body === 'string' && body.trim().length > 0) {
    return body;
  }

  const rec = asRecord(body);
  if (rec) {
    const message = rec['message'];
    if (typeof message === 'string' && message.trim().length > 0) {
      const details = rec['details'];
      if (Array.isArray(details) && details.length > 0) {
        const detailText = details
          .filter((d): d is string => typeof d === 'string')
          .join(' · ');
        return detailText ? `${message} (${detailText})` : message;
      }
      return message;
    }
  }

  if (status === 404) {
    return 'Recurso no encontrado.';
  }

  if (status === 0) {
    return 'No se pudo conectar con el servidor. Comprueba la red o la URL del API.';
  }

  return error.message || `Error HTTP ${status || 'desconocido'}`;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const httpError = error instanceof HttpErrorResponse ? error : new HttpErrorResponse({ error });
      const detail = extractErrorMessage(httpError);
      messageService.add({
        severity: 'error',
        summary: 'Error',
        detail,
        life: 8000,
      });
      return throwError(() => httpError);
    })
  );
};
