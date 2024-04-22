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

// import { CookieService } from 'ngx-cookie-service';
import { Browser } from 'leaflet';

// import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { inject } from '@angular/core';
import { ObserversModule } from '@angular/cdk/observers';


// auth guard to protect routes can only be accessed if there is an 
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  // timerService: TimerService
) => {
  const timerService = inject(TimerService);
  const router: Router = inject(Router);
  const token = sessionStorage.getItem('refreshToken');
  const protectedRoutes: string[] = ['/dashboard', '/home', '/organization', '/application', '/device', '/filter'];

  return protectedRoutes.includes(state.url) && (!sessionStorage.getItem('refreshToken') || !sessionStorage.getItem('token')) || new RegExp('(^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$)').test(token!)
    ? router.navigate(['/login'])
    : true;
};





@Injectable({providedIn: 'root'})
export class TimerService
{
  
  timer!: ReturnType<typeof setTimeout>;
  constructor(private router: Router, private http: HttpClient){}


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

          console.log('deleted message');
          console.log(resp);

          sessionStorage.clear();
          this.stopRefreshTimer();
          

          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  


  isJWTExpired(jwt: string)
  {
    let refreshToken = sessionStorage.getItem('refreshToken')

    let jwtBase64 = refreshToken!.split('.')[1];

    let token = JSON.parse(atob(jwtBase64)); 

    let expires = new Date(token.exp * 1000);

    return expires > new Date();
    
  }



  startRefreshTokenTimer()
  {
    let refreshToken = sessionStorage.getItem('refreshToken')

    let jwtBase64 = refreshToken!.split('.')[1];

    let token = JSON.parse(atob(jwtBase64)); 

    let expires = new Date(token.exp * 1000);
    let timeout = expires.getTime() - Date.now() - (120 * 1000);
    this.timer = setTimeout(() => this.logout(), timeout)
  }

  stopRefreshTimer()
  {
    clearTimeout(this.timer)
  }
}





//interceptor forjwt/refresh tokens
@Injectable()
export class appInterceptor implements HttpInterceptor {

  constructor(private router: Router, private http: HttpClient){}
  

 



  private handleError(next: HttpHandler, req: HttpRequest<any>,)
  {
    let header = new HttpHeaders({'Content-Type': 'application/json', responseType:'json'})

    return this.http.post('http://localhost:5000/refresh', {}, {headers: header}).pipe(
      map((data: any)  => {
        console.log('data is ', data.token)
        sessionStorage.setItem('token', data.token)

        const clone = req.clone({
          headers: req.headers.set('Authorization', 'Bearer ' + data.token)
        });
        
        return next.handle(clone).pipe(catchError((error: HttpErrorResponse) =>
          {
            if(error instanceof HttpErrorResponse)
            {
              // need to add the logout revoke tokne thing here
             
              sessionStorage.clear()
              this.router.navigate(['login'])
  
              return throwError(() => error);
            }
            return throwError(() => error);

          }
        ));
      }),
      
      mergeMap(res => res)


    );
  }


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // req = req.clone({withCredentials: true})

