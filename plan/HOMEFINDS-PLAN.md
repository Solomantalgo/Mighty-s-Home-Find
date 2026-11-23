# HomeFinds Ecommerce Website Plan

## Project context

HomeFinds sells metallic beds to customers and businesses in Kampala. The workspace had no existing catalog, brand guide, or technical brief, so this plan is based on the information provided by the business owner. Prices and product details shown in the visual concepts are placeholders, not confirmed offers.

## Immediate priority: match the visual reference

The first delivery is a visual prototype whose layout, hierarchy, product imagery, colour, and density closely follow `homefinds-inspiration-reference.png`. Treat this image as the design specification, not loose inspiration. Prioritize matching its two distinct mobile experiences: the storefront homepage on the left and the product/configurator screen on the right. The current single-page split-hero layout with a configurator appended below the catalogue does not match this direction; restructure it.

Do not pause the visual work to collect real prices, stock, reviews, policies, or delivery details. Use coherent illustrative sample content for the prototype and keep all sample product/pricing/review/delivery values together in replaceable data. Do not clutter the design with repeated “to be confirmed” labels. Do not connect real payments or present the sample as a live operational shop. Once the visual structure is approved, replace sample content with verified business information and proceed to commerce work.

Visual acceptance: at phone width, the homepage and product detail should each reproduce the reference’s layout rhythm and hierarchy; category/model navigation and interactions should work with sample data; at desktop width the responsive site should preserve the same design language without drawing a fake phone frame around the page. No route or viewport may create unintended horizontal page overflow. Capture browser screenshots at phone and desktop sizes, compare against the supplied reference, and iterate on visible differences before calling the visual prototype complete.

## Recommended implementation stack

For the planned production ecommerce site, use **Next.js App Router, React, and TypeScript**. Use Tailwind CSS for responsive styling, accessible Radix/shadcn primitives for common controls, and Motion for React only for purposeful interface animation. This matches the need for product/category routes, server-rendered product content, search visibility, and a growing set of storefront and admin features.

Use **Supabase** for PostgreSQL, authentication, and image storage. The preferred deployment target is the business's **cPanel account**, with source hosted on GitHub and production updated from the approved GitHub branch. This is conditional on the specific cPanel hosting plan supporting a persistent, compatible Node.js application for the current Next.js app. Keep secrets and privileged database operations on the server. Confirm hosting plan capabilities and costs before committing to deployment architecture.

### Hosting and update workflow (preferred; verify cPanel capabilities first)

- Keep the canonical project repository on GitHub. Work is committed and pushed to a release branch (or main after review); the approved update then deploys to cPanel automatically.
- cPanel Git Version Control deployment runs through a cPanel-managed repository and a checked-in `.cpanel.yml`; a plain push to GitHub does not by itself guarantee that cPanel updates. Choose and document the bridge after inspecting the host: cPanel push deployment, a GitHub Actions workflow using the host's supported deployment method, or the provider's documented webhook/CI integration.
- The cPanel plan must provide a Node.js runtime compatible with the project's Next.js version, a way to build and run/restart the app, adequate memory/storage, HTTPS/domain support, and secure environment-variable configuration. If it only serves static files, do not assume the current app can be copied to `public_html` unchanged; first assess static-export limitations and any required app changes.
- Use a staging/preview deployment before production. Build from a clean commit, install from the lockfile, deploy the build, restart the app, and verify the live health/page flow. Keep a rollback point and backups. Never place secrets in GitHub source or public files.
- Before connecting deployment credentials, confirm repository ownership/access, cPanel Git/SSH/Node features, available Node versions, and whether the provider permits automated builds and persistent Node processes.

The workspace currently contains a plain HTML/CSS/JavaScript prototype (`index.html`, `styles.css`, `app.js`) and no React build setup. Treat migration to Next.js as an explicit first implementation step; do not mix the existing prototype architecture with the new app. Keep the current prototype available as a visual reference until the Next.js version reproduces the approved behavior. Use stable, compatible package versions at implementation time.

