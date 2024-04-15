import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private BASE_URL = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  getData(devId: string): Observable<any> {
    console.log(devId)
    return this.http.get(`${this.BASE_URL}/data/${devId}`);
  }
  getAltData(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/alt_data`);
  }
  getDevID(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/dev_id`);
  }
  getMetadata(devId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/metadata/${devId}`);
  }
  getPayload(devId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/payload/${devId}`);
  }
  getLocation(): Observable<any> {
    // console.log(this.http.get(`${this.BASE_URL}/location`));
    return this.http.get(`${this.BASE_URL}/location`);
  }
  getPayloadStatisticsData(devId: string) :Observable<any>{
    return this.http.get(`${this.BASE_URL}/payloadStats/${devId}`);
  }
  getMetadataStatisticsData(devId: string) :Observable<any>{
    return this.http.get(`${this.BASE_URL}/metadataStats/${devId}`);
  }
  getdevAnnotation(devId: string) :Observable<any>{
    return this.http.get(`${this.BASE_URL}/getdevAnnotation/${devId}`);
  }
  setdevAnnotation(devId: string, data: string) :Observable<any>{
    return this.http.get(`${this.BASE_URL}/setdevAnnotation/${devId}/${data}`);
  }
}