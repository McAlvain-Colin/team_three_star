import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-removal-dialog',
  templateUrl: './removal-dialog.component.html',
  styleUrls: ['./removal-dialog.component.css'],
  standalone: true,
  imports: [MatDialogModule, MatSnackBarModule, MatButtonModule],
})
export class RemovalDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { itemName: string }, //Note we can have any variable in the data parameter, but if it was passed in, it'll be considered undefined
    private snackBar: MatSnackBar
  ) {}

  message: string = 'Removed ' + this.data.itemName;

  deleteItem() {
    //Trigger delete here with Post message to backend to change the value, we can check which parameters was passed in that's not undefined so that we can post the right information
    this.snackBar.open(this.message, 'Dismiss', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
