import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderManagement } from './order-management';
import { OrderService } from '../../../services/order';
import { Email } from '../../../services/email';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

describe('OrderManagement', () => {
  let component: OrderManagement;
  let fixture: ComponentFixture<OrderManagement>;
  let mockOrderService: any;
  let mockEmailService: any;

  beforeEach(async () => {
    mockOrderService = {
      getAllOrders: jasmine.createSpy('getAllOrders').and.returnValue(of([]))
    };
    mockEmailService = {
      sendProcessingEmail: jasmine.createSpy('sendProcessingEmail').and.returnValue(Promise.resolve()),
      sendDeliveredEmail: jasmine.createSpy('sendDeliveredEmail').and.returnValue(Promise.resolve())
    };

    await TestBed.configureTestingModule({
      imports: [OrderManagement, TranslateModule.forRoot()],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
        { provide: Email, useValue: mockEmailService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
