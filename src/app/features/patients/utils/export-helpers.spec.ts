import { PatientResponse } from '../models/patient.models';
import { patientsToCsv } from './export-helpers';

describe('export-helpers', () => {
  it('patientsToCsv should include BOM and escape quotes', () => {
    const p: PatientResponse = {
      patientId: 1,
      documentType: 'CC',
      documentNumber: '1',
      firstName: 'Ana',
      lastName: 'López',
      birthDate: '2000-01-01T00:00:00Z',
      phoneNumber: null,
      email: 'a"b@test.com',
      createdAt: '2024-01-01T12:00:00Z',
    };
    const csv = patientsToCsv([p]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"a""b@test.com"');
  });
});
