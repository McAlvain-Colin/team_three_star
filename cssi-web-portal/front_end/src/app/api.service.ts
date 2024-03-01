import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private BASE_URL = 'http://localhost:4200/api';

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/data`);
  }
}
