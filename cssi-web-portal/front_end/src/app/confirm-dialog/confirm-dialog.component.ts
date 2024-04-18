import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'],
  standalone: true,
  imports: [MatDialogModule, MatSnackBarModule, MatButtonModule],
})
export class ConfirmDialogComponent {
  base_url: string = 'http://localhost:5000';
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      itemName: string;
      itemId: string;
      itemType: number;
      orgId: string;
      roleId: number;
    }, //Note we can have any variable in the data parameter, but if it was passed in, it'll be considered undefined
    private snackBar: MatSnackBar,
    public router: Router,
    private http: HttpClient
  ) {}

  message: string = 'Changed ' + this.data.itemName + "'s role.";

  alterRole() {
    this.http
      .put(
        this.base_url + '/changeMemberRole',
        {
          orgId: this.data.orgId,
          memberId: this.data.itemId,
          roleId: this.data.roleId,
        },
        { observe: 'response', responseType: 'json' }
      )
      .subscribe({
        next: (response) => {
          const res = JSON.stringify(response.body);

          let resp = JSON.parse(res);

          if (resp.roleChangeSuccess) {
            this.snackBar.open(this.message, 'Dismiss', {
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
          this.reloadComponent();
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  reloadComponent() {
    const url = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {});
    });
  }
}
