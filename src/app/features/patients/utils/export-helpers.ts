import * as XLSX from 'xlsx';
import { PatientResponse } from '../models/patient.models';

/** Inicio del día local en ISO 8601 (para `fromDate` en el API). */
export function startOfLocalDayIso(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return d.toISOString();
}

function escapeCsvCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function patientRow(p: PatientResponse): (string | number)[] {
  return [
    p.patientId,
    p.documentType,
    p.documentNumber,
    p.firstName,
    p.lastName,
    p.birthDate,
    p.phoneNumber ?? '',
    p.email ?? '',
    p.createdAt,
  ];
}

const CSV_HEADER = [
  'ID',
  'Tipo documento',
  'Número documento',
  'Nombre',
  'Apellidos',
  'Fecha nacimiento (ISO)',
  'Teléfono',
  'Email',
  'Fecha creación (ISO)',
];

/** CSV con BOM UTF-8 para Excel en Windows. */
export function patientsToCsv(patients: PatientResponse[]): string {
  const lines = [
    CSV_HEADER.map(escapeCsvCell).join(','),
    ...patients.map((p) => patientRow(p).map(escapeCsvCell).join(',')),
  ];
  return `\uFEFF${lines.join('\r\n')}`;
}

export function patientsToCsvBlob(patients: PatientResponse[]): Blob {
  return new Blob([patientsToCsv(patients)], { type: 'text/csv;charset=utf-8' });
}

export function patientsToXlsxBlob(patients: PatientResponse[]): Blob {
  const rows = patients.map((p) => ({
    ID: p.patientId,
    'Tipo documento': p.documentType,
    'Número documento': p.documentNumber,
    Nombre: p.firstName,
    Apellidos: p.lastName,
    'Fecha nacimiento': p.birthDate,
    Teléfono: p.phoneNumber ?? '',
    Email: p.email ?? '',
    'Fecha creación': p.createdAt,
  }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Pacientes');
  const arrayBuffer = XLSX.write(book, { bookType: 'xlsx', type: 'array' });
  return new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function buildExportFileName(extension: 'csv' | 'xlsx'): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `pacientes-creados-despues-${stamp}.${extension}`;
}

export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  a.click();
  URL.revokeObjectURL(url);
}
