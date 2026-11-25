"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addImageSetAction, saveListingDetailsAction } from "@/app/admin/actions";
import type { CatalogueOptions } from "@/lib/catalogue-options";

type State = { error?: string; success?: boolean };

export function ListingDetailsForm({ categories, product }: { categories: { id: string; name: string }[]; product?: { id: string; name: string; category_id: string; model_name: string | null; description: string | null } }) {
  const [state, action, pending] = useActionState<State, FormData>(async (_old, data) => saveListingDetailsAction(data), {});
  return <form action={action} className="admin-editor-form"><input type="hidden" name="id" value={product?.id ?? ""}/>
    <section className="admin-form-card"><div className="admin-form-section-head"><span>01</span><div><h2>Listing details</h2><p>Give the bed a name and category. Sizes and prices are shared across the shop.</p></div></div>
      <div className="admin-form-grid"><label>Product name<input name="name" required minLength={2} maxLength={140} defaultValue={product?.name ?? ""} placeholder="e.g. Classic spindle bed"/></label><label>Category<select name="category_id" required defaultValue={product?.category_id ?? ""}><option value="" disabled>Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Design / model reference<input name="model_name" maxLength={120} defaultValue={product?.model_name ?? ""} placeholder="Optional"/></label><label className="admin-span-all">Product description<textarea name="description" maxLength={4000} rows={5} defaultValue={product?.description ?? ""} placeholder="Tell shoppers what makes this bed useful"/></label></div>
    </section>{state.error && <p className="admin-form-error" role="alert">{state.error}</p>}<div className="admin-form-actions admin-listing-actions"><Link className="admin-secondary admin-cancel-link" href="/admin/products">Cancel · Back to products</Link><button className="admin-primary" disabled={pending}>{pending ? "Saving..." : "Save and continue to images"}</button></div>
  </form>;
}

export function AddImageSetForm({ productId, options }: { productId: string; options: CatalogueOptions }) {
  const [state, action, pending] = useActionState<State, FormData>(async (_old, data) => addImageSetAction(data), {});
  return <form action={action} className="admin-form-card"><input type="hidden" name="product_id" value={productId}/><div className="admin-form-section-head"><span>02</span><div><h2>Add a matched image set</h2><p>Choose the frame design and colour. Then upload a frame-only and dressed view below.</p></div></div>
    <div className="admin-form-grid"><label>Frame design<select name="design" required defaultValue=""><option value="" disabled>Select design</option>{options.designs.map((name) => <option key={name}>{name}</option>)}</select></label><label>Colour / finish<select name="colour" required defaultValue=""><option value="" disabled>Select colour</option>{options.colours.map((name) => <option key={name}>{name}</option>)}</select></label></div>
    {state.error && <p className="admin-form-error" role="alert">{state.error}</p>}<button className="admin-secondary" disabled={pending}>{pending ? "Adding..." : "Add image set"}</button>
  </form>;
}