Use `public/assets/` for local prototype images. The planning originals and references remain in `plan/`; generated sample images have copies under `public/assets/`. For production, store media in Supabase Storage and keep paths/metadata in PostgreSQL. The first configurator should use matched frame-only and dressed images. Consider layered rendering later if aligned assets exist; make Three.js/WebGL optional future work, never a launch dependency.

## Scope and site map

### Storefront

- Home (`/`): compact navigation, full-width lifestyle hero with overlay copy and actions, service-benefit strip, 2×2 category cards, horizontal featured-product cards, business-order banner, and fixed mobile bottom navigation. Home category/product links should go directly to a relevant product page, with its inline category/model switcher available.
- Do not add an intermediate shop/category gateway page in the current prototype. Category browsing and bed-model switching happen inline on the product page.
- Product detail (`/products/[slug]`): dominant bed preview with Frame Only/Fully Dressed control and comparison divider, inline category and model selector, finish swatches, product title, size-dependent price, rating, Add to Cart and WhatsApp actions, benefits, related beds, and a review card.
- Build Your Bed: frame-only/dressed views, model/size/finish options, optional bedding preset, and updated sample product information. This is part of the product experience, not a large extra section appended to the homepage.
- Cart and checkout: follow `assets/cart-drawer-demos/demo-1-desktop-side-drawer.png`; use an animated right-side cart drawer on desktop and a bottom sheet on mobile, then continue to a full checkout page. The drawer shows each bed configuration, size, finish, quantity controls, subtotal, delivery estimate and removal action.
- Keep cart lines separate by bed design, size and finish. Adding the same configuration again increments only that line; choosing another design or option creates or updates that configuration’s own line without overwriting stale details. The drawer and checkout must display the right options and totals for every line.
- After **Add to Bag** succeeds, keep the action available for repeat additions; do not leave the button gray or disabled. Show confirmation through the cart drawer or brief feedback. Disable only during a real in-flight operation and restore it as soon as that operation finishes. See `assets/ui-feedback/add-to-bag-disabled.png`.
- Business orders: bulk information and a quote request with organization, contact, requested products/quantities, location, and message.
- Supporting pages: About, Contact, FAQs, Delivery & Returns, approved Warranty, Privacy, and Terms.

### Admin

Plan a secured admin area for products, variants, images, inventory, orders, customers, manual payment-reference verification, bulk quotes, promotions, reviews, reports, settings, and staff roles. Enforce authorization on the server and through Supabase Row Level Security; hiding controls in the UI is not security.

## Catalogue and data rules

Products should have a name, slug, SKU, category, description, specifications, SEO fields, images with alt text, and active/published status. Variants should capture size, frame design, finish, SKU, price, stock/availability, and configurator image mappings. Support search by name/SKU, relevant filters and sorting, related/recently viewed products, and quick-add only when the selected variant is unambiguous.

Use PostgreSQL records for profiles, addresses, categories, products, variants, product images, configurator assets, carts/items, orders/items, payments, order status history, bulk quote requests, reviews, and admin roles as needed for approved scope. Use explicit UGX currency and exact money types (integer minor units or defined numeric; never floating-point arithmetic). Snapshot product name, SKU, selected options, and unit price on order items. Validate price, variant, and stock on the server and use transactions/safe stock changes to prevent overselling.

## Payments, fulfilment, and safety

### First checkout payment method: manual MTN MoMo

For the initial checkout flow, use the customer-initiated manual MoMo process below. Do not integrate a payment gateway or claim automatic payment confirmation in this phase.

1. Show the selected items, delivery details, and **exact total due in UGX** before asking the customer to pay.
2. Offer “Pay with MTN MoMo”. Display the USSD code exactly as provided by the business: **`*185*1*1#`**. Include a “Copy USSD code” control and, on compatible phones, an “Open phone dialer” action; keep the literal code visible as a fallback.
3. Display the HomeFinds MoMo receiving number prominently with a “Copy number” button. The business must supply this number before the flow can be used for real orders. Do not substitute a personal or invented number.
4. Show concise steps: dial the code, follow the prompts, send the exact displayed order total to the displayed HomeFinds number, and keep the resulting MoMo transaction/payment ID.
5. Let the customer return to checkout and submit the transaction/payment ID. Collect payer name/phone only as needed to identify the payment; allow a different payer phone if someone else paid for the order.
6. Show a confirmation screen with the order reference and status **“Payment submitted — awaiting HomeFinds verification.”** Preserve the cart/order details and show how to contact support if the customer needs help.

