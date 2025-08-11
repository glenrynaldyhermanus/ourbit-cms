# 2025-08-11 — Cashier Download Page

- Added public download page for cashier apps at `src/app/download/cashier/page.tsx`.
- Reused existing UI components (`Card`, `Badge`, `Button`, `Divider`) to keep style/theme consistent.
- Included Android (Smartphone/Tablet) download links and marked other platforms as "Coming soon".

- Updated `src/components/layout/Sidebar.tsx` Cashier menu to point to `/download/cashier` for public access.
 - Deployment script fixed: use Firebase hosting target `ourbit-id` in `package.json`.

No other files or styles were changed.
