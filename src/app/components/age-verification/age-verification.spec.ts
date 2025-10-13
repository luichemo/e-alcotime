import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgeVerification } from './age-verification';

describe('AgeVerification', () => {
  let component: AgeVerification;
  let fixture: ComponentFixture<AgeVerification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgeVerification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgeVerification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
