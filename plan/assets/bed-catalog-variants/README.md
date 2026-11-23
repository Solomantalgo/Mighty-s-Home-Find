# Home Finds bed image samples

This folder contains 30 generated concept images: three bed designs × five frame finishes × two separate preview states. The same WebP files are mirrored under `public/assets/bed-catalog-variants/` so the storefront can load them directly.

## Designs

- `classic-spindle` — classic vertical-bar headboard and footboard.
- `square-grid` — geometric square-grid headboard and footboard.
- `arched-rail` — softly arched vertical-rail headboard and footboard.

## Finishes

`matte-black`, `white`, `graphite-grey`, `antique-bronze`, `deep-navy`.

## Filename pattern

`<design>-<finish>-<state>.webp`

- `<state>` is `frame` for the bare metal frame with no mattress or bedding.
- `<state>` is `dressed` for the same design and finish with mattress and bedding.

Example: `square-grid-deep-navy-frame.webp` and `square-grid-deep-navy-dressed.webp` are the two matching views for that option.

Use the separate image files for the Frame Only/Fully Dressed toggle or comparison slider. Match the same design and finish in both states. Finish changes must switch image assets; do not recolour the background or apply a CSS tint to fake a metal finish.

These are generated visual samples for prototype structure. Verify each design/finish against actual inventory before presenting it as a purchasable Home Finds product.

For the planned staff workflow to add more designs, see `plan/HOMEFINDS-PLAN.md` under “Adding more bed designs.”
