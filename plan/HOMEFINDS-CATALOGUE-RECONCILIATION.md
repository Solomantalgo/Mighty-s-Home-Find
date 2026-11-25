# Original bed catalogue reconciliation — 2026-11-25

The eleven beds shown by the original storefront were imported into Supabase as drafts. Publishing a newer test listing activated the managed catalogue, so the original beds disappeared from the public site. Migration `202611250008_publish_original_catalogue.sql` restored those eleven records as published listings. It linked the existing primary photos and all 126 exact frame/dressed pairs from `lib/generated-bed-image-index.json`.

| Published bed | Matched image sets | Pictured size labels |
| --- | ---: | --- |
| `bunk-beds-design-01` | 1 | twin-over-twin |
| `bunk-beds-design-02` | 1 | twin-over-full |
| `double-beds-design-01` | 15 | compact, standard, wide |
| `double-beds-design-02` | 15 | compact, standard, wide |
| `kids-beds-design-01` | 4 | junior |
| `king-beds-design-01` | 15 | grand, standard, super-king |
| `king-beds-design-02` | 15 | grand, standard, super-king |
| `queen-beds-design-01` | 15 | compact, standard, wide |
| `queen-beds-design-02` | 15 | compact, standard, wide |
| `triple-beds-design-01` | 15 | narrow, three-tier, wide |
| `triple-beds-design-02` | 15 | narrow, three-tier, wide |

These image-size labels describe the pictured frame and are separate from the three checkout sizes. The owner confirmed one shared checkout price list for every bed. Legacy variant SKUs and prices are internal compatibility values; the storefront uses the shared list for checkout prices.

Verification after the migration: eleven original records were published and visible to anonymous Supabase reads; 126 active sets had 252 confirmed image views and eleven primary photos. All eleven public product URLs returned HTTP 200, and the home page contained an original bed design. The bundled image files are tracked under `public/assets/bed-catalog-variants/` and served by cPanel.
