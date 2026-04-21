import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';
import { Table } from 'primeng/table';
import { PatientResponse } from '../models/patient.models';
import { PatientService } from '../services/patient.service';
import {
  buildExportFileName,
  patientsToCsvBlob,
  patientsToXlsxBlob,
  startOfLocalDayIso,
  triggerDownload,
} from '../utils/export-helpers';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
})
export class PatientListComponent implements OnInit {
  @ViewChild('dt') table?: Table;

  patients: PatientResponse[] = [];
  totalCount = 0;
  loading = false;
  rows = 10;

  filterName = '';
  filterDocument = '';

  deletingId: number | null = null;

  exportDialogVisible = false;
  exportFromDate: Date | null = null;
  exporting = false;
  canManagePatients = true;

  constructor(
    private readonly patientService: PatientService,
    private readonly router: Router,
    private readonly confirmation: ConfirmationService,
    private readonly messages: MessageService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const roles = this.authService.getRoles();
    this.canManagePatients = !roles.includes('reader');
  }

  onLazyLoad(event: { first?: number; rows?: number | null }): void {
    const pageSize = event.rows ?? this.rows ?? 10;
    const page = Math.floor((event.first ?? 0) / pageSize) + 1;
    this.rows = pageSize;
    this.load(page, pageSize);
  }

  applyFilters(): void {
    this.table?.reset();
  }

  private load(page: number, pageSize: number): void {
    this.loading = true;
    this.patientService
      .getPatients({
        page,
        pageSize,
        name: this.filterName || undefined,
        documentNumber: this.filterDocument || undefined,
      })
      .subscribe({
        next: (res) => {
          this.patients = res.items;
          this.totalCount = res.totalCount;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  view(id: number): void {
    void this.router.navigate(['/patients', id]);
  }

  edit(id: number): void {
    if (!this.canManagePatients) {
      return;
    }
    void this.router.navigate(['/patients', id, 'edit']);
  }

  create(): void {
    if (!this.canManagePatients) {
      return;
    }
    void this.router.navigate(['/patients', 'new']);
  }

  openExportDialog(): void {
    const today = new Date();
    this.exportFromDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    this.exportDialogVisible = true;
  }

  downloadExcel(): void {
    this.runExport('xlsx');
  }

  downloadCsv(): void {
    this.runExport('csv');
  }

  private runExport(kind: 'csv' | 'xlsx'): void {
    if (!this.exportFromDate) {
      this.messages.add({
        severity: 'warn',
        summary: 'Fecha requerida',
        detail: 'Seleccione una fecha de referencia.',
      });
      return;
    }
    const iso = startOfLocalDayIso(this.exportFromDate);
    this.exporting = true;
    this.patientService.getCreatedAfter(iso).subscribe({
      next: (rows) => {
        this.exporting = false;
        if (rows.length === 0) {
          this.messages.add({
            severity: 'warn',
            summary: 'Sin datos',
            detail: 'No hay pacientes creados después de esa fecha.',
          });
          return;
        }
        if (kind === 'csv') {
          triggerDownload(patientsToCsvBlob(rows), buildExportFileName('csv'));
        } else {
          triggerDownload(patientsToXlsxBlob(rows), buildExportFileName('xlsx'));
        }
        this.messages.add({
          severity: 'success',
          summary: 'Exportación lista',
          detail: `Se exportaron ${rows.length} registro(s).`,
        });
      },
      error: () => {
        this.exporting = false;
      },
    });
  }

  confirmDelete(patient: PatientResponse): void {
    if (!this.canManagePatients) {
      return;
    }
    this.confirmation.confirm({
      message: `¿Eliminar a ${patient.firstName} ${patient.lastName}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => this.remove(patient.patientId),
    });
  }

  private remove(id: number): void {
    this.deletingId = id;
    this.patientService.delete(id).subscribe({
      next: () => {
        this.deletingId = null;
        this.table?.reset();
      },
      error: () => {
        this.deletingId = null;
      },
    });
  }
}