Use an order state such as `awaiting_payment` before the customer submits a reference, then `payment_pending_verification` after submission. A reference submitted by the customer is not proof of receipt. HomeFinds staff must check the incoming MoMo transaction, confirm the transaction ID, amount, recipient, and order, then mark the payment verified and move the order to the next fulfilment state. Provide staff with a secure manual verification queue and an audit trail of who verified or rejected a reference. Keep payment status separate from fulfilment status. Do not silently mark an order paid based only on a customer-entered ID.

The HomeFinds receiving number, support contact, and final customer-facing instructions are open business inputs. Keep them in replaceable configuration rather than hardcoding them into page layout. If the receiving number is not yet supplied, use a clearly nonfunctional sample only in the visual prototype and prevent real checkout submission.

### Later payment automation

After the manual flow is approved and the business has merchant onboarding, evaluate MTN Mobile Money, Airtel Money, cash on delivery (only if offered), and optional cards through an approved provider. Confirm eligibility, settlement, fees, supported currencies/payment methods, and onboarding before choosing an integration.

For automated online payment, create pending order/payment records server-side, initiate payment securely, verify signed callbacks/webhooks (and provider status where required), and update records idempotently. A browser redirect alone never proves payment. Never expose service-role/API keys in the browser or store raw card data. Disclose delivery fees before confirmation; use manual delivery quotes when zones/fees vary.

Inventory must handle actual stocked/made-to-order practices, per-variant quantities, availability, adjustments, and low-stock alerts. Confirm stock reservation/deduction rules. Do not hardcode delivery promises, guarantees, certifications, reviews, scarcity, or stock claims unless the business verifies them.

## Media, SEO, and quality

Store product/configurator media in appropriately permissioned storage. Suggested public paths include product galleries/thumbnails, frame-only/dressed configurator assets, category images, homepage/site media; keep private operational documents private. Use descriptive filenames and alt text, responsive modern formats, generated thumbnails, lazy loading below the fold, and reserved dimensions to prevent layout shift. Prioritize the hero and primary product image.

Implement unique metadata, canonical URLs, sitemap/robots rules, Open Graph metadata, product/category URLs, and accurate Product/Breadcrumb structured data. Use only verified price/availability in structured data. Localize copy to Kampala and confirmed delivery areas. Add analytics/error monitoring only after consent/privacy requirements are settled; never send sensitive payment or personal data to analytics.

Plan for keyboard navigation, visible focus, labelled controls, sufficient contrast, descriptive alt text, reduced-motion, clear loading/empty/error/success states, HTTPS, server-side validation, upload restrictions, rate limits for public forms, backups, and tested restoration. Optimize images and client JavaScript for mobile. Test variants/configurator matching, pricing/stock, cart/checkout, payment callbacks, concurrent stock updates, permissions/RLS, quote forms, slow networks, mobile layouts, keyboard use, and reduced motion before launch.

## Delivery roadmap

1. **Visual prototype (now):** migrate the current static prototype to the planned Next.js app if needed; reproduce the two reference screens, responsive homepage, product detail/configurator, sample product cards, and interactive controls. Use coherent sample values. Do not build backend, live payment, or admin features in this phase.
2. **Visual approval and content replacement:** iterate on phone and desktop screenshots until the structure is approved, then replace sample products, prices, images, contact information, and claims with verified HomeFinds content.
3. **Commerce:** add Supabase schema/migrations, catalogue/search/filter, cart, checkout validation, order creation, the manual MoMo payment-reference flow, secure staff verification queue, and approved delivery logic.
4. **Payments and operations:** after merchant approval, integrate a selected payment provider and webhooks; complete secured admin, inventory/order management, and bulk quote follow-up.
5. **QA and launch:** test accessibility/security/performance and full order flows in staging, confirm cPanel/Next.js compatibility, configure GitHub-to-cPanel deployment, production domain/backups/monitoring, and train staff. Do not begin the admin dashboard until the customer storefront has passed visual/responsive QA and the agreed customer order flow is ready for a staging deployment.
6. **Later:** order history, approved WhatsApp/SMS updates, product comparison, saved configurations, business pricing, delivery integrations, and 3D only if justified.

