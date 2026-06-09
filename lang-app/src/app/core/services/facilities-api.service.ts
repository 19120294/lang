import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Facility } from '../models/facility.model';

@Injectable({ providedIn: 'root' })
export class FacilitiesApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/facilities`;

  getAll(area?: string, cost?: string, type?: string): Observable<Facility[]> {
    const params: Record<string, string> = {};
    if (area) params['area'] = area;
    if (cost) params['cost'] = cost;
    if (type) params['type'] = type;
    return this.http.get<Facility[]>(this.base, { params });
  }
}
