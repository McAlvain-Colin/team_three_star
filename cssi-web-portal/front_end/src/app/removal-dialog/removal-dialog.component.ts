import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-removal-dialog',
  templateUrl: './removal-dialog.component.html',
  styleUrls: ['./removal-dialog.component.css'],
  standalone: true,
  imports: [MatDialogModule, MatSnackBarModule, MatButtonModule],
})
export class RemovalDialogComponent {
  base_url: string = 'http://localhost:5000';
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      itemName: string;
      itemId: string;
      itemType: number;
      orgId: string;
      appId: string;
      memberRole: number;
    }, //Note we can have any variable in the data parameter, but if it was passed in, it'll be considered undefined
    private snackBar: MatSnackBar,
    public router: Router,
    private http: HttpClient
  ) {}

  message: string = 'Removed ' + this.data.itemName;

  deleteItem() {
    //Trigger delete here with Post message to backend to change the value, we can check which parameters was passed in that's not undefined so that we can post the right information
    if (this.data.itemType == 0) {
      this.http
        .put(
          this.base_url + '/deleteOrg',
          { orgId: this.data.itemId },
          { observe: 'response', responseType: 'json' }
        )
        .subscribe({
          next: (response) => {
            const res = JSON.stringify(response.body);

            let resp = JSON.parse(res);

            if (resp.orgDeleteSuccess) {
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
    } else if (this.data.itemType == 2) {
      this.http
        .put(
          this.base_url + '/removeOrgAppDevice',
          {
            devName: this.data.itemName,
            devEUI: this.data.itemId,
            appId: this.data.appId,
          },
          { observe: 'response', responseType: 'json' }
        )
        .subscribe({
          next: (response) => {
            const res = JSON.stringify(response.body);

            let resp = JSON.parse(res);

            if (resp.deviceRemoved) {
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
    } else if (this.data.itemType == 3) {
      this.http
        .put(
          this.base_url + '/deleteOrgApp',
          { appId: this.data.itemId, orgId: this.data.orgId },
          { observe: 'response', responseType: 'json' }
        )
        .subscribe({
          next: (response) => {
            const res = JSON.stringify(response.body);

            let resp = JSON.parse(res);

            if (resp.appDeleteSuccess) {
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
    } else if (this.data.itemType == 4) {
      if (this.data.memberRole == 1) {
        this.message = "You can't remove an admin from their organization!";
        this.snackBar.open(this.message, 'Dismiss', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      } else {
        this.http
          .put(
            this.base_url + '/deleteMember',
            { orgId: this.data.orgId, memberId: this.data.itemId },
            { observe: 'response', responseType: 'json' }
          )
          .subscribe({
            next: (response) => {
              const res = JSON.stringify(response.body);

              let resp = JSON.parse(res);

              if (resp.memberDeleteSuccess) {
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
    }
  }

  reloadComponent() {
    const url = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {});
    });
  }
}
