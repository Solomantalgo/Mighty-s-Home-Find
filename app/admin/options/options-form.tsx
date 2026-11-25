"use client";

import { useActionState, useState } from "react";
import { saveCatalogueOptionsAction } from "@/app/admin/actions";
import type { CatalogueOptions, SharedSize } from "@/lib/catalogue-options";

type State = { error?: string; success?: boolean };

export function OptionsForm({ options }: { options: CatalogueOptions }) {
  const [sizes, setSizes] = useState<SharedSize[]>(options.sizes);
  const [state, action, pending] = useActionState<State, FormData>(async (_old, data) => saveCatalogueOptionsAction(data), {});
  const setSize = (index: number, key: keyof SharedSize, value: string) => setSizes((current) => current.map((size, i) => i === index ? { ...size, [key]: key === "price" ? Number(value) : value } : size));
  return <form action={action} className="admin-options-form">
    <input type="hidden" name="sizes" value={JSON.stringify(sizes)}/>
    <section className="admin-form-card"><h2>Bed sizes and prices</h2><p>One price list applies to every bed. These sizes appear at checkout.</p>
      <div className="admin-option-grid">{sizes.map((size, i) => <div className="admin-option-row" key={i}>
        <label>Size code<input required value={size.id} onChange={(e) => setSize(i, "id", e.target.value)} placeholder="e.g. 4x6"/></label>
        <label>Display name<input required value={size.label} onChange={(e) => setSize(i, "label", e.target.value)} placeholder="e.g. 4×6"/></label>
        <label>Price (UGX)<input required type="number" min={1} step={1} value={size.price || ""} onChange={(e) => setSize(i, "price", e.target.value)}/></label>
        <button type="button" className="admin-mini-action admin-danger" disabled={sizes.length === 1} onClick={() => setSizes((current) => current.filter((_, j) => i !== j))}>Remove</button>
      </div>)}</div><button type="button" className="admin-secondary" onClick={() => setSizes((current) => [...current, { id: "", label: "", price: 0 }])}>Add size</button>
    </section>
    <section className="admin-form-card admin-form-grid"><label>Frame designs<span className="admin-muted">One name per line. Staff select these when matching frame images.</span><textarea name="designs" rows={7} defaultValue={options.designs.join("\n")}/></label><label>Colours / finishes<span className="admin-muted">One name per line.</span><textarea name="colours" rows={7} defaultValue={options.colours.join("\n")}/></label></section>
    {state.error && <p className="admin-form-error" role="alert">{state.error}</p>}{state.success && <p className="admin-form-success" role="status">Shared catalogue options saved.</p>}
    <button className="admin-primary" disabled={pending}>{pending ? "Saving..." : "Save shared options"}</button>
  </form>;
}
