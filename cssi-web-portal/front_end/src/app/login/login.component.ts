import { Component } from '@angular/core';
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
import { RouterModule } from '@angular/router';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { HttpClient } from '@angular/common/http';                   
import { Router } from '@angular/router';

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
  backendResponse: string = '';

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

    //this code for seneding get requests and saving response in a variable
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


    //send to the backend so to check if user is valid
    this.http.post(this.base_url + '/handle_post', {email  : this.emailField.getRawValue(), password : this.password}, {responseType : 'text'}).subscribe(
      {
        next: (response) => 
        {
          this.backendResponse = response;
          console.log("this post is :" + this.backendResponse + "space");
          console.log("this post is : " + typeof(this.backendResponse));
          this.checkResponse(this.backendResponse);

        },
        error: (error) => 
        {
          console.error(error);
        },
      }
    );

    
  }

  //check value retunred from the backend response
  checkResponse(response : string)
  {
    if(response == '1')
    {
      console.log('entered if stgate');
      this.router.navigate(['/dashboard']);

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
