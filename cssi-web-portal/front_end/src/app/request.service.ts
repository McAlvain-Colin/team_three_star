import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

//Since json files can't have comments, the connection.json simiulates what a configuration file would be like on the server which specifies our resource URLs.
//The Http get function has parameters url, and options, which will determine how the data is read from the server side

//Should be temp, having a const that's allows you to change the Http Headers for the files you're sending
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: 'my-auth-token',
  }),
};
// In the function when we send the data, we can update the header before making a request, if a token expires, with httpOptions.headers = httpOptions.headers.set('Authorization', 'my-new-auth-token')

@Injectable()
export class RequestService {
  constructor(private http: HttpClient) {}

  connectionUrl = 'assets/connection.json';
  // //Config is a generic, meaning it's kind of a place holder that doesn't need to explicitly define the types it uses. Basically a template
  // getJson() {
  //   return this.http.get<DataLayout>(this.connectionUrl);
  // }

  // //Using an observable to watch for event,s we're now specifying that the http request will now observe the respose and return the response instead.
  // getResponse(): Observable<HttpResponse<DataLayout>> {
  //   return this.http.get<DataLayout>(this.connectionUrl, {
  //     observe: 'response',
  //   });
  // }

  //Handling Errors, currently utilizing code from angular.io/guide/http-handle-request-errors#error-details for handling
  handleError(errorFunction: string, error: HttpErrorResponse) {
    if (error.status == 0) {
      //Logs a client-side or network error
      console.error('Error occurred', error.error);
    } else {
      //Backend gave a failed response code.
      //The response body is given to find what went wrong.
      console.error(
        'Backend returned code ${error.status}, body was: ',
        error.error
      );
    }

    //Returns an observable that can be used to show the user the error message.
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }

  //   //A function that will use HTTP to send data and then using an Observable, it will get avalue back with the SentData value type, http post to send the data
  //   addData(data: SentData): Observable<SentData> {
  //     //THis method in HTTP will send the data to the server, and has 3 parameters, the url, the data, and the options which could specify the headers needed
  //     return this.http.post<SentData>(this.connectionUrl, data, httpOptions);
  //     //write something with pipe to catch errors and handle them with the above handle error function
  //   }
}
