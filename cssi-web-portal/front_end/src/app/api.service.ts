import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private BASE_URL = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  getData(devId: string, numEnt: string): Observable<any> {
    console.log('api numEnt: ', numEnt)
    return this.http.get(`${this.BASE_URL}/data/${devId}/${numEnt}`);
  }
  getAltData(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/alt_data`);
  }
  getDevID(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/dev_id`);
  }
  getMetadata(devId: string, numEnt: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/metadata/${devId}/${numEnt}`);
  }
  getPayload(devId: string, numEnt: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/payload/${devId}/${numEnt}`);
  }
  getLocation(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/location`);
  }
  getDeviceLocation(devId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/devLocation/${devId}`);
  }
  getPayloadStatisticsData(devId: string, numEnt: string) :Observable<any>{
    return this.http.get(`${this.BASE_URL}/payloadStats/${devId}/${numEnt}`);
  }
  getMetadataStatisticsData(devId: string, numEnt: string) :Observable<any>{
    return this.http.get(`${this.BASE_URL}/metadataStats/${devId}/${numEnt}`);
  }
  getdevAnnotation(devId: string) :Observable<any>{
    return this.http.get(`${this.BASE_URL}/getdevAnnotation/${devId}`);
  }
  setdevAnnotation(devId: string, data: string) :Observable<any>{
    return this.http.get(`${this.BASE_URL}/setdevAnnotation/${devId}/${data}`);
  }
}