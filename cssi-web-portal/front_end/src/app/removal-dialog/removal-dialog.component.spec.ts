import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemovalDialogComponent } from './removal-dialog.component';

describe('RemovalDialogComponent', () => {
  let component: RemovalDialogComponent;
  let fixture: ComponentFixture<RemovalDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RemovalDialogComponent]
    });
    fixture = TestBed.createComponent(RemovalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
