import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { DataLayout } from './data.config';
import { Observable } from 'rxjs';
// import { Data } from '@angular/router';

//Since json files can't have comments, the connection.json simiulates what a configuration file would be like on the server which specifies our resource URLs.
//The Http get function has parameters url, and options, which will determine how the data is read from the server side

@Injectable()
export class ConnectionService {
  constructor(private http: HttpClient) {}

  connectionUrl = 'assets/connection.json';

  //Config is a generic, meaning it's kind of a place holder that doesn't need to explicitly define the types it uses. Basically a template
  getJson() {
    return this.http.get<DataLayout>(this.connectionUrl);
  }

  //Using an observable to watch for event,s we're now specifying that the http request will now observe the respose and return the response instead.
  getResponse(): Observable<HttpResponse<DataLayout>> {
    return this.http.get<DataLayout>(this.connectionUrl, {
      observe: 'response',
    });
  }
}