Do not run real customer charges without business approval. Use test credentials and end-to-end test orders in staging first.

## Visual direction

Use `homefinds-inspiration-reference.png` as the primary visual reference. Match the warm bedroom photography, cream surfaces, compact HomeFinds header, dark espresso text, forest-green primary actions, gold/amber secondary actions, rounded image cards, and strong mobile hierarchy. Preserve the reference’s richer product imagery and compact information density. The earlier generated homepage concepts are secondary references only.

## Homepage visual specification

Follow the left-hand phone screen in the reference. Build a normal responsive website rather than reproducing a phone mockup:

1. Header: hamburger/menu, centered Home Finds logo/tagline, search, and cart count. “Shop Beds” opens the category/collection navigation on desktop and mobile.
2. Hero: full-bleed bedroom/bed image with warm dark overlay, left-aligned small category eyebrow, two-line serif headline, short copy, gold “Shop Beds” button, outlined secondary collection action, and subtle carousel dots if a real carousel is built.
3. Benefit strip: four compact icon/value items.
4. Category section: heading plus View All, followed by image-card links for King, Queen, Double, Triple, Kids’ Beds, and Bunk Beds. Use “Kids’ Beds” as the short customer-facing label for children’s beds.
5. Featured beds: compact horizontal product cards with photo, wishlist affordance, name, illustrative UGX price, optional illustrative rating, and clear Add to Cart action.
6. Business banner: warm photo/banner treatment for hostels, hotels, and institutions with a quote/contact action.
7. Fixed mobile bottom navigation: Home, Shop, Wishlist, Account. Keep it compact and reserve page padding beneath it.

Use the reference’s typography contrast (editorial serif display headings with clean sans-serif interface text), image proportions, corner radii, spacing, and approximate content density. On desktop, lay the same sections out responsively without losing the visual identity.

## Product detail and configurator visual specification

Build a dedicated product detail screen modeled on the right-hand phone screen of the reference. The product image/comparison should dominate the top. Put a back action and a pill-shaped Frame Only/Fully Dressed control over the image; add a draggable vertical comparison divider when feasible. Follow with the short interactive-preview explainer, a horizontal row of five finish swatches, bold product name, sample UGX price and rating, wishlist action, and side-by-side Add to Cart / Chat on WhatsApp buttons. Continue with a three-item benefits strip, horizontal related-bed cards, and a compact review/testimonial card. Include the same fixed mobile bottom navigation as the homepage.

For desktop, use the same product hierarchy in a wider product-detail layout with the preview and purchase controls side by side. Do not place this entire product builder as a large lower section of the homepage.

### Switch categories and beds within the product page

The product detail/configurator screen itself must let customers change category and bed without navigating away to a separate shop/category page. This is an inline selector within the existing product page, not another route.

