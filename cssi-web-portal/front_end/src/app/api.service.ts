import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private BASE_URL = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/data`);
  }
  getAltData(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/alt_data`);
  }
  getDevID(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/dev_id`);
  }
  getMetadata(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/metadata`);
  }
  getPayload(devId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/payload/${devId}`);
  }
}
