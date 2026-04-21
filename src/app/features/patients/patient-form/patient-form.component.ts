import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CreatePatientRequest, PatientResponse, UpdatePatientRequest } from '../models/patient.models';
import { PatientService } from '../services/patient.service';

@Component({
  selector: 'app-patient-form',
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss'],
})
export class PatientFormComponent implements OnInit {
  readonly documentTypes = [
    { label: 'CC', value: 'CC' },
    { label: 'CE', value: 'CE' },
    { label: 'TI', value: 'TI' },
    { label: 'Pasaporte', value: 'PASSPORT' },
  ];

  loading = false;
  saving = false;
  private initial: PatientResponse | null = null;

  readonly mode: 'create' | 'edit';

  readonly form = this.fb.nonNullable.group({
    documentType: ['CC', Validators.required],
    documentNumber: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    birthDate: [null as Date | null, Validators.required],
    phoneNumber: [''],
    email: ['', Validators.email],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly patientService: PatientService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly messages: MessageService
  ) {
    this.mode = (this.route.snapshot.data['mode'] as 'create' | 'edit') ?? 'create';
  }

  ngOnInit(): void {
    if (this.mode === 'edit') {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (!Number.isFinite(id)) {
        void this.router.navigate(['/patients']);
        return;
      }
      this.load(id);
    }
  }

  private load(id: number): void {
    this.loading = true;
    this.patientService.getById(id).subscribe({
      next: (p) => {
        this.initial = p;
        this.form.patchValue({
          documentType: p.documentType,
          documentNumber: p.documentNumber,
          firstName: p.firstName,
          lastName: p.lastName,
          birthDate: new Date(p.birthDate),
          phoneNumber: p.phoneNumber ?? '',
          email: p.email ?? '',
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  cancel(): void {
    void this.router.navigate(['/patients']);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const birthIso = raw.birthDate ? new Date(raw.birthDate).toISOString() : '';

    if (this.mode === 'create') {
      const body: CreatePatientRequest = {
        documentType: raw.documentType,
        documentNumber: raw.documentNumber.trim(),
        firstName: raw.firstName.trim(),
        lastName: raw.lastName.trim(),
        birthDate: birthIso,
        phoneNumber: raw.phoneNumber?.trim() || null,
        email: raw.email?.trim() || null,
      };
      this.saving = true;
      this.patientService.create(body).subscribe({
        next: (created) => {
          this.saving = false;
          void this.router.navigate(['/patients', created.patientId]);
        },
        error: () => {
          this.saving = false;
        },
      });
      return;
    }

    if (!this.initial) {
      return;
    }
    const patch = this.buildPatch(raw, birthIso);
    if (Object.keys(patch).length === 0) {
      this.messages.add({ severity: 'info', summary: 'Sin cambios', detail: 'No hay modificaciones para guardar.' });
      return;
    }
    this.saving = true;
    this.patientService.update(this.initial.patientId, patch).subscribe({
      next: () => {
        this.saving = false;
        void this.router.navigate(['/patients', this.initial!.patientId]);
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  private buildPatch(
    raw: {
      documentType: string;
      documentNumber: string;
      firstName: string;
      lastName: string;
      birthDate: Date | null;
      phoneNumber: string;
      email: string;
    },
    birthIso: string
  ): UpdatePatientRequest {
    const i = this.initial!;
    const patch: UpdatePatientRequest = {};
    if (raw.documentType !== i.documentType) {
      patch.documentType = raw.documentType;
    }
    if (raw.documentNumber.trim() !== i.documentNumber) {
      patch.documentNumber = raw.documentNumber.trim();
    }
    if (raw.firstName.trim() !== i.firstName) {
      patch.firstName = raw.firstName.trim();
    }
    if (raw.lastName.trim() !== i.lastName) {
      patch.lastName = raw.lastName.trim();
    }
    const prevBirth = new Date(i.birthDate).getTime();
    const nextBirth = raw.birthDate ? new Date(raw.birthDate).getTime() : NaN;
    if (raw.birthDate && prevBirth !== nextBirth) {
      patch.birthDate = birthIso;
    }
    const prevPhone = i.phoneNumber ?? '';
    const nextPhone = raw.phoneNumber?.trim() ?? '';
    if (prevPhone !== nextPhone) {
      patch.phoneNumber = nextPhone ? nextPhone : null;
    }
    const prevEmail = i.email ?? '';
    const nextEmail = raw.email?.trim() ?? '';
    if (prevEmail !== nextEmail) {
      patch.email = nextEmail ? nextEmail : null;
    }
    return patch;
  }
}
