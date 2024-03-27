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
} from '@angular/common/http';

import { Observable } from 'rxjs';

// import { CookieService } from 'ngx-cookie-service';
import { Browser } from 'leaflet';

// import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// added implementation for checking if there a token in the local storage, if ther is go to dashbaord, otherwise go to the homepage
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router: Router = inject(Router);
  const protectedRoutes: string[] = ['/dashboard'];

  return protectedRoutes.includes(state.url) && !localStorage.getItem('token')
    ? router.navigate(['/'])
    : true;
};

@Injectable()
export class appInterceptor implements HttpInterceptor {
  //   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //     const currToken = localStorage.getItem('token')
  //     req = req.clone({ withCredentials: true, headers: req.headers.set('Authorization', 'Bearer ' + currToken)})
  //     return next.handle(req);
  //   }
  // }
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const currToken = localStorage.getItem('token');
    req = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + currToken),
    });
    return next.handle(req);
  }
}

////interceptor for cookies
// @Injectable()
// export class appInterceptor implements HttpInterceptor {

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     const currToken = localStorage.getItem('token')
//     req = req.clone({withCredentials: true})

//     return next.handle(req);
//   }
// }

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
    private router: Router
  ) {}
  emailField = new FormControl('', [Validators.required, Validators.email]);
  hide: boolean = true;
  email: string = '';
  password: string = '';
  passwordCode: unknown = 0; //Set as unknown for if debugging is needed, so we can cast the hash into a viewable string.

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
    if (
      this.emailField.hasError('required') ||
      this.emailField.hasError('email')
    ) {
      message = 'Email incorrect!';
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } else {
      //Check if password is correct then send confirmation message only if passed.
      this.passwordCode = this.hashPassword();
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      alert(message);
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

    const httpOptions = {
      // withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        charset: 'UTF-8',
        observe: 'response',
        responseType: 'json',
      }),
    };

    //THIS IS THE NEW CURRENT IMPLEMENTATION OF POST REQUEST TO FLASK SERVER IT USES HTTP RESPONSE MODULE FROM ANGULAR DOC:
    this.http
      .post(
        this.base_url + '/login',
        { email: this.emailField.getRawValue(), password: this.password },
        httpOptions
      )
      .subscribe({
        next: (response) => {
          // this.cookieService.set('mine', 'test')

          const res = JSON.stringify(response);

          let resp = JSON.parse(res);

          console.log('resp is ');

          console.log(resp);

          // console.log('cookie is ')

          // const cook = this.cookieService.get('access_token_cookie')
          // console.log(cook)
          // Browser.cookies.get
          localStorage.setItem('token', resp.token);

          this.checkResponse(resp.login);
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  //check value retunred from the backend response, not sure if else condition works
  checkResponse(
    response: boolean //, route: ActivatedRouteSnapshot, state : RouterStateSnapshot)
  ) {
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

      this.router.navigate(['/dashboard']);
    } else {
      this.getErrorMessage();
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

  //         //localStorage.setItem('token', resp.token)

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
//     const currToken = localStorage.getItem('token')
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

//           localStorage.setItem('token', resp.token)

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
