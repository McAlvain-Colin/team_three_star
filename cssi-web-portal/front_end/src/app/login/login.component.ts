import { Component, Injectable } from '@angular/core';
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { ToolBarComponent } from '../tool-bar/tool-bar.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterModule,
  RouterState,
  RouterStateSnapshot,
  ActivatedRoute,
} from '@angular/router';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { FormBuilder } from '@angular/forms';
// import { HttpClient, HttpResponse } from ' angular/common/http';
import { Router } from '@angular/router';
import {
  HttpClient,
  HttpInterceptor,
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HTTP_INTERCEPTORS,
  HttpHeaders,
  HttpClientModule,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable, catchError, map, mergeMap, throwError } from 'rxjs';


import { inject } from '@angular/core';
import { ObserversModule } from '@angular/cdk/observers';

// auth guard to protect routes can only be accessed if there is an JWT token in localstorage, authguard is implmented on the routes in protected routes array
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const timerService = inject(TimerService);
  const router: Router = inject(Router);
  const token = sessionStorage.getItem('refreshToken');
  const protectedRoutes: string[] = [
    '/dashboard',
    '/home',
    '/organization',
    '/application',
    '/device',
    '/filter',
  ];

  return (protectedRoutes.includes(state.url) &&
    (!sessionStorage.getItem('refreshToken') ||
      !sessionStorage.getItem('token'))) ||
    new RegExp('(^[A-Za-z0-9-_]*.[A-Za-z0-9-_]*.[A-Za-z0-9-_]*$)').test(token!)
    ? router.navigate(['/login'])
    : true;
};

// Timer service is responsible for managing user sessions and handling logout functionality. 
@Injectable({ providedIn: 'root' })
export class TimerService {
  timer!: ReturnType<typeof setTimeout>;
  constructor(private router: Router, private http: HttpClient) {}

