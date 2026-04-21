import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { PatientDetailComponent } from './features/patients/patient-detail/patient-detail.component';
import { PatientFormComponent } from './features/patients/patient-form/patient-form.component';
import { PatientListComponent } from './features/patients/patient-list/patient-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'patients', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'patients/new', component: PatientFormComponent, canActivate: [authGuard], data: { mode: 'create' } },
  { path: 'patients/:id/edit', component: PatientFormComponent, canActivate: [authGuard], data: { mode: 'edit' } },
  { path: 'patients/:id', component: PatientDetailComponent, canActivate: [authGuard] },
  { path: 'patients', component: PatientListComponent, canActivate: [authGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
