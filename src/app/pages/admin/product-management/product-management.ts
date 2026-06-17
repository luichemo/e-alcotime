// FILE: src/app/pages/admin/product-management/product-management.component.ts

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../models/product.model';
import { ProductService, getSearchVariations } from '../../../services/product';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './product-management.html',
  styleUrls: ['./product-management.css']
})
export class ProductManagement implements OnInit {
  products: Product[] = [];
  showAddModal = false;
  editingProduct: Product | null = null;

  // Form fields
  formData = {
    name: '',
    description: '',
    category: 'wine' as 'wine' | 'beer' | 'spirits' | 'champagne' | 'whiskey' | 'cognac' | 'sparkling_wine' | 'tequila' | 'rum' | 'gin' | 'gift' | 'vape' | 'other',
    price: 0,
    discountPrice: 0,
    alcoholContent: 0,
    volume: 0,
    imageUrl: '',
    stock: 0,
    brand: '',
    country: '',
    isAvailable: true,
    nameKa: '',
    nameEn: '',
    descriptionKa: '',
    descriptionEn: '',
    brandKa: '',
    brandEn: '',
    countryKa: '',
    countryEn: '',
    technology: '',
    flavor: '',
    taste: '',
    technologyKa: '',
    technologyEn: '',
    flavorKa: '',
    flavorEn: '',
    tasteKa: '',
    tasteEn: ''
  };

  loading = false;
  translating = false;
  errorMessage = '';

  searchTerm = '';

