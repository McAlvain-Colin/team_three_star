import { Component } from '@angular/core';
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
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
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
    ToolBarComponent,
    TempNavBarComponent,
    NgIf,
  ],
})
export class SignUpComponent {
  emailField = new FormControl('', [Validators.required, Validators.email]);
  hide: boolean = true;
  name: string = '';
  email: string = '';
  emailConfirm: string = '';
  password: string = '';
  base_url : string = 'http://localhost:5000';


  constructor(private http: HttpClient, private router : Router){}

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
    } else if (this.email != this.emailConfirm) {
      message = "Emails don't match!";
      alert(message);
    } else {
      alert(message);
    }

    console.log('in signin ')
    this.http.put(this.base_url + '/createUser', {email  : this.emailField.getRawValue(), password: this.password}, {observe: 'response', responseType : 'json'}).subscribe(
      {
        next: (response) => 
        {
          const res = JSON.stringify(response.body)

          let resp = JSON.parse(res)

          console.log('sign in resp is ')

          console.log(resp)

          console.log(resp.emailConfirmation)

          this.checkEmailConfirmation(resp.emailConfirmation)

        },
        error: (error) => 
        {
          console.error(error);
        }
      });

    



  }

  checkEmailConfirmation(check:boolean)
  {
    if(check)
    {
      this.router.navigate(['/login'])
    }
    else
    {
      this.router.navigate(['/signin'])
      alert('signup was unsuccessful')
    }
  }

  // This method gets an error message based on what error that the user has produced, empty, or invalid email. The number is to signify if it needs to be confirmed.
  getErrorMessage(confirm: number) {
    if (this.emailField.hasError('required')) {
      return 'You must enter a value';
    }

    return this.emailField.hasError('email') ? 'Not a valid email' : '';
  }
}
