import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceStatsComponent } from './device-stats.component';

describe('DeviceStatsComponent', () => {
  let component: DeviceStatsComponent;
  let fixture: ComponentFixture<DeviceStatsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceStatsComponent]
    });
    fixture = TestBed.createComponent(DeviceStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
