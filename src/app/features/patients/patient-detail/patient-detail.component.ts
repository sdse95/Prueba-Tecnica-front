import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientResponse } from '../models/patient.models';
import { PatientService } from '../services/patient.service';

@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss'],
})
export class PatientDetailComponent implements OnInit {
  patient: PatientResponse | null = null;
  loading = false;

  /** Placeholder hasta disponer de API de citas. */
  readonly appointments: unknown[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly patientService: PatientService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      void this.router.navigate(['/patients']);
      return;
    }
    this.loading = true;
    this.patientService.getById(id).subscribe({
      next: (p) => {
        this.patient = p;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  back(): void {
    void this.router.navigate(['/patients']);
  }

  edit(): void {
    if (!this.patient) {
      return;
    }
    void this.router.navigate(['/patients', this.patient.patientId, 'edit']);
  }
}
