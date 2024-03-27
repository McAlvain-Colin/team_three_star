import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-invite-user',
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    RouterModule,
  ],
})
export class InviteUserComponent {
  orgID: string | null = '';
  emailField = new FormControl('', [Validators.required, Validators.email]);
  email: string = '';
  emailConfirm: string = '';
  base_url: string = 'http://localhost:5000';
  hide: Boolean = true;

  constructor(private route: ActivatedRoute, private snackBar: MatSnackBar) {} //makes an instance of the router
  ngOnInit(): void {
    this.orgID = this.route.snapshot.paramMap.get('org'); //From the current route, get the route name, which should be the identifier for what you need to render.
    if (this.orgID == null) {
      alert('Error Occured');
    }
  }

  submitForm() {
    var message: string = `Invite sent to ${this.email}`;
    if (
      this.emailField.hasError('required') ||
      this.emailField.hasError('email')
    ) {
      message = 'Email incorrect!';
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } else if (this.email != this.emailConfirm) {
      message = "Emails don't match!";
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } else {
      //Call backend to send the invite to user and reply with response.
      this.snackBar.open(message, 'Close', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
    // Convert this to http check for email sent successfully or not
    //     this.http
    //       .put(
    //         this.base_url + '/createUser',
    //         { email: this.emailField.getRawValue(), password: this.password },
    //         { observe: 'response', responseType: 'json' }
    //       )
    //       .subscribe({
    //         next: (response) => {
    //           const res = JSON.stringify(response.body);

    //           let resp = JSON.parse(res);

    //           console.log('sign in resp is ');

    //           console.log(resp);

    //           console.log(resp.emailConfirmation);

    //           this.checkEmailConfirmation(resp.emailConfirmation);
    //         },
    //         error: (error) => {
    //           console.error(error);
    //         },
    //       });
    //   }

    //   checkEmailConfirmation(check: boolean) {
    //     if (check) {
    //       this.router.navigate(['/login']);
    //     } else {
    //       this.router.navigate(['/signin']);
    //       alert('signup was unsuccessful');
    //     }
  }

  // This method gets an error message based on what error that the user has produced, empty, or invalid email. The number is to signify if it needs to be confirmed.
  getErrorMessage() {
    if (this.emailField.hasError('required')) {
      return 'You must enter a value';
    }

    return this.emailField.hasError('email') ? 'Not a valid email' : '';
  }
}
