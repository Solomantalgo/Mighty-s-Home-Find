"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { saveCategoryAction, uploadConfiguratorImageAction, uploadProductImageAction, setPrimaryImageAction, reorderProductImageAction, removeProductImageAction, deleteProductAction, archiveProductAction, removeStaffAction, setProductPublicationAction, removeImageSetAction } from "@/app/admin/actions";

type State = { error?: string; success?: boolean };
const categoryAction = async (_previous: State, formData: FormData) => saveCategoryAction(formData);
const productImageAction = async (_previous: State, formData: FormData) => uploadProductImageAction(formData);
const configuratorImageAction = async (_previous: State, formData: FormData) => uploadConfiguratorImageAction(formData);
const primaryImageAction = async (_previous: State, formData: FormData) => setPrimaryImageAction(formData);
const reorderImageAction = async (_previous: State, formData: FormData) => reorderProductImageAction(formData);
const removeImageAction = async (_previous: State, formData: FormData) => removeProductImageAction(formData);
const deleteAction = async (_previous: State, formData: FormData) => deleteProductAction(formData);
const archiveAction = async (_previous: State, formData: FormData) => archiveProductAction(formData);

function Feedback({ state }: { state: State }) {
  return state.error ? <p className="admin-form-error" role="alert">{state.error}</p> : state.success ? <p className="admin-form-success" role="status">Saved successfully.</p> : null;
}

export function AdminSubmitButton({ children, className }: { children: React.ReactNode; className: string }) {
  const { pending } = useFormStatus();
  return <button className={className} disabled={pending} aria-disabled={pending}>{pending ? "Working..." : children}</button>;
}

export function RemoveStaffForm({ userId, email }: { userId: string; email: string }) {
  return <form className="admin-staff-remove" action={removeStaffAction} onSubmit={(event) => { if (!window.confirm(`Permanently remove ${email} from staff access? Their audit history will remain.`)) event.preventDefault(); }}>
    <input type="hidden" name="user_id" value={userId}/><AdminSubmitButton className="admin-mini-action admin-danger">Remove</AdminSubmitButton>
  </form>;
}

export function PublicationActions({ productId, status }: { productId: string; status: string }) {
  const [state, action, pending] = useActionState<State, FormData>(async (_previous, formData) => setProductPublicationAction(formData), {});
  return <form action={action} className="admin-publication-actions"><input type="hidden" name="id" value={productId}/>
    {status !== "published" && <button className="admin-primary" name="intent" value="publish" disabled={pending}>{pending ? "Working..." : "Publish"}</button>}
    {status === "published" && <button className="admin-secondary" name="intent" value="unpublish" disabled={pending}>{pending ? "Working..." : "Unpublish"}</button>}
    {status !== "archived" && <button className="admin-secondary" name="intent" value="archive" disabled={pending} onClick={(event) => { if (!window.confirm("Archive this listing? It will disappear from the storefront.")) event.preventDefault(); }}>{pending ? "Working..." : "Archive"}</button>}
    <Feedback state={state}/>
  </form>;
}

export function CategoryForm({ category }: { category?: { id: string; name: string; slug: string; description: string | null; display_order: number; is_published: boolean } }) {
  const [state, action, pending] = useActionState<State, FormData>(categoryAction, {});
  return <form action={action} className="admin-form-card"><input type="hidden" name="id" value={category?.id ?? ""}/><div className="admin-form-grid"><label>Category name<input name="name" required minLength={2} maxLength={100} defaultValue={category?.name ?? ""} placeholder="e.g. Queen beds"/></label><label>URL slug<input name="slug" maxLength={100} defaultValue={category?.slug ?? ""} placeholder="queen-beds (auto from name if blank)"/></label><label>Display order<input name="display_order" type="number" min={0} max={9999} defaultValue={category?.display_order ?? 0}/></label><label className="admin-check"><input type="checkbox" name="is_published" defaultChecked={category?.is_published ?? false}/> Visible on the storefront</label></div><label>Description<textarea name="description" maxLength={1000} defaultValue={category?.description ?? ""} rows={3}/></label><Feedback state={state}/><button className="admin-primary" disabled={pending}>{pending ? "Saving..." : category ? "Save category" : "Add category"}</button></form>;
}

export function ProductImageUpload({ productId, primary = false, replacing = false }: { productId: string; primary?: boolean; replacing?: boolean }) {
  const [state, action, pending] = useActionState<State, FormData>(productImageAction, {});
  return <form action={action} className="admin-upload-form"><input type="hidden" name="product_id" value={productId}/><input type="hidden" name="image_role" value={primary ? "primary" : "gallery"}/><label>{primary ? "Primary listing photo" : "Additional product photo"}<input required type="file" name="file" accept="image/jpeg,image/png,image/webp"/></label><button className="admin-secondary" disabled={pending}>{pending ? "Uploading..." : replacing ? "Replace primary photo" : "Upload image"}</button><Feedback state={state}/></form>;
}