    const currToken = sessionStorage.getItem('token')
    

    
    if(!req.url.includes('refresh'))
    {
      const currToken = sessionStorage.getItem('token')

      req = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + currToken),
      });
    }
    
    else
    {
      const refreshToken = sessionStorage.getItem('refreshToken');
      
      req = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + refreshToken),
      });
    }

    

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) =>
        {
          if(error instanceof HttpErrorResponse)
          {
            // need to add the logout revoke tokne thing here
            if((error.status == 401 || error.status == 403) && currToken == null)
            {
              this.router.navigate(['login'])
              return throwError(() => console.log('my error is ', error));
            } 
            // where both the access and refresh token have expired NEED TIMER!!!!!!
            
            // when access token expired
            else if(error.status == 401 && currToken != null) 
            {
              console.log('in the handle error if cond ')
              
              return this.handleError(next, req)

            }
            else
            {
              // this.logout()

              // this.router.navigate(['login'])

              return throwError(() => error);
            }

          }
          else{
            // this.logout()

            this.router.navigate(['login'])

            return throwError(() => error);
          }
          
        }
      )
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
    private timerService: TimerService  ) {}
  emailField = new FormControl('', [Validators.required, Validators.email]);
  hide: boolean = true;
  email: string = '';
  password: string = '';
  passwordCode: number = 0; //Set as unknown for if debugging is needed, so we can cast the hash into a viewable string.
  sentPassword: string = '';

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
      //THIS IS THE NEW CURRENT IMPLEMENTATION OF POST REQUEST TO FLASK SERVER IT USES HTTP RESPONSE MODULE FROM ANGULAR DOC:
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

            console.log('resp is ');

            // console.log(resp);
            sessionStorage.setItem('token', resp.token);
            sessionStorage.setItem('refreshToken', resp.refreshToken)
            this.timerService.startRefreshTokenTimer()

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
          error: (error: HttpErrorResponse )=> {
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
    // else {
    //   alert(message);
    // }

    // console.log("the form is: ", {email  : this.emailField.getRawValue(),  password : this.password})

    //this code for sending get requests and saving response in a variable
    // this.http.get(this.base_url,{responseType : 'text'}).subscribe(
    // {
    //   next: (response) =>
    //   {
    //     this.backendResponse = response;
    //     console.log("this post is : " + this.backendResponse);
    //   },
    //   error: (error) =>
    //   {
    //     console.error(error);
    //   },
    // }

    // )

    //===================================================
    //send to the backend so to check if user is valid
    // this.http.post(this.base_url + '/handle_post', {email  : this.emailField.getRawValue(), password : this.password}, {responseType : 'text'}).subscribe(
    //   {
    //     next: (response) =>
    //     {
    //       this.backendResponse = response;
    //       console.log("this post is :" + this.backendResponse + "space");
    //       console.log("this post is : " + typeof(this.backendResponse));
    //       this.checkResponse(this.backendResponse);

    //     },
    //     error: (error) =>
    //     {
    //       console.error(error);
    //     },
    //   }
    // );
    //========================================================
    //new implementation returning json data saved to an TS interface instance
    // this.http.post<Resp>(this.base_url + '/handle_post', {email  : this.emailField.getRawValue(), password : this.password}, {responseType : 'json'}).subscribe(
    //   {
    //     next: (response) =>
    //     {
    //       this.checkResponse(response.success);

    //     },
    //     error: (error) =>
    //     {
    //       console.error(error);
    //     },
    //   }
    // );
    // ==================
    // this.http.post <httpResponse<Resp>>(this.base_url + '/handle_post', {email  : this.emailField.getRawValue(), password : this.password}, {responseType : 'json'}).subscribe(
    //   {
    //     next: (response) =>
    //     {
    //       this.checkResponse(response.success);

    //     },
    //     error: (error) =>
    //     {
    //       console.error(error);
    //     },
    //   }
    // );
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

  //   const httpOptions = {
  //     withCredentials: true,
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json',
  //       'charset': 'UTF-8',

  //       })
  //   };

  //   //THIS IS THE NEW CURRENT IMPLEMENTATION OF POST REQUEST TO FLASK SERVER IT USES HTTP RESPONSE MODULE FROM ANGULAR DOC:
  //   this.http.post(this.base_url + '/login', {email  : this.emailField.getRawValue(), password : this.password}, httpOptions).subscribe(
  //     {
  //       next: (response) =>
  //       {
  //         const res = JSON.stringify(response)

  //         let resp = JSON.parse(res)

  //         console.log('response is')
  //         console.log(resp)

  //         //sessionStorage.setItem('token', resp.token)

  //         this.checkResponse(resp.login);
  //       },
  //       error: (error) =>
  //       {
  //         console.error(error);
  //       },
  //     }
  //   );

  // }

  // //check value retunred from the backend response, not sure if else condition works
  // checkResponse(response: boolean)//, route: ActivatedRouteSnapshot, state : RouterStateSnapshot)
  // {
  //   console.log('check response is called')
  //   if(response)
  //   {

  //     const httpOptions = {
  //       withCredentials: true,
  //       headers: new HttpHeaders({
  //         'Content-Type': 'application/json',
  //         'charset': 'UTF-8',

  //         })
  //     };

  //     //this get request was used to ensure the user can access protected backend routes and working
  //     this.http.get(this.base_url + '/protected', httpOptions).subscribe(
  //       {
  //         next: (response) =>
  //         {
  //           console.log('get request next is called')
  //           console.log(response)
  //         },
  //         error: (error) =>
  //         {
  //           console.error(error);
  //         }
  //       });

  //     this.router.navigate(['/dashboard']);

  //   }
  //   else
  //   {
  //     this.getErrorMessage()
  //   }
  // }

  // This method gets an error message based on what error that the user has produced, empty, or invalid email.
  getErrorMessage() {
    if (this.emailField.hasError('required')) {
      return 'You must enter a value';
    }

    return this.emailField.hasError('email') ? 'Not a valid email' : '';
  }
}

////////////////////////////////////////////////////////////////

// import { Component, Injectable } from '@angular/core';
// import {
//   FormControl,
//   Validators,
//   FormsModule,
//   ReactiveFormsModule,
//   FormGroup,
//   FormBuilder
// } from '@angular/forms';
// import { NgIf } from '@angular/common';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { MatSelectModule } from '@angular/material/select';
// import { MatCardModule } from '@angular/material/card';
// import { ToolBarComponent } from '../tool-bar/tool-bar.component';
// import { ActivatedRouteSnapshot, RouterModule, RouterState, RouterStateSnapshot } from '@angular/router';
// import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
// // import { HttpClient, HttpResponse } from ' angular/common/http';
// import { Router } from '@angular/router';
// import { HttpClient,HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HTTP_INTERCEPTORS} from '@angular/common/http';

// import { Observable } from 'rxjs';

