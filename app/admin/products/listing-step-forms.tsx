"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addImageSetAction, saveListingDetailsAction } from "@/app/admin/actions";
import type { CatalogueOptions } from "@/lib/catalogue-options";

type State = { error?: string; success?: boolean };
type ProductDetails = { id: string; category_id: string; model_name: string | null; name: string; description: string | null; material: string | null; care: string | null; included: string | null; delivery_note: string | null };

function choices(values: string[], selected?: string | null) {
  return selected && !values.includes(selected) ? [selected, ...values] : values;
}

export function ListingDetailsForm({ categories, options, product, primaryColour }: { categories: { id: string; name: string }[]; options: CatalogueOptions; product?: ProductDetails; primaryColour?: string | null }) {
  const [state, action, pending] = useActionState<State, FormData>(async (_old, data) => saveListingDetailsAction(data), {});
  const design = product?.model_name || product?.name;
  return <form action={action} className="admin-editor-form"><input type="hidden" name="id" value={product?.id ?? ""}/>
    <section className="admin-form-card"><div className="admin-form-section-head"><span>01</span><div><h2>Listing details</h2><p>Choose one design and colour for the first image set. Sizes and prices are shared across the shop.</p></div></div>
      <div className="admin-form-grid">
        <label>Category<select name="category_id" required defaultValue={product?.category_id ?? ""}><option value="" disabled>Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label>Frame design<select name="design" required defaultValue={design ?? ""}><option value="" disabled>Select design</option>{choices(options.designs, design).map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
        <label>Colour / finish<select name="colour" required defaultValue={primaryColour ?? ""}><option value="" disabled>Select colour</option>{choices(options.colours, primaryColour).map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
        <label className="admin-span-all">Product description<textarea name="description" maxLength={4000} rows={4} defaultValue={product?.description ?? ""} placeholder="Describe the bed for shoppers"/></label>
        <label>What is included<input name="included" maxLength={600} defaultValue={product?.included ?? ""} placeholder="e.g. Bed frame and fittings"/></label>
        <label>Material<input name="material" maxLength={400} defaultValue={product?.material ?? ""} placeholder="e.g. Powder-coated steel"/></label>
        <label>Care instructions<input name="care" maxLength={600} defaultValue={product?.care ?? ""} placeholder="How to keep the bed in good condition"/></label>
        <label>Delivery information<input name="delivery_note" maxLength={240} defaultValue={product?.delivery_note ?? ""} placeholder="Delivery details shown to shoppers"/></label>
      </div>
    </section>{state.error && <p className="admin-form-error" role="alert">{state.error}</p>}<div className="admin-form-actions admin-listing-actions"><Link className="admin-secondary admin-cancel-link" href="/admin/products">Cancel · Back to products</Link><button className="admin-primary" disabled={pending}>{pending ? "Saving..." : "Save and continue to images"}</button></div>
  </form>;
}

export function AddImageSetForm({ productId, options }: { productId: string; options: CatalogueOptions }) {
  const [state, action, pending] = useActionState<State, FormData>(async (_old, data) => addImageSetAction(data), {});
  return <form action={action} className="admin-form-card"><input type="hidden" name="product_id" value={productId}/><div className="admin-form-section-head"><span>+</span><div><h2>Add another image set</h2><p>Choose a different design or colour, then upload its matching frame-only and dressed images.</p></div></div>
    <div className="admin-form-grid"><label>Frame design<select name="design" required defaultValue=""><option value="" disabled>Select design</option>{options.designs.map((name) => <option key={name}>{name}</option>)}</select></label><label>Colour / finish<select name="colour" required defaultValue=""><option value="" disabled>Select colour</option>{options.colours.map((name) => <option key={name}>{name}</option>)}</select></label></div>
    {state.error && <p className="admin-form-error" role="alert">{state.error}</p>}<button className="admin-secondary" disabled={pending}>{pending ? "Adding..." : "Add image set"}</button>
  </form>;
}