export function RemoveImageSetForm({ productId, variantId, firstSet = false }: { productId: string; variantId: string; firstSet?: boolean }) {
  const [state, action, pending] = useActionState<State, FormData>(async (_old, data) => removeImageSetAction(data), {});
  return <form action={action} onSubmit={(event) => { if (!window.confirm(firstSet ? "Discard this first design and colour set, its frame-only and dressed images, and its primary listing photo?" : "Discard this design and colour set, including its frame-only and dressed images?")) event.preventDefault(); }}><input type="hidden" name="product_id" value={productId}/><input type="hidden" name="variant_id" value={variantId}/><button className="admin-mini-action admin-danger" disabled={pending}>{pending ? "Discarding..." : "Discard set"}</button><Feedback state={state}/></form>;
}

export function DeleteProductForm({ productId, status }: { productId: string; status: string }) {
  const [state, action, pending] = useActionState<State, FormData>(deleteAction, {});
  if (status === "published") return <p className="admin-muted">Archive this published product before deleting it.</p>;
  return <form action={action} onSubmit={(event) => { if (!window.confirm("Permanently delete this product, its sale options and its uploaded images? This cannot be undone.")) event.preventDefault(); }}><input type="hidden" name="id" value={productId}/><button className="admin-danger" disabled={pending}>{pending ? "Deleting..." : "Delete product"}</button><Feedback state={state}/></form>;
}

export function ProductListActions({ productId, status }: { productId: string; status: string }) {
  const [deleteState, deleteProduct, deletePending] = useActionState<State, FormData>(deleteAction, {});
  const [archiveState, archive, archivePending] = useActionState<State, FormData>(archiveAction, {});
  return <div className="admin-row-actions">{status === "published" ? <form action={archive} onSubmit={(event) => { if (!window.confirm("Archive this listing? It will no longer appear to shoppers.")) event.preventDefault(); }}><input type="hidden" name="id" value={productId}/><button className="admin-mini-action" disabled={archivePending}>{archivePending ? "Archiving..." : "Archive"}</button><Feedback state={archiveState}/></form> : <form action={deleteProduct} onSubmit={(event) => { if (!window.confirm("Permanently delete this draft or archived product and its sale options? This cannot be undone.")) event.preventDefault(); }}><input type="hidden" name="id" value={productId}/><button className="admin-mini-action admin-danger" disabled={deletePending}>{deletePending ? "Deleting..." : "Delete"}</button><Feedback state={deleteState}/></form>}</div>;
}

export function ProductImageControls({ productId, imageId, isPrimary }: { productId: string; imageId: string; isPrimary: boolean }) {
  const [primaryState, primaryAction, primaryPending] = useActionState<State, FormData>(primaryImageAction, {});
  const [upState, upAction, upPending] = useActionState<State, FormData>(reorderImageAction, {});
  const [downState, downAction, downPending] = useActionState<State, FormData>(reorderImageAction, {});
  const [removeState, removeAction, removePending] = useActionState<State, FormData>(removeImageAction, {});
  return <div className="admin-image-controls">{!isPrimary && <form action={primaryAction}><input type="hidden" name="product_id" value={productId}/><input type="hidden" name="image_id" value={imageId}/><button className="admin-mini-action" disabled={primaryPending}>Set primary</button><Feedback state={primaryState}/></form>}<form action={upAction}><input type="hidden" name="product_id" value={productId}/><input type="hidden" name="image_id" value={imageId}/><input type="hidden" name="direction" value="up"/><button className="admin-mini-action" aria-label="Move image earlier" disabled={upPending}>Up</button><Feedback state={upState}/></form><form action={downAction}><input type="hidden" name="product_id" value={productId}/><input type="hidden" name="image_id" value={imageId}/><input type="hidden" name="direction" value="down"/><button className="admin-mini-action" aria-label="Move image later" disabled={downPending}>Down</button><Feedback state={downState}/></form><form action={removeAction} onSubmit={(e)=>{if(!window.confirm("Remove this image from the gallery?"))e.preventDefault()}}><input type="hidden" name="product_id" value={productId}/><input type="hidden" name="image_id" value={imageId}/><button className="admin-mini-action admin-danger" disabled={removePending}>Remove</button><Feedback state={removeState}/></form></div>;
}

export function ConfiguratorImageUpload({ variantId, view, current }: { variantId: string; view: "frame" | "dressed"; current?: { image_url: string; alt_text: string; match_confirmed?: boolean } }) {
  const [state, action, pending] = useActionState<State, FormData>(configuratorImageAction, {});
  const [preview, setPreview] = useState<string | null>(null);
  return <form action={action} className="admin-config-image"><input type="hidden" name="variant_id" value={variantId}/><input type="hidden" name="view" value={view}/><strong>{view === "frame" ? "Frame only" : "Dressed"}</strong>{preview || current?.image_url ? <Image unoptimized width={640} height={400} src={preview ?? current?.image_url ?? ""} alt={preview ? "Selected image preview" : current?.alt_text ?? ""}/> : <div className="admin-image-missing">Image missing</div>}{current && !current.match_confirmed && <span className="admin-image-missing-flag">Needs variant match check</span>}<input required type="file" name="file" accept="image/jpeg,image/png,image/webp" onChange={(e)=>{const file=e.target.files?.[0];setPreview(file?URL.createObjectURL(file):null)}}/><label className="admin-match-confirm"><input required type="checkbox" name="match_confirmed"/> I checked this shows {view === "frame" ? "the correct frame-only design and colour" : "the matching dressed design and colour"}.</label><button className="admin-secondary" disabled={pending}>{pending ? "Uploading..." : current ? "Replace image" : "Upload image"}</button><Feedback state={state}/></form>;
}