  // logout() method performs a DELETE request to logout route, Clears the session storage using sessionStorage.clear(), Stops the refresh timer by calling this.stopRefreshTimer(), Navigates to the /login route using the Router service, 
  logout() {
    console.log('in logout func');
    this.http
      .delete('http://localhost:5000/logout', {
        observe: 'response',
        responseType: 'json',
      })
      .subscribe({
        next: (response) => {
          const resp = { ...response.body };


          sessionStorage.clear();
          this.stopRefreshTimer();

          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  // checks if a given JSON Web Token (JWT) is expired or not. It does this by extracting the refresh token from the session storage, decoding the JWT, 
  // and comparing the expiration time with the current time. If the expiration time is in the future, it returns true
  isJWTExpired(jwt: string) {
    let refreshToken = sessionStorage.getItem('refreshToken');

    let jwtBase64 = refreshToken!.split('.')[1];

    let token = JSON.parse(atob(jwtBase64));

    let expires = new Date(token.exp * 1000);

    return expires > new Date();
  }

  // sets a timer that will call the logout() method when the JWT expires. It does this by extracting the refresh token from the session storage, decoding the JWT, calculating the expiration time, and setting a timer using setTimeout. 
  // The timer is set to expire 120 seconds (2 minutes) before the actual JWT expiration time.
  startRefreshTokenTimer() {
    let refreshToken = sessionStorage.getItem('refreshToken');

    let jwtBase64 = refreshToken!.split('.')[1];

    let token = JSON.parse(atob(jwtBase64));

    let expires = new Date(token.exp * 1000);
    let timeout = expires.getTime() - Date.now() - 120 * 1000;
    this.timer = setTimeout(() => this.logout(), timeout);
  }

  // clears the timer set by startRefreshTokenTimer() using clearTimeout(this.timer)
  stopRefreshTimer() {
    clearTimeout(this.timer);
  }
}

//This interceptor is responsible for handling HTTP requests and responses, specifically for refreshing access tokens and handling authentication-related errors.based on Angular http interceptor, DOCS: https://angular.io/api/common/http/HttpInterceptor as well as blog site bez-koder https://www.bezkoder.com/angular-16-refresh-token/
@Injectable()
export class appInterceptor implements HttpInterceptor {
  // the Router and HttpClient services, which are used for navigation and making HTTP requests, respectively.
  constructor(private router: Router, private http: HttpClient) {}

  // a helper method that handles the case when an access token has expired. Sends a POST request to the refresh route. it updates the token value in the session storage and creates a cloned version of the original request with the new access token in the Authorization header. 
  // If an error occurs during the request handling navigates to the /login. 
  private handleError(next: HttpHandler, req: HttpRequest<any>) {
    let header = new HttpHeaders({
      'Content-Type': 'application/json',
      responseType: 'json',
    });

    return this.http
      .post('http://localhost:5000/refresh', {}, { headers: header })
      .pipe(
        map((data: any) => {
          console.log('data is ', data.token);
          sessionStorage.setItem('token', data.token);

          const clone = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + data.token),
          });

          return next.handle(clone).pipe(
            catchError((error: HttpErrorResponse) => {
              if (error instanceof HttpErrorResponse) {
                // need to add the logout revoke tokne thing here

                sessionStorage.clear();
                this.router.navigate(['login']);

                return throwError(() => error);
              }
              return throwError(() => error);
            })
          );
        }),

        mergeMap((res) => res)
      );
  }
// this function is called for every HTTP request made by the application.  is called for every HTTP request made by the application.checks if the request URL includes the string 'refresh'. If it does not, it sets the Authorization header with the current access token (currToken) from the session storage. 
// If the URL includes 'refresh', it sets the Authorization header with the refresh token from the session storage.passes the modified request to the next interceptor or HTTP handler. If an error occurs during the request handling, f the error is an instance of HttpErrorResponse and the status code is 401 (Unauthorized) or 403 (Forbidden), and the currToken is null, it navigates to the /login route. the status code is 401 (Unauthorized), and the currToken is not null, it calls the handleError method to attempt to refresh the access token, otherwise it re-throws the error.
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // req = req.clone({withCredentials: true})

    const currToken = sessionStorage.getItem('token');

    if (!req.url.includes('refresh')) {
      const currToken = sessionStorage.getItem('token');

      req = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + currToken),
      });
    } else {
      const refreshToken = sessionStorage.getItem('refreshToken');

      req = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + refreshToken),
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error instanceof HttpErrorResponse) {
          // need to add the logout revoke tokne thing here
          if (
            (error.status == 401 || error.status == 403) &&
            currToken == null
          ) {
            this.router.navigate(['login']);
            return throwError(() => console.log('my error is ', error));
          }
          // where both the access and refresh token have expired NEED TIMER!!!!!!

          // when access token expired
          else if (error.status == 401 && currToken != null) {
            console.log('in the handle error if cond ');

            return this.handleError(next, req);
          } else {
            // this.logout()

            // this.router.navigate(['login'])

            return throwError(() => error);
          }
        } else {
          // this.logout()

          this.router.navigate(['login']);

          return throwError(() => error);
        }
      })
    );
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    ToolBarComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    TempNavBarComponent,
    RouterModule,
    NgIf,
    HttpClientModule,
  ],
})
export class LoginComponent {
  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private timerService: TimerService
  ) {}
  emailField = new FormControl('', [Validators.required, Validators.email]);
  hide: boolean = true;
  email: string = '';
  password: string = '';
  passwordCode: number = 0; //Set as unknown for if debugging is needed, so we can cast the hash into a viewable string.
  sentPassword: string = '';
  linkSuccess: string | null = '';

  ngOnInit(): void {
    this.linkSuccess = this.route.snapshot.paramMap.get('expired'); //From the current route, get the route name, which should be the identifier for what you need to render.
    if (this.linkSuccess == 'false') {
      var message: string = 'The email link has expired, please try again.';
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } else if (this.linkSuccess == 'true') {
      var message: string =
        'Invitation successful, please login to view the changes.';
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }
  //Derived from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript for basic hashing on front end for secure sending to the backend.
  hashPassword() {
    var hash = 0;
    var i, chr;
    if (this.password.length === 0) return hash;
    for (i = 0; i < this.password.length; i++) {
      chr = this.password.charCodeAt(i);
      hash = hash * 31 + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  // userForm!: FormGroup;
  //backendResponse!: any;

  base_url: string = 'http://localhost:5000';

  // constructor(private cookieService: CookieService, private http : HttpClient, private formBuilder: FormBuilder, private router : Router)
  // {

  // }

  //use the `` to allow connections to the variable in the declaration.
  //This submit form method will check for the user's email entry to see if it's correct, currently it will display the user's email if login was successful.
  submitForm() {
    var message: string = `Welcome ${this.email}`;

    const httpOptions = {
      // withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        charset: 'UTF-8',
        observe: 'response',
        responseType: 'json',
      }),
    };
    if (
      this.emailField.hasError('required') ||
      this.emailField.hasError('email')
    ) {
      message = 'Email incorrect!';
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } else if (this.password == '') {
      message = 'Password Empty!';
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } else {
      //Check if password is correct then send confirmation message only if passed.
      this.passwordCode = this.hashPassword();
      this.sentPassword = this.passwordCode.toString();

      // POST request to the login route, request body contains an object with two properties: email and password. The .subscribe() method is used to handle the response from the server. It takes an object with two callback functions: next and error. The next callback function is executed when the server responds with a successful HTTP status code. The token and refreshToken values from the server's response are stored in the session storage using sessionStorage.setItem('token', resp.token) and sessionStorage.setItem('refreshToken', resp.refreshToken), respectively. 
      // The this.timerService.startRefreshTokenTimer() method is called, which likely starts a timer to refresh the token before it expires.The this.checkResponse(resp.login) function is called, and if it returns true, a success message is displayed using the Angular Material snackBar component. If this.checkResponse(resp.login) returns false, an error message "Password Incorrect!" is displayed using the snackBar component.The error callback function is executed when the server responds with an error HTTP status code, an error message "Email and/or Password Incorrect!" is displayed using the snackBar component in error callback.
      this.http
        .post(
          this.base_url + '/login',
          { email: this.emailField.getRawValue(), password: this.sentPassword },
          httpOptions
        )
        .subscribe({
          next: (response) => {
            const res = JSON.stringify(response);

            let resp = JSON.parse(res);


            sessionStorage.setItem('token', resp.token);
            sessionStorage.setItem('refreshToken', resp.refreshToken);
            this.timerService.startRefreshTokenTimer();

            if (this.checkResponse(resp.login)) {
              this.snackBar.open(message, 'Close', {
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            } else {
              message = 'Password Incorrect!';
              this.snackBar.open(message, 'Close', {
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
            }
          },
          error: (error: HttpErrorResponse) => {
            //lack of valid authenication
            console.error('error in subscribe is ', error);

            message = 'Email and/or Password Incorrect!';
            this.snackBar.open(message, 'Close', {
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          },
        });
    }
  }

  //check value retunred from the backend response, not sure if else condition works
  checkResponse(
    response: boolean //, route: ActivatedRouteSnapshot, state : RouterStateSnapshot)
  ): boolean {
    if (response) {
      console.log('in if cond');
      this.http
        .get(this.base_url + '/protected', {
          observe: 'response',
          responseType: 'json',
        })
        .subscribe({
          next: (response) => {
            const resp = { ...response.body };

            console.log('protected message');
            console.log(resp);
          },
          error: (error) => {
            console.error(error);
          },
        });

      this.router.navigate(['/home']);
      return true;
    } else {
      this.getErrorMessage();
      return false;
    }
  }

  
  // This method gets an error message based on what error that the user has produced, empty, or invalid email.
  getErrorMessage() {
    if (this.emailField.hasError('required')) {
      return 'You must enter a value';
    }

    return this.emailField.hasError('email') ? 'Not a valid email' : '';
  }
}

////////////////////////////////////////////////////////////////

