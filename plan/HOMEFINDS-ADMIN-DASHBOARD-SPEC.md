# Home Finds Admin Dashboard — Product Specification

## Catalogue entry decision (2026-11-25)

The owner confirmed **one shared checkout size and price list for every bed, with no per-bed price overrides**. The initial shared prices are 4×6 at UGX 600,000, 5×6 at UGX 700,000, and 6×6 at UGX 800,000. Staff edit these once under **Admin → Shared options**, along with the available frame design and colour choices. A size offered at checkout does not require a separate product listing or image pair.

The product workflow is three separate pages: **Details → Images → Review & publish**. Details captures the product name, category, optional model reference and description, then saves a new listing as Draft. Images captures gallery photos and matched frame-only/dressed photos tagged by design, colour and an image-size label. The image-size label describes the photograph or design concept; it does not define which checkout sizes can be bought. The app generates internal identifiers and image descriptions. Staff do not enter SKU, price or purchasable-size rows when creating a bed. The final page shows readiness and has the explicit Publish action. This decision supersedes older per-variant price/SKU form language below.

The database currently retains `variants.sku` and `variants.price_ugx` for compatibility with imported records and the publication trigger. New image sets receive internal values; shopper-facing prices come only from the shared list. A later migration can remove those legacy columns once imported catalogue records and any downstream consumers are reconciled. Do not use the legacy values in storefront price displays or checkout totals.

Implementation: migrations `202611250003` and `202611250004` were applied to the linked Supabase project on 2026-11-25. Anonymous readback confirmed the three seeded size prices, six design choices and five colour choices. The local Next.js build and targeted lint passed. The revised admin and storefront code has not been committed or deployed to cPanel in this step; production will use the new UI only after the normal code deployment. The new image uploader still stores files in the configured cPanel media directory.

**Status:** Planning baseline; cPanel hosting and Supabase backend selected. Service configuration and operational policies remain prerequisites.
**Scope:** Staff-facing store administration. The customer storefront is covered only where it displays catalogue data managed here.

### Implementation discovery (2026-11-24)

The repository inspection confirms that this application is a Next.js storefront deployed through cPanel Node.js/Passenger and GitHub Actions. There is no configured database, staff authentication/session system, or persistent media store in the project. The shopper cart's browser `localStorage` is not suitable for admin records or as a security boundary. The deployment workflow replaces the checked-out runtime and does not provide database, authentication, or storage services.

**Architecture decision:** keep cPanel/Passenger for hosting the Next.js application, use Supabase PostgreSQL for catalogue records and Supabase Auth for staff sign-in, and store new uploaded product/configurator media in a durable cPanel directory outside the deployment checkout. The intended production directory is `/home2/mightyhomefinds/homefinds-media`, served by the app through `/media/...`; confirm write access and backup coverage before enabling production uploads. Existing bundled images remain under `public/assets/`. Do not migrate hosting to Vercel.

Configure cPanel production environment variables securely, establish staff accounts and authorization rules, apply database migrations and Row Level Security policies, and confirm database and media backup/restore procedures. Never expose the Supabase secret/service-role key in browser code or repository files. Use server-side authenticated operations for privileged mutations and verify authorization and input on every server action/endpoint. Keep public media access limited to intended catalogue assets. Document ownership and recovery for Supabase and cPanel credentials. The installed Next.js 16.4.6 authentication, self-hosting, and Server Actions guides were reviewed; they explain that server actions are public request entry points requiring authentication, authorization, and input validation for every action.

### Admin implementation status (2026-11-24)

