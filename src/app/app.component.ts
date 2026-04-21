import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly isAuthenticated$: Observable<boolean>;
  readonly menuItems: MenuItem[] = [
    {
      label: 'Pacientes',
      icon: 'pi pi-users',
      routerLink: '/patients',
    },
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
