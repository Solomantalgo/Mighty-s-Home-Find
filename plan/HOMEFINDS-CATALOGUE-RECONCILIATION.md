# Imported bed reconciliation — 2026-11-25

The public prototype uses the same illustrative prices for all designs: 4×6 at UGX 600,000, 5×6 at UGX 700,000, and 6×6 at UGX 800,000. These are not confirmed production sale prices. The pictured size tokens in the generated assets are separate from these measurements. Every imported Supabase bed has a primary bundled gallery image, but no purchasable variant, SKU, or confirmed configurator mapping. None meets the database publication rule.

| Draft bed slug | Matched bundled frame/dressed pairs | Pictured size labels | Publication blocker |
| --- | ---: | --- | --- |
| `bunk-beds-design-01` | 1 | twin-over-twin | Confirm sold size, colour, SKU, UGX price, and image mapping |
| `bunk-beds-design-02` | 1 | twin-over-full | Same |
| `double-beds-design-01` | 15 | compact, standard, wide | Same |
| `double-beds-design-02` | 15 | compact, standard, wide | Same |
| `kids-beds-design-01` | 4 | junior | Same |
| `king-beds-design-01` | 15 | grand, standard, super-king | Same |
| `king-beds-design-02` | 15 | grand, standard, super-king | Same |
| `queen-beds-design-01` | 15 | compact, standard, wide | Same |
| `queen-beds-design-02` | 15 | compact, standard, wide | Same |
| `triple-beds-design-01` | 15 | narrow, three-tier, wide | Same |
| `triple-beds-design-02` | 15 | narrow, three-tier, wide | Same |

Source: `lib/sample-data.ts`, `lib/generated-bed-image-index.json`, and migration `202611250001_import_storefront_drafts.sql`. The 126 frame/dressed pairs are bundled under `public/assets/bed-catalog-variants/`; the migration linked only gallery images. The existing prototype shows all generated preview choices, but the repository does not say which combinations the business sells. Do not automatically turn those preview choices into sale variants.

For each bed, the owner must provide the actual design/size/colour combinations sold, a unique SKU and confirmed UGX price for each, and the matching pictured size token. Staff can then enter those variants, attach the frame/dressed pair, review the checklist, and publish. Keep sample price labels visible wherever prototype values are still shown. Deploy the authoritative storefront change only after the desired live records are published, because it intentionally does not restore bundled products when the managed catalogue is empty.
