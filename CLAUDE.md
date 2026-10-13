# e-alcotime

Online alcohol store (wine, beer, spirits, gifts, vapes) for the Georgian market. Angular 20 SPA on Firebase (Auth + Firestore), deployed to Firebase Hosting. UI in Georgian (`ka`), English (`en`) and Russian (`ru`).

## Commands

```bash
npm i            # install (see "Dependencies" below if it fails with ERESOLVE)
npm start        # ng serve → http://localhost:4200
npm run build    # production build → dist/e-alcotime/browser
npm test         # Karma + Jasmine (only a few specs exist)
firebase deploy --only hosting   # deploy dist/e-alcotime/browser (project: alcotime-9ebcf)
```

On Windows PowerShell, use `npm.cmd` if `npm` resolves to a stray `C:\WINDOWS\system32\npm` file.

## Stack

- Angular 20, standalone components, lazy routes (`src/app/app.routes.ts`), no NgModules
- `@angular/fire` 20 + Firebase 11: Auth and Firestore (configured in `src/app/app.config.ts`)
- Bootstrap 5 + bootstrap-icons (global, via `angular.json`), some Angular Material/CDK
- `@ngx-translate` for UI strings: `public/i18n/{en,ka,ru}.json`, fallback `en`; current language is saved by the navbar
- EmailJS (`src/app/services/email.ts`) for contact / order emails
- SweetAlert2 for dialogs, Litepicker for date picking

## Layout

```
src/app/
  components/   navbar, footer, age-verification (18+ gate)
  pages/        home, products, product-detail, cart, checkout, order-confirmation,
                order-history, profile, login, register, forgot-password,
                about, contact, terms, privacy, not-found
  pages/admin/  dashboard, product-management, order-management (children of /admin)
  services/     auth, product, cart, order, email
  guards/       authGuard (logged in), adminGuard (users/{uid}.role === 'admin')
  models/       product, cart, order, user
src/environments/  environment.ts / environment.prod.ts (Firebase config; prod swapped in at build)
public/        static assets, i18n JSON, flags, logo, sitemap.xml, Google verification file
```

## Domain conventions

- **Bilingual product data.** `Product` has base fields (`name`, `description`, `brand`, `country`, `technology`, `flavor`, `taste`) plus `…Ka` / `…En` variants. `ProductService.localizeProduct` picks the field for the current language and falls back to the base field. When you add a localized field, add `Ka`/`En` variants and update the localizer, the admin form, and CSV import/export.
- **Product categories** are a fixed union in `models/product.model.ts`. Keep it in sync with the filters, i18n keys and admin dropdowns.
- **Sale window.** `discountPrice` applies only between the optional `saleStartDate` and `saleEndDate` (`'YYYY-MM-DD'`, both inclusive, local time). Read through `getSaleStatus` / `getActiveDiscountPrice` in `models/product.model.ts`. `ProductService` sets `discountPrice` to 0 outside the window, so shop templates can just check `discountPrice`. Admin calls `getAllProducts(false)` to get the stored value. `CartService` re-checks the dates on its `localStorage` snapshots.
- **Product caching.** `ProductService` keeps an in-memory cache with a 5-minute TTL. Call `invalidateCache()` after every write.
- **Cart** lives client-side in `localStorage` (`CartService`, BehaviorSubject).
- **Admin product management** (`pages/admin/product-management`):
  - Auto-translates ka↔en through the unofficial `translate.googleapis.com` endpoint.
  - Has CSV template download, export and import. Columns match `test_products.csv`; files are UTF-8 with a BOM.
- **Missing images** fall back to `/product-placeholder.png`.
- **SEO** matters: meta tags in `src/index.html`, `sitemap.xml`, `robots.txt`.
- Some code comments are written in Georgian. That's fine; keep the surrounding style.

## Dependencies

All `@angular/*` packages must be on the **same version**, because Angular declares exact peer dependencies on its own packages. A stale lockfile entry (e.g. `@angular/animations@20.0.0` next to `@angular/common@20.3.4`) makes `npm i` fail with `ERESOLVE`. Fix it by installing the stale package at the matching version (e.g. `npm i @angular/animations@20.3.4`), not with `--force` or `--legacy-peer-deps`. `@angular/platform-browser-dynamic` is a direct dependency only so it stays aligned (`@angular/fire` needs it as a peer).

## Commit style

Short conventional-ish messages: `chore: …`, `feat: …`, `style: …`.