  get filteredProducts(): Product[] {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.products;
    const variations = getSearchVariations(term);
    return this.products.filter(p => 
      variations.some(vTerm =>
        (p.name && p.name.toLowerCase().includes(vTerm)) ||
        (p.nameEn && p.nameEn.toLowerCase().includes(vTerm)) ||
        (p.nameKa && p.nameKa.toLowerCase().includes(vTerm)) ||
        (p.brand && p.brand.toLowerCase().includes(vTerm)) ||
        (p.brandEn && p.brandEn.toLowerCase().includes(vTerm)) ||
        (p.brandKa && p.brandKa.toLowerCase().includes(vTerm)) ||
        (p.category && p.category.toLowerCase().includes(vTerm)) ||
        (p.country && p.country.toLowerCase().includes(vTerm)) ||
        (p.countryEn && p.countryEn.toLowerCase().includes(vTerm)) ||
        (p.countryKa && p.countryKa.toLowerCase().includes(vTerm))
      )
    );
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  // Pagination
  currentPage = 1;
  pageSize = 8;

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize);
  }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(this.totalPages, this.currentPage + 2); i++) {
      pages.push(i);
    }
    return pages;
  }

  getPageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredProducts.length);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  constructor(
    private productService: ProductService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.loadProducts();
  }

  loadProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.productService.getAllProducts().subscribe({
        next: (products) => {
          this.products = products;
          
          // Clamp current page to the new list boundaries
          const totalProducts = this.filteredProducts.length;
          const maxPages = Math.ceil(totalProducts / this.pageSize);
          if (this.currentPage > maxPages) {
            this.currentPage = Math.max(1, maxPages);
          }
          
          resolve();
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.errorMessage = this.translateService.instant('PRODUCT_MGMT.ERROR_LOAD_FAILED');
          reject(error);
        }
      });
    });
  }

  openAddModal(): void {
    this.resetForm();
    this.editingProduct = null;
    this.showAddModal = true;
  }

  openEditModal(product: Product): void {
    this.editingProduct = product;
    this.formData = {
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      discountPrice: product.discountPrice || 0,
      alcoholContent: product.alcoholContent,
      volume: product.volume,
      imageUrl: product.imageUrl,
      stock: product.stock,
      brand: product.brand,
      country: product.country,
      isAvailable: product.isAvailable,
      nameKa: product.nameKa || product.name || '',
      nameEn: product.nameEn || product.name || '',
      descriptionKa: product.descriptionKa || product.description || '',
      descriptionEn: product.descriptionEn || product.description || '',
      brandKa: product.brandKa || product.brand || '',
      brandEn: product.brandEn || product.brand || '',
      countryKa: product.countryKa || product.country || '',
      countryEn: product.countryEn || product.country || '',
      technology: product.technology || '',
      flavor: product.flavor || '',
      taste: product.taste || '',
      technologyKa: product.technologyKa || product.technology || '',
      technologyEn: product.technologyEn || product.technology || '',
      flavorKa: product.flavorKa || product.flavor || '',
      flavorEn: product.flavorEn || product.flavor || '',
      tasteKa: product.tasteKa || product.taste || '',
      tasteEn: product.tasteEn || product.taste || ''
    };
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.resetForm();
    this.errorMessage = '';
  }

  resetForm(): void {
    this.formData = {
      name: '',
      description: '',
      category: 'wine',
      price: 0,
      discountPrice: 0,
      alcoholContent: 0,
      volume: 0,
      imageUrl: '',
      stock: 0,
      brand: '',
      country: '',
      isAvailable: true,
      nameKa: '',
      nameEn: '',
      descriptionKa: '',
      descriptionEn: '',
      brandKa: '',
      brandEn: '',
      countryKa: '',
      countryEn: '',
      technology: '',
      flavor: '',
      taste: '',
      technologyKa: '',
      technologyEn: '',
      flavorKa: '',
      flavorEn: '',
      tasteKa: '',
      tasteEn: ''
    };
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;

    // Populate standard properties with English inputs prior to saving/adding.
    this.formData.name = this.formData.nameEn;
    this.formData.description = this.formData.descriptionEn;
    this.formData.brand = this.formData.brandEn;
    this.formData.country = this.formData.countryEn;
    this.formData.technology = this.formData.technologyEn;
    this.formData.flavor = this.formData.flavorEn;
    this.formData.taste = this.formData.tasteEn;

    const saveOperation = this.editingProduct && this.editingProduct.id
      ? this.productService.updateProduct(this.editingProduct.id, this.formData)
      : this.productService.addProduct(this.formData);

    saveOperation.then(() => {
      this.loading = false;
      const title = this.editingProduct ? 'განახლდა!' : 'დაემატა!';
      const text = this.editingProduct
        ? 'პროდუქტი წარმატებით განახლდა!'
        : 'პროდუქტი წარმატებით დაემატა!';

      // Close modal immediately
      this.closeModal();

      // Reload products
      this.loadProducts();

      // Show SweetAlert popup
      Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }).catch((error: any) => {
      this.loading = false;
      this.errorMessage = error.message || 'პროდუქტის შენახვა ვერ მოხერხდა';
    });
  }

  deleteProduct(product: Product): void {
    if (!product.id) return;
    Swal.fire({
      title: 'დარწმუნებული ხართ?',
      text: 'ამ მოქმედების უკან დაბრუნებას ვერ შეძლებთ!',
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: 'დიახ, წაშალე!',
      cancelButtonText: 'გაუქმება'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(product.id).then(() => {
          this.loadProducts();
          Swal.fire({
            title: 'წაიშალა!',
            text: 'პროდუქტი წარმატებით წაიშალა!',
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
        }).catch((error: any) => {
          this.errorMessage = error.message || 'პროდუქტის წაშლა ვერ მოხერხდა';
          Swal.fire({
            title: 'შეცდომა',
            text: this.errorMessage,
            icon: 'error'
          });
        });
      }
    });

  }

  toggleAvailability(product: Product): void {
    if (!product.id) return;

    this.productService.updateProduct(product.id, {
      isAvailable: !product.isAvailable
    }).then(() => {
      this.loadProducts();
    }).catch((error: any) => {
      this.errorMessage = error.message || this.translateService.instant('PRODUCT_MGMT.ERROR_UPDATE_FAILED');
    });
  }

  async translateText(text: string, fromLang: string = 'ka', toLang: string = 'en'): Promise<string> {
    if (!text || !text.trim()) return '';
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Translation request failed');
      const data = await res.json();
      if (data && data[0] && Array.isArray(data[0])) {
        return data[0]
          .filter((x: any) => Array.isArray(x) && x[0])
          .map((x: any) => x[0])
          .join('');
      }
      return '';
    } catch (error) {
      console.error('Translation error:', error);
      return '';
    }
  }

  async autoTranslate(): Promise<void> {
    this.translating = true;
    this.errorMessage = '';
    try {
      const translatableFields = [
        { ka: 'nameKa', en: 'nameEn' },
        { ka: 'brandKa', en: 'brandEn' },
        { ka: 'descriptionKa', en: 'descriptionEn' },
        { ka: 'countryKa', en: 'countryEn' },
        { ka: 'technologyKa', en: 'technologyEn' },
        { ka: 'flavorKa', en: 'flavorEn' },
        { ka: 'tasteKa', en: 'tasteEn' }
      ];

      const tasksKaToEn: any[] = [];
      const tasksEnToKa: any[] = [];

      for (const field of translatableFields) {
        const kaVal = (this.formData as any)[field.ka] || '';
        const enVal = (this.formData as any)[field.en] || '';

        if (kaVal && !enVal) {
          tasksKaToEn.push(field);
        } else if (!kaVal && enVal) {
          tasksEnToKa.push(field);
        }
      }

      if (tasksKaToEn.length === 0 && tasksEnToKa.length === 0) {
        Swal.fire({
          title: 'No Text to Translate',
          text: 'Please enter values in Georgian or English fields first.',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }

      let translatedCount = 0;

      // 1. Translate Ka to En
      if (tasksKaToEn.length > 0) {
        const joinedText = tasksKaToEn.map(t => (this.formData as any)[t.ka]).join(' ||| ');
        const translatedJoined = await this.translateText(joinedText, 'ka', 'en');
        if (translatedJoined) {
          const splitTranslations = translatedJoined.split('|||').map(s => s.trim());
          for (let i = 0; i < tasksKaToEn.length; i++) {
            const val = splitTranslations[i];
            if (val) {
              (this.formData as any)[tasksKaToEn[i].en] = val;
              translatedCount++;
            }
          }
        }
      }

      // 2. Translate En to Ka
      if (tasksEnToKa.length > 0) {
        const joinedText = tasksEnToKa.map(t => (this.formData as any)[t.en]).join(' ||| ');
        const translatedJoined = await this.translateText(joinedText, 'en', 'ka');
        if (translatedJoined) {
          const splitTranslations = translatedJoined.split('|||').map(s => s.trim());
          for (let i = 0; i < tasksEnToKa.length; i++) {
            const val = splitTranslations[i];
            if (val) {
              (this.formData as any)[tasksEnToKa[i].ka] = val;
              translatedCount++;
            }
          }
        }
      }

      if (translatedCount > 0) {
        Swal.fire({
          title: this.translateService.instant('PRODUCT_MGMT.TRANSLATION_SUCCESS_TITLE') || 'Translation Complete',
          text: this.translateService.instant('PRODUCT_MGMT.TRANSLATION_SUCCESS_TEXT') || 'Georgian/English values have been translated.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'Translation Failed',
          text: 'Could not contact translation service. Please fill values manually.',
          icon: 'error',
          confirmButtonColor: '#ad8d66'
        });
      }
    } catch (err: any) {
      console.error(err);
      this.errorMessage = 'Auto-translation failed. Please fill values manually.';
    } finally {
      this.translating = false;
    }
  }

  showCSVHelp(): void {
    Swal.fire({
      title: 'CSV ფაილის იმპორტის წესები',
      html: `
        <div style="text-align: left; font-size: 0.9rem; max-height: 400px; overflow-y: auto;">
          <h5 style="color: #c0a27c; border-bottom: 1px solid rgba(192, 162, 124, 0.2); padding-bottom: 8px; font-weight: 600; font-family: 'Outfit', sans-serif;">მთავარი წესები:</h5>
          <ul style="padding-left: 20px; margin-top: 8px; line-height: 1.6; color: #5a5a54; font-family: 'Outfit', sans-serif;">
            <li style="margin-bottom: 8px;"><strong>სავალდებულო სვეტები:</strong> <code>nameKa</code> (ან <code>name</code>), <code>category</code> და <code>price</code>.</li>
            <li style="margin-bottom: 8px;"><strong>რიცხვითი ფორმატი:</strong> ფასი, ფასდაკლება, მარაგი და მოცულობა უნდა იყოს მხოლოდ რიცხვები (მაგ: <code>15.00</code> და არა <code>15ლ</code>).</li>
            <li style="margin-bottom: 8px;"><strong>მძიმეები ტექსტში:</strong> თუ ტექსტურ ველში მძიმეს იყენებთ, ჩასვით ის ბრჭყალებში: <code>"პროდუქტი, ძალიან კარგი"</code>.</li>
            <li style="margin-bottom: 8px;"><strong>ორმხრივი თარგმანი:</strong> თუ შეავსებთ მხოლოდ ქართულ სვეტებს, ინგლისური ვერსიები ავტომატურად ითარგმნება და პირიქით.</li>
          </ul>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'შაბლონის ჩამოტვირთვა',
      cancelButtonText: 'დახურვა',
      confirmButtonColor: '#ad8d66',
      cancelButtonColor: '#888',
      width: '500px'
    }).then((result) => {
      if (result.isConfirmed) {
        this.downloadCSVTemplate();
      }
    });
  }

  downloadCSVTemplate(): void {
    const csvContent = '\ufeffnameKa,nameEn,category,price,discountPrice,brandKa,brandEn,descriptionKa,descriptionEn,alcoholContent,volume,stock,countryKa,countryEn,technologyKa,technologyEn,flavorKa,flavorEn,tasteKa,tasteEn,imageUrl,isAvailable\nტესტ პროდუქტი 1,,wine,15.00,,ტესტ ბრენდი 1,,ძალიან კარგი ქართული წითელი ღვინო,,12.5,0.75,10,საქართველო,,,,,,,,,true\n,Test Product 2,beer,5.50,,,Test Brand 2,,Refreshing cold premium lager beer,5.0,0.5,24,,Georgia,,,,,,,,true\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  escapeCSVValue(val: any): string {
    if (val === undefined || val === null) return '';
    let strVal = String(val).trim();
    if (strVal.includes('"') || strVal.includes(',') || strVal.includes('\n') || strVal.includes('\r')) {
      strVal = `"${strVal.replace(/"/g, '""')}"`;
    }
    return strVal;
  }

  async exportProducts(): Promise<void> {
    if (this.products.length === 0) {
      Swal.fire({
        title: 'პროდუქტები არ მოიძებნა',
        text: 'ბაზა ამჟამად ცარიელია.',
        icon: 'warning',
        confirmButtonColor: '#ad8d66'
      });
      return;
    }

    const categories = Array.from(new Set(this.products.map(p => p.category).filter(Boolean)));
    const categoryOptions: { [key: string]: string } = {
      'all': 'ყველა პროდუქტი',
      'filtered': `საძიებო შედეგები (${this.filteredProducts.length} ცალი)`
    };

    categories.forEach(cat => {
      categoryOptions[cat] = `კატეგორია: ${cat.toUpperCase()}`;
    });

    const { value: selectedFilter } = await Swal.fire({
      title: 'პროდუქციის ექსპორტი',
      input: 'select',
      inputOptions: categoryOptions,
      inputPlaceholder: 'აირჩიეთ ფილტრი',
      showCancelButton: true,
      confirmButtonText: 'ექსპორტი',
      cancelButtonText: 'გაუქმება',
      confirmButtonColor: '#ad8d66',
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value) {
            resolve();
          } else {
            resolve('გთხოვთ აირჩიოთ ვარიანტი');
          }
        });
      }
    });

    if (!selectedFilter) return;

    let listToExport: Product[] = [];
    let fileName = 'products_export';

    if (selectedFilter === 'all') {
      listToExport = this.products;
      fileName = 'all_products_export';
    } else if (selectedFilter === 'filtered') {
      listToExport = this.filteredProducts;
      fileName = 'filtered_products_export';
    } else {
      listToExport = this.products.filter(p => p.category === selectedFilter);
      fileName = `${selectedFilter}_products_export`;
    }

    if (listToExport.length === 0) {
      Swal.fire({
        title: 'პროდუქტები არ მოიძებნა',
        text: 'არჩეული ფილტრის შესაბამისი პროდუქტი არ მოიძებნა.',
        icon: 'warning',
        confirmButtonColor: '#ad8d66'
      });
      return;
    }

    const headers = [
      'nameKa', 'nameEn', 'category', 'price', 'discountPrice',
      'brandKa', 'brandEn', 'descriptionKa', 'descriptionEn',
      'alcoholContent', 'volume', 'stock', 'countryKa', 'countryEn',
      'technologyKa', 'technologyEn', 'flavorKa', 'flavorEn',
      'tasteKa', 'tasteEn', 'imageUrl', 'isAvailable'
    ];

    let csvContent = '\ufeff' + headers.join(',') + '\n';

    for (const prod of listToExport) {
      const row = headers.map(header => {
        let val = (prod as any)[header];
        if (header === 'isAvailable') {
          val = val !== undefined ? val : true;
        }
        return this.escapeCSVValue(val);
      });
      csvContent += row.join(',') + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      title: 'ექსპორტი წარმატებით დასრულდა',
      text: `წარმატებით დაექსპორტირდა ${listToExport.length} პროდუქტი.`,
      icon: 'success',
      confirmButtonColor: '#ad8d66',
      timer: 2000,
      showConfirmButton: false
    });
  }

  mapHeader(header: string): string {
    const cleaned = header.trim().toLowerCase().replace(/_/g, '');
    const mappings: { [key: string]: string } = {
      'nameka': 'nameKa',
      'nameen': 'nameEn',
      'name': 'name',
      'brandka': 'brandKa',
      'branden': 'brandEn',
      'brand': 'brand',
      'descriptionka': 'descriptionKa',
      'descriptionen': 'descriptionEn',
      'description': 'description',
      'category': 'category',
      'price': 'price',
      'discountprice': 'discountPrice',
      'alcoholcontent': 'alcoholContent',
      'volume': 'volume',
      'stock': 'stock',
      'countryka': 'countryKa',
      'countryen': 'countryEn',
      'country': 'country',
      'technologyka': 'technologyKa',
      'technologyen': 'technologyEn',
      'technology': 'technology',
      'flavorka': 'flavorKa',
      'flavoren': 'flavorEn',
      'flavor': 'flavor',
      'tasteka': 'tasteKa',
      'tasteen': 'tasteEn',
      'taste': 'taste',
      'imageurl': 'imageUrl',
      'image': 'imageUrl',
      'isavailable': 'isAvailable',
      'available': 'isAvailable'
    };
    return mappings[cleaned] || header;
  }

  parseCSV(text: string): string[][] {
    const lines: string[][] = [];
    let row = [""];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push('');
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        lines.push(row);
        row = [''];
      } else {
        row[row.length - 1] += char;
      }
    }
    if (row.length > 1 || row[0] !== '') {
      lines.push(row);
    }
    return lines;
  }

  async onFileSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    event.target.value = '';

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      let text = e.target.result || '';
      if (text.startsWith('\ufeff')) {
        text = text.substring(1);
      }
      const csvLines = this.parseCSV(text);
      if (csvLines.length < 2) {
        Swal.fire({
          title: 'შეცდომა',
          text: 'არასწორი ან ცარიელი CSV ფაილი.',
          icon: 'error',
          confirmButtonColor: '#ad8d66'
        });
        return;
      }

      const rawHeaders = csvLines[0];
      const headers = rawHeaders.map(h => this.mapHeader(h));

      const hasName = headers.includes('nameKa') || headers.includes('nameEn') || headers.includes('name');
      const hasPrice = headers.includes('price');
      const hasCategory = headers.includes('category');

      if (!hasName || !hasPrice || !hasCategory) {
        Swal.fire({
          title: 'საკვანძო სვეტები აკლია',
          text: 'CSV ფაილი აუცილებლად უნდა შეიცავდეს სვეტებს: სახელი (nameKa ან name), კატეგორია (category) და ფასი (price).',
          icon: 'error',
          confirmButtonColor: '#ad8d66'
        });
        return;
      }

      const productsToImport: any[] = [];
      const skippedRows: number[] = [];

      for (let i = 1; i < csvLines.length; i++) {
        const row = csvLines[i];
        if (row.length === 1 && row[0] === '') continue;

        const product: any = {};
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j];
          let val = row[j];
          
          if (val === undefined) {
            val = '';
          } else {
            val = val.trim();
          }

          if (['price', 'discountPrice', 'alcoholContent', 'volume', 'stock'].includes(header)) {
            const numVal = val ? parseFloat(val) : 0;
            product[header] = isNaN(numVal) ? 0 : numVal;
          } else if (header === 'isAvailable') {
            product[header] = val.toLowerCase() === 'true' || val === '1' || val === '';
          } else {
            product[header] = val;
          }
        }

        const rowName = product.nameKa || product.nameEn || product.name;
        const rowPrice = product.price;
        const rowCategory = product.category;

        if (!rowName || rowPrice === undefined || isNaN(rowPrice) || !rowCategory) {
          skippedRows.push(i + 1);
          continue;
        }

        productsToImport.push(product);
      }

      if (productsToImport.length === 0) {
        Swal.fire({
          title: 'პროდუქტები არ მოიძებნა',
          text: 'CSV ფაილიდან ვალიდური პროდუქტების წაკითხვა ვერ მოხერხდა.',
          icon: 'error',
          confirmButtonColor: '#ad8d66'
        });
        return;
      }

      let confirmText = `დარწმუნებული ხართ, რომ გსურთ CSV ფაილიდან ${productsToImport.length} პროდუქტის იმპორტი?`;
      if (skippedRows.length > 0) {
        confirmText += ` (შენიშვნა: ${skippedRows.length} არავალიდური მწკრივი გამოიტოვებოდა: მწკრივები ${skippedRows.join(', ')})`;
      }

      const confirmResult = await Swal.fire({
        title: 'იმპორტის დადასტურება',
        text: confirmText,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'იმპორტი',
        cancelButtonText: 'გაუქმება',
        confirmButtonColor: '#ad8d66',
        cancelButtonColor: '#d33'
      });

      if (!confirmResult.isConfirmed) return;

      this.loading = true;
      this.errorMessage = '';
      let successCount = 0;
      let failCount = 0;

      Swal.fire({
        title: 'მიმდინარეობს იმპორტი...',
        html: `მიმდინარეობს პროდუქტების ატვირთვა: <b>0</b> / ${productsToImport.length}`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const translatableFields = [
        { ka: 'nameKa', en: 'nameEn', std: 'name' },
        { ka: 'brandKa', en: 'brandEn', std: 'brand' },
        { ka: 'descriptionKa', en: 'descriptionEn', std: 'description' },
        { ka: 'countryKa', en: 'countryEn', std: 'country' },
        { ka: 'technologyKa', en: 'technologyEn', std: 'technology' },
        { ka: 'flavorKa', en: 'flavorEn', std: 'flavor' },
        { ka: 'tasteKa', en: 'tasteEn', std: 'taste' }
      ];

      for (let index = 0; index < productsToImport.length; index++) {
        const prod = productsToImport[index];

        // Pre-process standard fields (name, brand, etc.) if ka/en are not explicitly set
        for (const field of translatableFields) {
          const stdVal = prod[field.std] || '';
          if (stdVal) {
            const hasGeorgian = /[\u10A0-\u10FF]/.test(stdVal);
            if (hasGeorgian) {
              if (!prod[field.ka]) prod[field.ka] = stdVal;
            } else {
              if (!prod[field.en]) prod[field.en] = stdVal;
            }
          }
        }

        const fieldsToTranslateKaToEn: any[] = [];
        const fieldsToTranslateEnToKa: any[] = [];

        for (const field of translatableFields) {
          const kaVal = prod[field.ka] || '';
          const enVal = prod[field.en] || '';
          if (kaVal && !enVal) {
            fieldsToTranslateKaToEn.push(field);
          } else if (!kaVal && enVal) {
            fieldsToTranslateEnToKa.push(field);
          }
        }

        // 1. Translate Georgian to English
        if (fieldsToTranslateKaToEn.length > 0) {
          const textsToTranslate = fieldsToTranslateKaToEn.map(f => prod[f.ka]);
          const joinedText = textsToTranslate.join(' ||| ');
          try {
            const translatedJoined = await this.translateText(joinedText, 'ka', 'en');
            if (translatedJoined) {
              const splitTranslations = translatedJoined.split('|||').map(s => s.trim());
              for (let fIdx = 0; fIdx < fieldsToTranslateKaToEn.length; fIdx++) {
                const field = fieldsToTranslateKaToEn[fIdx];
                prod[field.en] = splitTranslations[fIdx] || prod[field.ka];
              }
            } else {
              for (const field of fieldsToTranslateKaToEn) {
                prod[field.en] = prod[field.ka];
              }
            }
          } catch (tErr) {
            console.error(`Failed to translate row ${index + 1} (ka->en):`, tErr);
            for (const field of fieldsToTranslateKaToEn) {
              prod[field.en] = prod[field.ka];
            }
          }
        }

        // 2. Translate English to Georgian
        if (fieldsToTranslateEnToKa.length > 0) {
          const textsToTranslate = fieldsToTranslateEnToKa.map(f => prod[f.en]);
          const joinedText = textsToTranslate.join(' ||| ');
          try {
            const translatedJoined = await this.translateText(joinedText, 'en', 'ka');
            if (translatedJoined) {
              const splitTranslations = translatedJoined.split('|||').map(s => s.trim());
              for (let fIdx = 0; fIdx < fieldsToTranslateEnToKa.length; fIdx++) {
                const field = fieldsToTranslateEnToKa[fIdx];
                prod[field.ka] = splitTranslations[fIdx] || prod[field.en];
              }
            } else {
              for (const field of fieldsToTranslateEnToKa) {
                prod[field.ka] = prod[field.en];
              }
            }
          } catch (tErr) {
            console.error(`Failed to translate row ${index + 1} (en->ka):`, tErr);
            for (const field of fieldsToTranslateEnToKa) {
              prod[field.ka] = prod[field.en];
            }
          }
        }

        for (const field of translatableFields) {
          prod[field.std] = prod[field.en] || prod[field.ka] || prod[field.std] || '';
        }

        prod.category = prod.category || 'other';
        prod.isAvailable = prod.isAvailable !== undefined ? prod.isAvailable : true;
        prod.stock = prod.stock !== undefined ? prod.stock : 0;
        prod.imageUrl = prod.imageUrl || '/product-placeholder.png';

        try {
          await this.productService.addProduct(prod);
          successCount++;
        } catch (error) {
          console.error('Failed to save imported product:', prod, error);
          failCount++;
        }

        const container = Swal.getHtmlContainer();
        if (container) {
          const boldEl = container.querySelector('b');
          if (boldEl) {
            boldEl.textContent = (index + 1).toString();
          }
        }
      }

      this.loading = false;
      this.loadProducts();
      this.cdr.detectChanges();
      Swal.close();

      if (failCount === 0) {
        Swal.fire({
          title: 'იმპორტი დასრულდა წარმატებით',
          text: `წარმატებით აიტვირთა ${successCount} პროდუქტი.`,
          icon: 'success',
          confirmButtonColor: '#ad8d66'
        });
      } else {
        Swal.fire({
          title: 'იმპორტი დასრულდა ხარვეზებით',
          text: `წარმატებით აიტვირთა ${successCount} პროდუქტი. ${failCount} პროდუქტის შენახვა ვერ მოხერხდა. დეტალებისთვის იხილეთ ბრაუზერის კონსოლი.`,
          icon: 'warning',
          confirmButtonColor: '#ad8d66'
        });
      }
    };
    reader.readAsText(file);
  }
}