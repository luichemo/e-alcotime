import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { ProductService } from '../../../services/product';
import { OrderService } from '../../../services/order';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  let mockProductService: any;
  let mockOrderService: any;

  beforeEach(async () => {
    mockProductService = {
      getAllProducts: jasmine.createSpy('getAllProducts').and.returnValue(of([]))
    };
    
    mockOrderService = {
      getAllOrders: jasmine.createSpy('getAllOrders').and.returnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard, RouterModule.forRoot([]), TranslateModule.forRoot()],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: OrderService, useValue: mockOrderService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
