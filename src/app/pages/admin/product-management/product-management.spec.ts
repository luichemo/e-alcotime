import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductManagement } from './product-management';
import { ProductService } from '../../../services/product';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

describe('ProductManagement', () => {
  let component: ProductManagement;
  let fixture: ComponentFixture<ProductManagement>;
  let mockProductService: any;

  beforeEach(async () => {
    mockProductService = {
      getAllProducts: jasmine.createSpy('getAllProducts').and.returnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [ProductManagement, TranslateModule.forRoot()],
      providers: [
        { provide: ProductService, useValue: mockProductService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