- Follow `assets/category-switcher-demos/category-switcher-demo-1.png`: place one full-width selector strip directly below the product breadcrumb/back link and above the product preview/purchase layout. Show category chips first, then a clearly labeled model area beneath them.
- The current prototype categories are **King Beds, Queen Beds, Double Beds, Triple Beds, Kids’ Beds, and Bunk Beds**. Do not show Single Beds unless Home Finds changes this list.
- Under the selected category’s model heading (for example, “King Bed Models”), show a **Choose your design** dropdown. Opening it reveals a visual design picker with image cards for the designs available in that category; each card includes a bed image and design name. The collapsed control shows the currently selected design and its thumbnail.
- A category can contain one or many designs. Populate the design picker from the selected category’s model list; do not assume every category has exactly one design or that all categories share the same designs.
- Limit the initial sample configurator to the three generated bed designs documented in `assets/bed-catalog-variants/README.md`: Classic Spindle, Square Grid, and Arched Rail. The image files are also mirrored in `public/assets/bed-catalog-variants/` for the prototype.
- Provide at least two category-image concepts for each of the six categories. The three configurator design sets are design options, not category imagery. Save the thumbnails under `plan/assets/category-media/` and mirror them under `public/assets/category-media/`; Kids’ Beds should clearly show child-sized beds, Bunk Beds a two-level bunk, and Triple Beds include both a three-tier bunk concept and a triple-sleeper layout. Treat Triple Beds imagery as a visual placeholder until the business confirms exactly what “Triple” means.
- Use `assets/ui-feedback/desktop-design-picker-open.png` and `assets/ui-feedback/mobile-design-picker-closed.png` as references for current layout issues. The open picker must stay aligned with its trigger and selector; text should wrap naturally without stretched words, distorted spacing, or oversized cards. The closed mobile layout must remain balanced and readable too.
- Review both closed and open picker states, category changes, design selection, and narrow/rotated viewports. Polish spacing, image sizing, control alignment, and text wrapping across all these states; do not limit QA to the open dropdown.
- Show the complete bed in category cards, model picker cards, product cards, and configurator previews. Keep the headboard, footboard, and legs in frame.
- Selecting a category updates the model heading and the designs available in its dropdown; selecting a design updates the current product page in place.
- Selecting a model updates the current product preview, design/finish choices, title, size choices, sample price, and other sample details in place. Keep the customer on the product detail/configurator screen.
- Preserve the selected category while choosing among its designs. Provide clear selected states for the category and current design. Close the dropdown after a selection and keep the user on this product page.
- Make the design picker touch-friendly and responsive. Its open panel should show the image cards without causing document-level horizontal overflow; use a compact grid or vertically scrollable list on small screens.
- The header “Shop Beds” and “Back to beds” may remain as secondary navigation, but they must not be the only way to change category or model.
- Do not send the customer to `/shop` or open a separate page when they select a category/model from these inline controls. Remove the intermediate `/shop` gateway page from the current prototype and update links so categories/products go directly to a product detail page.

### Later: staff dashboard and adding more bed designs

- Keep the client-side prototype focused on the three sample designs above and the customer shopping flow. Defer the staff dashboard and staff upload UI to a later phase.
- When the staff dashboard is built, provide an **Add bed / Upload images** action so staff can add further designs without code changes. The catalogue data model should support multiple designs in one category.
- The upload flow should collect the bed name/model, category, available sizes and prices, finish options, and a matched **frame-only** and **fully dressed** image for each available finish. Do not accept one combined split-screen image as a substitute for the two independent views.
- Validate file type and size, show previews, require useful alt text, and let staff replace/reorder images. Newly saved designs should become selectable in the existing inline model strip.
- Keep frame-only and dressed images as separate image paths. A finish selection must select the corresponding real finish image; do not simulate a finish by tinting the room or background.
- The generated sample images are concept assets. Confirm each design and finish against actual Home Finds products before representing it as a live purchasable item.

### Bed sizes and sample prices

Use these customer-provided size/price options in the current prototype, with the selected size updating the displayed price and cart line item:

| Bed size | Sample price |
| --- | ---: |
| 4×6 | UGX 600,000 |
| 5×6 | UGX 700,000 |
| 6×6 | UGX 800,000 |

Show the delivery estimate as **2–4 days**. Do not add a delivery zone, fee, or broader coverage claim unless HomeFinds provides it.

Do not substitute category names such as King, Queen, Double, Triple, Kids’ Beds, or Bunk Beds for these measurement buttons. Display the measurements as written; do not add a unit unless HomeFinds confirms it. Keep the price mapping together in the sample product data so it is easy to edit. Apply these options to bed models where they are offered; confirm any model-specific exclusions before production.

- Selecting a different bed model updates both views to that model.
- The bare-frame view never includes a mattress or bedding.
- The dressed view keeps its mattress, sheets, pillows, duvet, and throws when the frame changes.
- Selecting a frame colour updates both frames. Bedding remains consistent and may adjust only its accent colour to complement the frame.
- Add to cart and WhatsApp ordering should both be easy to find if both channels are supported.
- Show size choices, availability, delivery estimate, and what is included before checkout.
- Keep transitions restrained and support reduced-motion preferences.
- On mobile, keep the two views easy to compare with a toggle or slider while retaining visible price and ordering actions.
- Use consistent product photography or renders for every supported model, size, and colour. The generated concepts are visual references, not final product imagery.