// @Injectable()
// export class appInterceptor implements HttpInterceptor {

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     const currToken = sessionStorage.getItem('token')
//     req = req.clone({headers: req.headers.set('Authorization', 'Bearer ' + currToken)})
//     return next.handle(req);
//   }
// }

// export interface Resp{
//   success: boolean
//   token: any
// }

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css'],
//   standalone: true,
//   imports: [
//     ToolBarComponent,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatCardModule,
//     MatIconModule,
//     MatButtonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     TempNavBarComponent,
//     RouterModule,
//     NgIf,
//   ],
// })

// export class LoginComponent {
//   emailField = new FormControl('', [Validators.required, Validators.email]);
//   hide: boolean = true;
//   email: string = '';
//   password: string = '';

//   userForm!: FormGroup;
//   backendResponse!: any;

//   base_url : string = 'http://localhost:5000';

//   constructor(private http : HttpClient, private formBuilder: FormBuilder, private router : Router)
//   {

//   }

//   //use the `` to allow connections to the variable in the declaration.
//   //This submit form method will check for the user's email entry to see if it's correct, currently it will display the user's email if login was successful.
//   submitForm() {
//     var message: string = `Welcome ${this.email}`;
//     if (
//       this.emailField.hasError('required') ||
//       this.emailField.hasError('email')
//     ) {
//       message = 'Email incorrect!';
//       alert(message);
//     }
//     else {
//       alert(message);
//     }

//     // console.log("the form is: ", {email  : this.emailField.getRawValue(),  password : this.password})

//     //this code for seneding get requests and saving response in a variable
//     // this.http.get(this.base_url,{responseType : 'text'}).subscribe(
//     // {
//     //   next: (response) =>
//     //   {
//     //     this.backendResponse = response;
//     //     console.log("this post is : " + this.backendResponse);
//     //   },
//     //   error: (error) =>
//     //   {
//     //     console.error(error);
//     //   },
//     // }

//     // )

//     //===================================================
//     //send to the backend so to check if user is valid
//     // this.http.post(this.base_url + '/handle_post', {email  : this.emailField.getRawValue(), password : this.password}, {responseType : 'text'}).subscribe(
//     //   {
//     //     next: (response) =>
//     //     {
//     //       this.backendResponse = response;
//     //       console.log("this post is :" + this.backendResponse + "space");
//     //       console.log("this post is : " + typeof(this.backendResponse));
//     //       this.checkResponse(this.backendResponse);

//     //     },
//     //     error: (error) =>
//     //     {
//     //       console.error(error);
//     //     },
//     //   }
//     // );
//     //========================================================
//     //new implementation returning json data saved to an TS interface instance
//     // this.http.post<Resp>(this.base_url + '/handle_post', {email  : this.emailField.getRawValue(), password : this.password}, {responseType : 'json'}).subscribe(
//     //   {
//     //     next: (response) =>
//     //     {
//     //       this.checkResponse(response.success);

//     //     },
//     //     error: (error) =>
//     //     {
//     //       console.error(error);
//     //     },
//     //   }
//     // );
//     // ==================
//     // this.http.post <httpResponse<Resp>>(this.base_url + '/handle_post', {email  : this.emailField.getRawValue(), password : this.password}, {responseType : 'json'}).subscribe(
//     //   {
//     //     next: (response) =>
//     //     {
//     //       this.checkResponse(response.success);

//     //     },
//     //     error: (error) =>
//     //     {
//     //       console.error(error);
//     //     },
//     //   }
//     // );

//     //THIS IS THE NEW CURRENT IMPLEMENTATION OF POST REQUEST TO FLASK SERVER IT USES HTTP RESPONSE MODULE FROM ANGULAR DOC:
//     this.http.post(this.base_url + '/login', {email  : this.emailField.getRawValue(), password : this.password}, {observe: 'response', responseType : 'json'}).subscribe(
//       {
//         next: (response) =>
//         {
//           const res = JSON.stringify(response.body)

//           let resp = JSON.parse(res)

//           sessionStorage.setItem('token', resp.token)

//           this.checkResponse(resp.success);
//         },
//         error: (error) =>
//         {
//           console.error(error);
//         },
//       }
//     );

//   }

//   //check value retunred from the backend response, not sure if else condition works
//   checkResponse(response: boolean)//, route: ActivatedRouteSnapshot, state : RouterStateSnapshot)
//   {
//     if(response)
//     {
//       this.http.get(this.base_url + '/protected', {observe: 'response', responseType : 'json'}).subscribe(
//         {
//           next: (response) =>
//           {
//             const resp = {...response.body}
//           },
//           error: (error) =>
//           {
//             console.error(error);
//           }
//         });

//       this.router.navigate(['/dashboard']);

//     }
//     else
//     {
//       this.getErrorMessage()
//     }
//   }

//   // This method gets an error message based on what error that the user has produced, empty, or invalid email.
//   getErrorMessage() {
//     if (this.emailField.hasError('required')) {
//       return 'You must enter a value';
//     }

//     return this.emailField.hasError('email') ? 'Not a valid email' : '';
//   }
// }