The owner selected the Supabase account for `solomon.billionairesurge@gmail.com`; its `HomeFind's` organization has project ref `gsfphkotxfkwcsetsbvu` in `eu-west-2`, linked to this checkout. Catalogue, staff, and draft-import migrations `202611240001`, `202611240002`, and `202611250001` appear in remote migration history. The owner profile is active and local admin sign-in works. Existing Supabase Storage configuration is legacy; new uploads use cPanel media. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY` for staff invitations, and `HOMEFINDS_MEDIA_DIR` as cPanel runtime variables. Keep secret keys server-only. Apply future schema changes only from version-controlled migrations with the Supabase CLI; do not edit the hosted schema directly in the dashboard. Confirm Supabase database and cPanel media backup/retention before production use.

Publishing is blocked in both server actions and a PostgreSQL trigger unless the product has an active priced sale option, a primary product gallery image, and confirmed frame-only/dressed images for every active variant. Changing a variant's design, size or colour invalidates its image-match confirmation. Removed variants are marked inactive to preserve their identity and media history. Public RLS policies expose published categories, products, active sale variants, gallery images, and confirmed configurator pairs; drafts remain staff-only. No later-phase business modules were added.

Remaining first-release gaps: the storefront reads published managed products only when a valid published catalogue exists and otherwise displays the bundled prototype; the eleven imported designs are still drafts. Category image upload is absent; gallery alt text cannot yet be edited after upload; configurator images cannot be independently removed; and product search only checks names with a 100-row cap. Navigation latency, mobile layouts, publishing workflow, human-readable activity, and staff removal need the improvements recorded below. Confirm cPanel runtime configuration and backup coverage before production uploads.

## 1. Purpose and priorities

### Owner review and implementation priorities (2026-11-25)

The existing beds are already visible on the public site. Their import as eleven Supabase drafts in migration `202611250001_import_storefront_drafts.sql` made them visible in Admin but did **not** complete the catalogue connection: the public site still displays its bundled prototype catalogue until managed products are published. Treat those eleven imported designs as the existing live catalogue, not as new submissions. Reconcile each imported design with its currently displayed prices, options, and available frame/dressed images, publish the corresponding managed records, and make the storefront read those records. Do not invent prices, variants, or images; preserve the currently displayed values and visibly flag any known sample values for owner review. If a required field or image cannot be reconciled, report the exact product and blocker instead of silently claiming it is published. Once the database is the source of truth, deleting, archiving, or unpublishing a managed bed must remove it from the public catalogue; a static fallback must not make it reappear. Keep bundled assets available until their replacements are safely stored in cPanel media.

The following usability changes are part of the catalogue release:

1. Replace wide mobile tables with stacked, labelled cards or another compact layout at phone widths. Product rows, sale options, category rows, activity, and staff controls must fit without page-level or component-level horizontal scrolling. Keep primary actions reachable and tap targets usable.
2. Measure dashboard navigation and data-fetch time before optimizing. Remove redundant authentication or database requests where safe, and show an immediate pending state for every route change, form save, upload, publication, and destructive action. Use skeletons or a small progress indicator that matches the final layout; respect reduced-motion preferences. Do not add an artificial delay.
3. Simplify the listing form: name, category, design, size, colour, price, and images are the main workflow. Auto-generate URL slug and initial image description; move optional metadata into Advanced settings. Save new listings as Draft automatically, then expose explicit Publish, Unpublish, and Archive buttons with a clear readiness checklist.
4. Keep the category creation form closed until **Add category** is clicked. Provide a direct edit action for each existing category.
5. Show activity in plain language, such as “Solomon changed the price of Queen Beds Design 01 from UGX 700,000 to UGX 750,000.” Show actor, item, change, and time. Do not render raw JSON/SQL on the staff screen; retain structured audit data for diagnostics.
6. Owners need **Remove invitation** for pending/revoked invites and **Remove staff member** for accepted accounts, with confirmation, immediate access revocation, and an audit record. Keep Deactivate as a reversible option. Prevent self-removal and removal of the final active owner; preserve historical audit references without displaying unnecessary personal data.
7. Keep the page header pinned to the viewport while scrolling on desktop and mobile, with content offset so it is never covered. Hide the staff invitation form by default and open it only after the owner selects **Invite staff**. Display staff as readable cards on phones, with the role selector on its own row and access/removal controls clearly separated. Product cards on phones must have a prominent **Edit product** action and readable image, name, category, status, and controls.
8. Show the actor's name or email with each staff activity item. Label entries without a staff actor as system actions; never imply an unidentified staff member made them. Navigation feedback should appear on the clicked tab immediately, even while authenticated server data is still loading.

Give authorised Home Finds staff a straightforward way to manage the products shown on mightyhomefinds.com without routine developer help. The first release should make it easy to add a bed, maintain its designs and purchasable options, upload the right images, set prices, and control whether the listing is visible.

Priorities, in order:

1. Product and listing management: create, edit, publish, unpublish, and archive beds.
2. Variant management: define the sizes, designs, colours, SKUs, prices, and availability actually offered for each bed.
3. Product and configurator image management: upload and match frame-only and dressed images for the correct variant.
4. Clear validation, previews, save feedback, and a history of important changes.
5. Add inventory, orders, and wider business operations in later phases, based on confirmed workflows.

The interface should be desktop-first and usable on tablets and phones. Keep the common product-entry workflow clear enough for a staff member to learn quickly.

## 2. Recommended scope by phase

### Phase 1 — Catalogue administration (first usable release)

- Secure staff sign-in and sign-out.
- Overview page with links to products needing attention and recently updated listings.
- Product search, category/status filters, sorting, and pagination.
- Create and edit product listings, categories, designs, and purchasable variants.
- Manage prices, publication status, descriptions, specifications, and product images.
- Upload, preview, reorder, replace, and remove images; select a primary listing image and enter alt text.
- Match frame-only and dressed images to the correct design, size, and finish.
- Show missing or mismatched variant/image combinations before publication.
- Record who changed a product, price, variant, publication state, or image mapping and when.

### Phase 2 — Inventory and order operations

- Variant-level stock and availability, with an adjustment history.
- Order list and detail pages, customer/order snapshots, fulfilment status history, and staff notes.
- Separate payment status from order fulfilment status.
- A controlled manual payment-reference review flow, if the business confirms it is needed.

### Phase 3 — Business operations

- Bulk quote requests, delivery settings, promotions, and review moderation.
- Additional staff roles and permissions beyond `owner` and `catalogue_admin`.
- Operational reports and CSV exports.

Do not make charts, forecasts, promotions, reviews, or elaborate reports a prerequisite for the first release. First make catalogue edits safe and dependable.

## 3. Admin navigation

Initial navigation:

1. Overview
2. Products
3. Categories
4. Activity

Add Inventory, Orders, Bulk Quotes, Promotions, Reviews, Reports, Delivery, and Settings only as those phases are approved and implemented. The first release includes owner-only Staff management. Show only pages the signed-in staff member may access.

The global header should include the page title/breadcrumb, product search, attention indicators where useful, staff profile, and sign-out. Avoid a global search promise until the relevant records and permissions exist.

## 4. Overview page

The overview should answer: **What catalogue work needs attention?**

Initial panels may include:

- Draft and unpublished listings.
- Products missing a price, primary image, or required variant image.
- Recently changed products.
- Quick action to add a bed.

Link each item to the relevant filtered product or edit page. Add sales and order KPIs only when reliable order/payment data is available and revenue definitions are approved.

## 5. Product catalogue

### Product list

Support search by product name, model/design, or SKU; filter by category and listing status; sort by name, last updated, and price; and paginate results.

Suggested columns: thumbnail, product/model name, category, starting price (clearly labelled), number of purchasable variants, listing status, last updated, and actions.

### Product fields and staff workflow

- Product name and unique URL slug. Generate the slug from the name and keep it hidden in an optional Advanced section; preserve existing slugs unless staff explicitly change them, with a warning that changing a live URL may break links.
- Category.
- Model/design name or reference.
- Product description. The short description is optional metadata and should be derived from confirmed copy or kept in Advanced settings, not required in the main form.
- Specifications, dimensions, material, and included items where confirmed.
- Product images and a primary image. Generate useful initial alt text from the product name, category, colour, size, and view where available; allow staff to correct it in image details.
- SEO title and description (can be optional in the first release).
- Listing state: new listings save as Draft automatically. Show a clear Publish action after required fields and images are complete, and Unpublish/Archive actions for live listings. Do not make staff choose status from a form dropdown.

Validate required fields and slug/SKU uniqueness on the server. Show a publication checklist with actionable missing items. A draft is not shown to shoppers. An archived product is hidden from normal shopping but retained for historical order references. Do not hard-delete products referenced by orders.

### Variants and pricing

Represent each actual purchasable combination explicitly. Depending on the product, options may include:

- Bed size/measurement.
- Bed design/model.
- Frame colour/finish.
- SKU or product reference.
- Price in UGX.
- Availability (for example, available, out of stock, or made to order; final terms to be confirmed).
- Optional stock quantity, dimensions, and weight when inventory tracking is enabled.

Staff must be able to add/remove supported options without code changes. Do not automatically create every possible combination: only list combinations the business sells. Each purchasable combination must have a unique variant identity and a valid price. Show the variant price clearly; a product-level “starting price” must be derived from active variants and labelled as such.

Use exact money storage (integer minor units or a fixed-precision numeric type), never floating-point arithmetic. Display UGX and do not invent sale prices or promotion dates.

## 6. Product images and bed configurator assets

The admin should let staff upload multiple images, see upload progress/errors, preview them, reorder them, set the primary image, enter alt text, and replace/remove them. Validate image type, dimensions where appropriate, and file size. Store file paths and metadata in records; do not store image binaries in database rows.

For each supported product/design/size/finish shown in Build Your Bed, staff should be able to associate:

- A frame-only image.
- A matching fully dressed image.
- Optional bedding preset identifier, display order, and active state.

Provide side-by-side previews and make the matching dimensions obvious. Warn when one image is missing, when the pair appears to reference different variants, or when the mapping points to an inactive variant. Do not silently show an image of the wrong colour or design. A variant should not appear in the customer configurator without a valid image pair unless an explicitly approved fallback is configured.

For the current image-generation effort, the planned catalogue target is two designs per category, three size variants per design, five frame colours, and two views (frame-only and dressed). This is an asset target, not a mandate to publish combinations the business does not sell. The admin must permit partial variant coverage and clearly identify missing assets.

### Image storage and deployment

The storefront deploys through GitHub Actions to a cPanel Node.js/Passenger app. New staff-uploaded media belongs in a persistent cPanel directory outside the replaceable application checkout, served through the app's media route. Existing generated assets are bundled under `public/assets/` until replaced. Configure safe upload validation, file limits, delivery URLs, write permissions, backup/retention, and restore procedures before enabling production uploads. Store file paths and metadata in PostgreSQL; do not put image binaries in database rows.

## 7. Categories

Show the existing category list first, with an **Add category** button that reveals the creation form. Each category needs a clear **Edit** action that opens a populated form and supports saving or cancelling. Allow authorised staff to set name, description, image, display order, and visibility; generate the slug automatically and keep manual URL editing in Advanced settings. The current categories are King, Queen, Double, Triple, Kids’, and Bunk beds. Do not delete a category containing active products without reassignment or a safe explicit workflow.

## 8. Security, staff access, and auditability

- Require authenticated staff sessions for all admin pages and mutations.
- Enforce authorisation server-side; hiding buttons is not access control.
- Never expose privileged database or storage credentials in browser code.
- Validate all product, price, status, and upload mutations on the server.
- Restrict uploads by type and size; use safe generated storage names.
- Record actor, action, entity, timestamp, and relevant before/after values for important catalogue changes.
- Do not record passwords, private keys, payment secrets, or other credentials in logs.
- Do not use shared staff logins when multiple staff accounts are introduced.

Start with a named owner/admin role if the initial user population is one person. Add granular roles once staff responsibilities are known. The owner should control staff access; catalogue staff should not be able to elevate their own permissions.

## 9. Later operational modules

These modules are part of the broader admin vision but require business rules before implementation:

- **Inventory:** variant-level quantities and an immutable movement ledger recording delta, previous/resulting quantity, reason, actor, reference, and timestamp. Define low-stock thresholds, reservations, backorders, and made-to-order handling first.
- **Orders:** searchable list and detail view with immutable purchase-time product/variant/price snapshots, separate payment and fulfilment states, validated transitions, status history, and staff notes.
- **Payments:** a submitted customer reference is not proof of payment. Any manual verification needs a defined authorised process and auditable evidence. Payment-provider callbacks must be verified server-side and processed idempotently if automation is later adopted.
- **Bulk quotes:** track business/contact details, requested products and quantities, location, assigned staff, notes, follow-ups, quoted amount/validity, and outcome. A quote is not an order; conversion must be explicit.
- **Delivery:** manage approved zones, fees, estimates, and manual-quote rules. Existing orders must retain a snapshot of the delivery terms used at purchase.
- **Promotions and reviews:** validate discounts server-side and never imply a review is verified without a genuine qualifying purchase.
- **Reports:** define paid gross sales, net sales, refunds, date ranges, and privacy rules before reporting. Exclude unpaid and cancelled orders from paid revenue.

## 10. UI/UX direction

### Current direction: polish the existing admin shell

The owner approved the current structure shown in the shared admin screenshots: persistent left sidebar, compact title/header row with Home Finds branding and signed-in staff identity, and a centered main content area. Keep that information architecture and improve its visual finish; do not replace it with a marketing-style dashboard or a materially different navigation pattern.

- Preserve the warm cream canvas, white cards, deep forest-green primary actions, espresso text, pale-green selected navigation, and restrained bronze accents. Refine the palette into consistent design tokens and use them throughout login, dashboard, products, categories, activity, staff, and product forms.
- Improve hierarchy with consistent page titles, section headings, eyebrow labels, spacing, card borders/shadows, control sizing, and typography. Keep the interface calm and professional, with enough contrast and table density for daily catalogue work.
- Keep the left navigation clear and stable on desktop; make it collapse into an accessible mobile navigation pattern on smaller screens. Keep the top header and logo proportions consistent across all admin pages.
- Improve empty, loading, success, validation, and error states. Empty tables should clearly explain the next step; loading and saving states should not cause large layout shifts. Navigation should respond immediately while server data is loading.
- Add restrained hover, focus, selected, and loading transitions. Respect `prefers-reduced-motion`; motion should communicate an action or state, not decorate the interface.
- Keep product forms grouped into clear sections: Listing, Designs & Variants, Pricing, Images, and Publication. Use responsive grids and readable labels/help text without changing the underlying business workflow.
- Keep all existing access controls and server-side validation intact while changing presentation. Do not weaken authentication, RLS, role checks, or destructive-action safeguards for visual convenience.

### Sign-in interaction

When the user clicks **Sign in**, immediately show a clear pending state on the button (for example, a small spinner and “Signing in…”), disable repeat submission, and preserve the form layout while the server action runs. Restore the button and display the existing error if authentication fails. On success, let the existing redirect proceed without an artificial delay. Provide accessible status messaging, visible keyboard focus, and reduced-motion support. Use the framework’s supported form-pending pattern rather than client-side fake authentication.

### Quality bar

Treat the screenshots supplied with the dashboard-polish request as the layout reference. Improve consistency and responsive behavior across the overview, products, categories, activity, staff, and add-product pages. Verify desktop and phone widths, keyboard interaction, focus visibility, readable contrast, and loading/error states. No mobile table or form should require horizontal scrolling. Avoid introducing decorative charts or extra dashboard modules that do not use reliable data.

## 11. Technology and architecture

The storefront is a Next.js App Router application deployed to cPanel with Passenger. The chosen architecture keeps that hosting and uses Supabase PostgreSQL for durable records, Supabase Auth for staff authentication, and a persistent cPanel media directory for new product/configurator uploads. Confirm secure environment configuration, schema/migrations, Row Level Security, media write access, and backup/restore before production use. Keep privileged mutations server-side; never expose secret/service-role credentials in client code.

Use migrations and durable records for categories, products, variants, image metadata/configurator mappings, staff identities/roles, and audit events. Add orders, payments, inventory, quotes, and other records only as the corresponding workflows are approved. Keep schema and application validation aligned.

## 12. Decisions to confirm

Before treating catalogue data as production truth, confirm:

1. Final categories and product/design names.
2. Sizes and measurements sold by each design.
3. Colours/finishes offered for each product, and whether all five planned colours are real sale options.
4. Actual variant SKUs/references and prices.
5. Which products are stocked, made to order, or both.
6. What the shopper receives (frame, mattress, bedding, or other items).
7. The initial staff users and who may publish listings or change prices.
8. Supabase project ownership, staff account/recovery process, database policies, cPanel media access and backup/restore, and cPanel environment-variable configuration.
9. Inventory thresholds and stock reservation rules before inventory is enabled.
10. Order/payment workflow, delivery fees/areas, and quote process before those modules are enabled.

New products start as drafts. The owner has identified the existing eleven storefront designs as already live; their migration should preserve exactly what the site currently displays, then make those records the managed source of truth. Do not invent additional prices, stock levels, delivery terms, reviews, or payment claims. Flag known illustrative values for owner review.

## 13. Definition of done for the first release

- Only authorised staff can access admin pages or invoke admin mutations.
- Staff can create, edit, draft, publish, unpublish, and archive products.
- Staff can manage categories and only the size/design/colour combinations actually offered.
- Each active purchasable variant has a unique identity and valid UGX price.
- Staff can upload, preview, reorder, replace, and remove product images with useful alt text.
- Frame-only and dressed images can be mapped to the correct variant, with missing/mismatched mappings clearly flagged.
- Storefront listings and configurator options are driven by saved catalogue data rather than developer-only hardcoding.
- Important catalogue changes are attributable to a staff member and timestamp.
- New uploaded media is stored in a persistent cPanel directory outside the deployment checkout, and its access/backup/restore path is documented.
- Existing live beds are visible as managed published listings; changes to their names, prices, images, publication state, and removal are reflected on the storefront without a static fallback restoring removed items.
- Product, category, staff, and activity screens are usable at phone width without horizontal scrolling, with immediate navigation and mutation feedback.
- Staff can remove pending invitations and existing accounts safely; the final active owner cannot be removed.
- Empty, loading, validation, save-success, and failure states are understandable to staff.

## 14. Recommended implementation order

1. Provision/configure Supabase for the confirmed catalogue fields, staff owner, access policies, persistent media, backups, and cPanel environment variables.
2. Build the protected admin shell and owner sign-in.
3. Implement categories and products, including variants and UGX pricing.
4. Implement image uploads, galleries, and matched configurator assets.
5. Connect storefront product/category/configurator data to the managed catalogue.
6. Add audit history and operational safeguards.
7. Add inventory and orders after their policies are confirmed.
8. Add quotes, delivery, promotions, reviews, reports, and additional staff roles as approved.

### Staff management discovery update (2026-11-24)

Staff management includes `owner` and `catalogue_admin` profiles, pending/accepted/revoked invitation state, owner-only invitations, role/deactivation controls, and database protection against removal of the final active owner. The owner has used the staff page locally. Removal of invitations and accepted users was implemented in the follow-up update below.

### Catalogue reconciliation and implementation update (2026-11-25)

The eleven imported records have a primary bundled gallery image but no `variants` or `configurator_assets`. The prototype shows the same three **illustrative** UGX prices (600,000 for 4×6, 700,000 for 5×6, 800,000 for 6×6) for every bed. Its generated image-size tokens (`compact`, `standard`, `wide`, `grand`, `junior`, `twin-over-twin`, etc.) are deliberately separate from those commercial measurements. The repository does not establish which sizes/colours each design is actually sold in, a confirmed SKU for any combination, or which image-size token matches a sold measurement. The exact frame/dressed assets exist, but attaching them to invented sale options would falsely confirm a match. All eleven records therefore remain drafts pending owner-supplied sale combinations, actual UGX prices, SKUs, and image-size mapping. The affected slugs are `bunk-beds-design-01`, `bunk-beds-design-02`, `double-beds-design-01`, `double-beds-design-02`, `kids-beds-design-01`, `king-beds-design-01`, `king-beds-design-02`, `queen-beds-design-01`, `queen-beds-design-02`, `triple-beds-design-01`, and `triple-beds-design-02`.

The storefront code now treats Supabase as authoritative: an empty published catalogue stays empty, and a database error does not silently restore bundled sample beds. This change must be deployed together with confirmed published records to keep the existing designs visible. The user-requested publication of the eleven beds is blocked by the specific missing commercial data above. New production uploads fail closed unless `HOMEFINDS_MEDIA_DIR` is an absolute path outside the deployment checkout; cPanel write access and backup coverage remain to be verified on the host.

Migration `202611250002_staff_removal_audit.sql` adds an audit actor email snapshot and an owner-only, self/last-owner-guarded removal audit function. Owner removal uses server-side Supabase Auth Admin deletion and retains catalogue history. The linked project reference was checked against `gsfphkotxfkwcsetsbvu` before migration dry-run and push; no staff invitations or account removals were sent during implementation.

This document is the planning baseline for the Home Finds admin application. It does not authorise live payment automation or assume unresolved prices, stock, delivery, or catalogue combinations.
