import { Component, Injectable } from '@angular/core';
import {
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { ToolBarComponent } from '../tool-bar/tool-bar.component';
import { ActivatedRouteSnapshot, RouterModule, RouterState, RouterStateSnapshot } from '@angular/router';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
// import { HttpClient, HttpResponse } from ' angular/common/http';                   
import { Router } from '@angular/router';
import { HttpClient,HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HTTP_INTERCEPTORS, HttpHeaders} from '@angular/common/http';


import { Observable } from 'rxjs'; 

// import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class appInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currToken = localStorage.getItem('token')
    req = req.clone({ withCredentials: true, headers: req.headers.set('Authorization', 'Bearer ' + currToken)})
    return next.handle(req);
  }
}


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
    FormsModule,
    ReactiveFormsModule,
    TempNavBarComponent,
    RouterModule,
    NgIf,
  ],
})


export class LoginComponent {
  emailField = new FormControl('', [Validators.required, Validators.email]);
  hide: boolean = true;
  email: string = '';
  password: string = '';

  userForm!: FormGroup;
  backendResponse!: any;

  base_url : string = 'http://localhost:5000';

  constructor(private http : HttpClient, private formBuilder: FormBuilder, private router : Router)
  {
  
  }

  //use the `` to allow connections to the variable in the declaration.
  //This submit form method will check for the user's email entry to see if it's correct, currently it will display the user's email if login was successful.
  submitForm() {
    var message: string = `Welcome ${this.email}`;
    if (
      this.emailField.hasError('required') ||
      this.emailField.hasError('email')
    ) {
      message = 'Email incorrect!';
      alert(message);
    } 
    else {
      alert(message);
    }

    
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
          withCredentials: true,
          headers: new HttpHeaders({ 
            'Content-Type': 'application/json',
            'charset': 'UTF-8',
            observe: 'response', responseType : 'json'
        
            })
        };


    //THIS IS THE NEW CURRENT IMPLEMENTATION OF POST REQUEST TO FLASK SERVER IT USES HTTP RESPONSE MODULE FROM ANGULAR DOC: 
    this.http.post(this.base_url + '/login', {email  : this.emailField.getRawValue(), password : this.password}, {withCredentials : true}).subscribe(
      {
        next: (response) => 
        {
          
          const res = JSON.stringify(response)

          let resp = JSON.parse(res)

          console.log('response is ')

          console.log(resp)


          // this.cookieService.get('')
          // localStorage.setItem('token', resp.token)

          this.checkResponse(resp.login);
        },
        error: (error) => 
        {
          console.error(error);
        },
      }
    );

  }

  //check value retunred from the backend response, not sure if else condition works
  checkResponse(response: boolean)//, route: ActivatedRouteSnapshot, state : RouterStateSnapshot)
  {
    if(response)
    {
      console.log('in if cond')
      this.http.get(this.base_url + '/protected', {observe: 'response', responseType : 'json'}).subscribe(
        {
          next: (response) => 
          {
            const resp = {...response.body}

            console.log('protected message')
            console.log(resp)
          },
          error: (error) => 
          {
            console.error(error);
          }
        });

      this.router.navigate(['/dashboard']);

    }
    else
    {
      this.getErrorMessage()
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
