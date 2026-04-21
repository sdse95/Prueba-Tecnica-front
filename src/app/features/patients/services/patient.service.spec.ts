import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { PatientService } from './patient.service';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/patients`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientService],
    });
    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getPatients should request list with query params', () => {
    const mock = { items: [], page: 1, pageSize: 10, totalCount: 0 };
    service.getPatients({ page: 2, pageSize: 25, name: 'Ana', documentNumber: '123' }).subscribe((res) => {
      expect(res).toEqual(mock);
    });
    const req = httpMock.expectOne(
      (r) =>
        r.url === base &&
        r.params.get('page') === '2' &&
        r.params.get('pageSize') === '25' &&
        r.params.get('name') === 'Ana' &&
        r.params.get('documentNumber') === '123'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('getById should GET one patient', () => {
    const p = {
      patientId: 1,
      documentType: 'CC',
      documentNumber: '1',
      firstName: 'A',
      lastName: 'B',
      birthDate: '2000-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
    };
    service.getById(1).subscribe((res) => expect(res).toEqual(p));
    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(p);
  });

  it('create should POST body', () => {
    const body = {
      documentType: 'CC',
      documentNumber: '99',
      firstName: 'X',
      lastName: 'Y',
      birthDate: '1990-05-05T00:00:00.000Z',
    };
    const created = { ...body, patientId: 5, createdAt: '2024-01-01T00:00:00Z' };
    service.create(body).subscribe((res) => expect(res.patientId).toBe(5));
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(created);
  });

  it('update should PUT partial body', () => {
    const partial = { firstName: 'New' };
    const updated = {
      patientId: 3,
      documentType: 'CC',
      documentNumber: '1',
      firstName: 'New',
      lastName: 'B',
      birthDate: '2000-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
    };
    service.update(3, partial).subscribe((res) => expect(res.firstName).toBe('New'));
    const req = httpMock.expectOne(`${base}/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(partial);
    req.flush(updated);
  });

  it('delete should DELETE and map to void on 204', () => {
    let completed = false;
    service.delete(7).subscribe(() => {
      completed = true;
    });
    const req = httpMock.expectOne(`${base}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    expect(completed).toBe(true);
  });

  it('getCreatedAfter should pass ISO fromDate', () => {
    const iso = '2024-06-01T00:00:00.000Z';
    service.getCreatedAfter(iso).subscribe((res) => expect(res.length).toBe(0));
    const req = httpMock.expectOne((r) => r.url === `${base}/created-after` && r.params.get('fromDate') === iso);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