## Configurator behavior

- Selecting a different bed model updates both views to the same selected model.
- The bare-frame view never includes a mattress or bedding.
- The dressed view retains the chosen bedding style when the frame changes; optional accents may coordinate with the frame without replacing the bedding preset.
- Selecting a frame finish updates the preview and selected option. For the visual prototype, tasteful sample colour treatments are acceptable when dedicated finish imagery is unavailable.
- For the current color-selector issue, **do not simulate frame finishes with CSS filters, overlays, or background-colour changes**. Map each of the three bed designs and five finishes to its corresponding generated paired image in `public/assets/bed-color-variants/`; changing a swatch must replace the bed image itself.
- Keep transitions restrained, make controls responsive, and support reduced-motion preferences.
- Use sample product data and images for the visual phase; replace with approved photography and valid purchasable variants after visual approval.

## Ecommerce essentials

- For the visual prototype, use plausible illustrative content to reproduce the reference. Keep prices, ratings, delivery details, and product copy in a centralized sample-data file so they can be replaced later; do not let the lack of verified content block layout work.
- Before a production order is placed, make real prices and included items clear. All illustrative values and claims must be replaced with verified business information before launch.
- Provide dimensions, frame material and finish, size options, mattress inclusion, and care information.
- Make WhatsApp ordering easy; the reference also shows a cart flow. Confirm whether cart and online checkout should be part of the first release.
- Keep delivery, payment, returns, warranty, and stock information accurate and visible.
- Design mobile-first with readable contrast, keyboard-friendly controls, descriptive product images, and touch-sized buttons.
- Keep motion purposeful and lightweight.

## Responsive layout and overflow acceptance

- Prevent unintended horizontal scrolling of the document at every supported viewport and on both homepage and product routes.
- Check at minimum 320, 360, 375, 390, 430, 768, 1024, 1280, and 1440 CSS pixels wide.
- At each width, verify `document.documentElement.scrollWidth <= window.innerWidth`. Intentional carousel scrolling must stay contained and must not widen the page.
- Use fluid containers, `min-width: 0` on grid/flex children, responsive image sizing, wrapping for long labels/buttons, and breakpoint-specific layouts. Avoid fixed widths that exceed the viewport.
- Ensure the product comparison, colour swatches, size choices, checkout panels, headers, and fixed bottom navigation fit without clipping or pushing the page sideways.
- Check portrait and landscape phone layouts plus tablet and desktop widths. Save screenshots for representative narrow phone, standard phone, tablet, and desktop sizes in `qa/`.

## Decisions to confirm before commerce launch (not blockers for the visual prototype)

- Product catalog, prices, dimensions, available sizes, and colours.
- Which products include a mattress or bedding.
- Delivery areas and fees (the supplied estimate is 2–4 days).
- Payment methods, returns, warranty, and stock practices.
- HomeFinds MTN MoMo receiving number, support contact for payment issues, and staff process/authority for verifying or rejecting submitted transaction IDs.
- Whether the first release needs cart and online checkout or WhatsApp ordering only.
- Approved logo, brand colours, and customer contact details.

## Visual references

- `homefinds-inspiration-reference.png` — user-provided mobile homepage and product configurator reference; primary direction.
- `homepage-concept-1.png` — warm, clear storefront with side-by-side frame and styled-bed views.
- `homepage-concept-2.png` — editorial bed builder with colour selection.
- `homepage-concept-3.png` — practical shopping paths for home and business buyers.

## Sample implementation assets

See `assets/README.md` for the generated product image set: the original three frame-only/dressed pairs, one wide homepage hero, and 15 finish-specific comparison plates (three bed designs × five frame colours; each plate contains both frame-only and dressed views). Matching website-ready copies are in `public/assets/bed-color-variants/`. These are prototype placeholders, not verified HomeFinds inventory photography or specifications.
