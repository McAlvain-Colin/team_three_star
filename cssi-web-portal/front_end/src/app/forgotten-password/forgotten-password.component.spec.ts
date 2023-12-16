import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgottenPasswordComponent } from './forgotten-password.component';

// Spec.ts is a testing component that is automatically generated for an angular component, and the team has not modified these files.

describe('ForgottenPasswordComponent', () => {
  let component: ForgottenPasswordComponent;
  let fixture: ComponentFixture<ForgottenPasswordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ForgottenPasswordComponent],
    });
    fixture = TestBed.createComponent(ForgottenPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
