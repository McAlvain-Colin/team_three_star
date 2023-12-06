import { TestBed } from '@angular/core/testing';

import { DataStatsService } from './data-stats.service';

describe('DataStatsService', () => {
  let service: DataStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
