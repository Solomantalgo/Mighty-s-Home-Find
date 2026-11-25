"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireOwner, createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { removeMediaFile, saveMediaImage } from "@/lib/media-store";
import { getCatalogueOptions } from "@/lib/catalogue-options";

const text = (form: FormData, key: string, max = 2000) => {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
};
const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);

export async function saveCatalogueOptionsAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) return { error: "Not authorised." };
  const raw = text(formData, "sizes", 8000);
  let sizes: Array<{ id: string; label: string; price: number }>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length || parsed.length > 20) throw new Error();
    sizes = parsed.map((row) => {
      if (!row || typeof row !== "object") throw new Error();
      const item = row as Record<string, unknown>;
      const id = typeof item.id === "string" ? slugify(item.id) : "";
      const label = typeof item.label === "string" ? item.label.trim().slice(0, 40) : "";
      const price = Number(item.price);
      if (!id || !label || !Number.isSafeInteger(price) || price < 1 || price > 2_000_000_000) throw new Error();
      return { id, label, price };
    });
    if (new Set(sizes.map((size) => size.id)).size !== sizes.length) throw new Error();
  } catch { return { error: "Enter each bed size once with a valid whole-number UGX price." }; }
  const parseNames = (key: string) => text(formData, key, 5000).split("\n").map((name) => name.trim()).filter(Boolean);
  const designs = parseNames("designs");
  const colours = parseNames("colours");
  if (!designs.length || !colours.length || designs.length > 40 || colours.length > 40 || [...designs, ...colours].some((name) => name.length > 120)) return { error: "Add at least one design and colour; keep each name under 120 characters." };
  if (new Set(designs.map((name) => name.toLowerCase())).size !== designs.length || new Set(colours.map((name) => name.toLowerCase())).size !== colours.length) return { error: "Remove duplicate design or colour names." };
  const { error } = await auth.supabase.from("catalogue_options").update({ sizes, designs, colours, updated_at: new Date().toISOString() }).eq("id", 1);
  if (error) return { error: "Could not save shared options. Check that the catalogue options migration has been applied." };
  revalidatePath("/"); revalidatePath("/admin/options"); revalidatePath("/admin/products");
  return { success: true };
}

export async function signInAction(formData: FormData) {
  const email = text(formData, "email", 254).toLowerCase();
  const password = formData.get("password");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== "string" || password.length < 1 || password.length > 256) {
    redirect("/admin/login?error=Enter%20a%20valid%20email%20and%20password");
  }
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login?error=Admin%20sign-in%20is%20not%20configured");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) redirect("/admin/login?error=Sign-in%20failed%20or%20account%20is%20not%20provisioned");
  const { data: staff } = await supabase.from("staff_profiles").select("user_id,is_active,invitation_status").eq("user_id", data.user.id).maybeSingle();
  if (!staff || !staff.is_active || staff.invitation_status !== "accepted") {
    await supabase.auth.signOut();
    redirect("/admin/login?error=Sign-in%20failed%20or%20account%20is%20not%20provisioned");
  }
  redirect("/admin");
}

function staffRedirect(message: string, kind: "success" | "error"): never {
  redirect(`/admin/staff?${kind}=${encodeURIComponent(message)}`);
}

export async function inviteStaffAction(formData: FormData) {
  const auth = await requireOwner();
  if (!auth.supabase || !auth.user) staffRedirect(auth.error ?? "Owner access required.", "error");
  const email = text(formData, "email", 254).toLowerCase();
  const displayName = text(formData, "display_name", 120);
  const role = text(formData, "role", 32);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !displayName || !["owner", "catalogue_admin"].includes(role)) staffRedirect("Enter a valid email, name and allowed staff role.", "error");
  const admin = createSupabaseAdminClient();
  if (!admin) staffRedirect("Staff invitations are not configured. Add SUPABASE_SECRET_KEY to the server runtime environment.", "error");
  const existing = await auth.supabase.from("staff_profiles").select("user_id").ilike("email", email).maybeSingle();
  if (existing.data) staffRedirect("A staff profile already exists for that email. Review its status below.", "error");
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { display_name: displayName },
    redirectTo: `${(process.env.HOMEFINDS_SITE_URL || "https://mightyhomefinds.com").replace(/\/$/, "")}/admin/invite/accept`,
  });
  if (error || !data.user) staffRedirect("Invitation could not be sent. Check Supabase email and redirect settings, then try again.", "error");
  const { error: insertError } = await auth.supabase.from("staff_profiles").insert({ user_id: data.user.id, email, display_name: displayName, role, is_active: true, invitation_status: "pending", invited_at: new Date().toISOString() });
  if (insertError) {
    await admin.auth.admin.deleteUser(data.user.id);
    staffRedirect("The invitation was rolled back because its staff profile could not be saved. Check for a duplicate email and retry.", "error");
  }
  revalidatePath("/admin/staff");
  staffRedirect(`Invitation sent to ${email}.`, "success");
}

export async function revokeStaffInvitationAction(formData: FormData) {
  const auth = await requireOwner();
  const id = text(formData, "user_id", 40);
  if (!auth.supabase || !auth.user || !/^[0-9a-f-]{36}$/i.test(id)) staffRedirect("Owner access required or invalid staff account.", "error");
  const { data: target } = await auth.supabase.from("staff_profiles").select("user_id,email,role,invitation_status,is_active").eq("user_id", id).maybeSingle();
  if (!target || target.invitation_status !== "pending") staffRedirect("Only pending invitations can be revoked.", "error");
  const admin = createSupabaseAdminClient();
  if (!admin) staffRedirect("Staff management is not configured. Add SUPABASE_SECRET_KEY to the server runtime environment.", "error");
  const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: "876000h" });
  if (error) staffRedirect("Could not block this pending account. No staff profile changes were made.", "error");
  const result = await auth.supabase.from("staff_profiles").update({ is_active: false, invitation_status: "revoked" }).eq("user_id", id).eq("invitation_status", "pending");
  if (result.error) staffRedirect("The invitation was blocked but its status could not be updated. Contact the project owner.", "error");
  revalidatePath("/admin/staff");
  staffRedirect(`Invitation for ${target.email} revoked.`, "success");
}

export async function resendStaffInvitationAction(formData: FormData) {
  const auth = await requireOwner();
  const id = text(formData, "user_id", 40);
  if (!auth.supabase || !auth.user || !/^[0-9a-f-]{36}$/i.test(id)) staffRedirect("Owner access required or invalid staff account.", "error");
  const { data: target } = await auth.supabase.from("staff_profiles").select("user_id,email,display_name,role,invitation_status,is_active").eq("user_id", id).maybeSingle();
  if (!target || !["pending", "revoked"].includes(target.invitation_status)) staffRedirect("Only pending or revoked invitations can be resent.", "error");
  const admin = createSupabaseAdminClient();
  if (!admin) staffRedirect("Staff management is not configured. Add SUPABASE_SECRET_KEY to the server runtime environment.", "error");
  if (target.invitation_status === "pending") {
    const { error: revokeError } = await auth.supabase.from("staff_profiles").update({ is_active: false, invitation_status: "revoked" }).eq("user_id", id).eq("invitation_status", "pending");
    if (revokeError) staffRedirect("Could not invalidate the existing invitation. No replacement was sent.", "error");
  }
  const { error: auditError } = await auth.supabase.rpc("record_staff_management_action", { p_action: "staff_invitation_resent", p_entity_id: id, p_before: { email: target.email, role: target.role }, p_after: { email: target.email, role: target.role } });
  if (auditError) staffRedirect("Could not record the resend action. No invitation was changed.", "error");
  const { error: removeError } = await admin.auth.admin.deleteUser(id);
  if (removeError) staffRedirect("Could not rotate the old invitation link. No replacement was sent.", "error");
  const { data, error } = await admin.auth.admin.inviteUserByEmail(target.email, {
    data: { display_name: target.display_name }, redirectTo: `${(process.env.HOMEFINDS_SITE_URL || "https://mightyhomefinds.com").replace(/\/$/, "")}/admin/invite/accept`,
  });
  if (error || !data.user) staffRedirect("The old invitation was invalidated, but a new email could not be sent. Invite this staff member again after checking email settings.", "error");
  const { error: insertError } = await auth.supabase.from("staff_profiles").insert({ user_id: data.user.id, email: target.email, display_name: target.display_name, role: target.role, is_active: true, invitation_status: "pending", invited_at: new Date().toISOString() });
  if (insertError) {
    await admin.auth.admin.deleteUser(data.user.id);
    staffRedirect("The replacement invitation was rolled back because the staff profile could not be saved. Contact the project owner.", "error");
  }
  revalidatePath("/admin/staff");
  staffRedirect(`A fresh invitation was sent to ${target.email}.`, "success");
}

export async function updateStaffAction(formData: FormData) {
  const auth = await requireOwner();
  const id = text(formData, "user_id", 40); const role = text(formData, "role", 32); const active = formData.get("is_active") === "on";
  if (!auth.supabase || !auth.user || !/^[0-9a-f-]{36}$/i.test(id) || !["owner", "catalogue_admin"].includes(role)) staffRedirect("Owner access required or invalid staff details.", "error");
  const { data: target } = await auth.supabase.from("staff_profiles").select("user_id,email,role,is_active,invitation_status").eq("user_id", id).maybeSingle();
  if (!target || target.invitation_status !== "accepted") staffRedirect("Only accepted staff accounts can be edited here.", "error");
  if (id === auth.user.id && (!active || role !== "owner")) {
    const { count } = await auth.supabase.from("staff_profiles").select("user_id", { count: "exact", head: true }).eq("role", "owner").eq("is_active", true).eq("invitation_status", "accepted");
    if ((count ?? 0) <= 1) staffRedirect("You cannot remove your own last active owner access. Add another active owner first.", "error");
  }
  const { error } = await auth.supabase.from("staff_profiles").update({ role, is_active: active }).eq("user_id", id);
  if (error) staffRedirect(error.code === "23514" ? "The last active owner cannot be deactivated or demoted." : "Could not update this staff account.", "error");
  revalidatePath("/admin/staff");
  staffRedirect(`Staff access updated for ${target.email}.`, "success");
}

export async function removeStaffAction(formData: FormData) {
  const auth = await requireOwner();
  const id = text(formData, "user_id", 40);
  if (!auth.supabase || !auth.user) staffRedirect("Owner access required.", "error");
  if (!/^[0-9a-f-]{36}$/i.test(id) || id === auth.user.id) staffRedirect("You cannot remove your own account.", "error");
  const { data: target } = await auth.supabase.from("staff_profiles").select("email,role,is_active,invitation_status").eq("user_id", id).maybeSingle();
  if (!target) staffRedirect("Staff account not found.", "error");
  const admin = createSupabaseAdminClient();
  if (!admin) staffRedirect("Staff management is not configured on the server.", "error");
  const audit = await auth.supabase.rpc("record_staff_removal", { p_user_id: id });
  if (audit.error) staffRedirect("Removal was blocked. Check that another active owner remains.", "error");
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) staffRedirect("The account was not removed. Check Supabase Auth and try again.", "error");
  revalidatePath("/admin/staff");
  staffRedirect(`Removed ${target.email} from staff access.`, "success");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveCategoryAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) return { error: auth.error ?? "Not authorised." };
  const id = text(formData, "id", 40);
  const name = text(formData, "name", 100);
  const description = text(formData, "description", 1000);
  const orderRaw = text(formData, "display_order", 5);
  const display_order = orderRaw ? Number(orderRaw) : 0;
  const is_published = formData.get("is_published") === "on";
  if (name.length < 2 || !Number.isInteger(display_order) || display_order < 0 || display_order > 9999) return { error: "Enter a category name and a valid display order." };
  const slug = slugify(text(formData, "slug", 100) || name);
  if (!slug) return { error: "Enter a valid category name or URL slug." };
  const payload = { name, slug, description: description || null, display_order, is_published };
  const result = id
    ? await auth.supabase.from("categories").update(payload).eq("id", id)
    : await auth.supabase.from("categories").insert(payload);
  if (result.error) return { error: result.error.code === "23505" ? "That category name or URL slug is already in use." : "Could not save the category. Check required fields and try again." };
  revalidatePath("/"); revalidatePath("/admin"); revalidatePath("/admin/categories");
  return { success: true };
}

export async function saveListingDetailsAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) return { error: "Not authorised." };
  const id = text(formData, "id", 40);
  const design = text(formData, "design", 120);
  const colour = text(formData, "colour", 60);
  const category_id = text(formData, "category_id", 40);
  if (design.length < 2 || !colour || !/^[0-9a-f-]{36}$/i.test(category_id)) return { error: "Choose a category, design and colour." };
  const { data: category } = await auth.supabase.from("categories").select("id,slug").eq("id", category_id).maybeSingle();
  if (!category) return { error: "Choose an existing category." };
  const { data: existing } = id ? await auth.supabase.from("products").select("slug,status").eq("id", id).maybeSingle() : { data: null };
  if (id && !existing) return { error: "Listing not found." };
  const { data: primaryVariant } = id ? await auth.supabase.from("variants").select("id,design,colour,size").eq("product_id", id).eq("is_active", true).order("created_at").limit(1).maybeSingle() : { data: null };
  const changingImageSet = !!primaryVariant && (primaryVariant.design !== design || primaryVariant.colour !== colour);
  if (existing?.status === "published" && changingImageSet) return { error: "Unpublish this listing before changing its design or colour." };
  const name = design;
  const slug = existing?.slug ?? slugify(`${category.slug}-${design}`);
  if (!slug) return { error: "Choose a valid design." };
  const payload = {
    name, slug, category_id, model_name: design,
    description: text(formData, "description", 4000) || null,
    included: text(formData, "included", 600) || null,
    material: text(formData, "material", 400) || null,
    care: text(formData, "care", 600) || null,
    delivery_note: text(formData, "delivery_note", 240) || null,
    updated_at: new Date().toISOString(),
  };
  let productId = id;
  if (id) {
    const { error } = await auth.supabase.from("products").update(payload).eq("id", id);
    if (error) return { error: error.code === "23505" ? "That design already has a listing in this category." : "Could not save listing details." };
  } else {
    const { data, error } = await auth.supabase.from("products").insert({ ...payload, status: "draft" }).select("id").single();
    if (error || !data) return { error: error?.code === "23505" ? "That design already has a listing in this category." : "Could not create this listing." };
    productId = data.id;
  }
  if (primaryVariant) {
    if (changingImageSet) {
      const { error } = await auth.supabase.from("variants").update({ design, colour }).eq("id", primaryVariant.id).eq("product_id", productId);
      if (error) return { error: "Listing details saved, but the design and colour could not be updated. Check for a duplicate image set." };
      const { error: assetError } = await auth.supabase.from("configurator_assets").update({ match_confirmed: false }).eq("variant_id", primaryVariant.id);
      if (assetError) return { error: "Listing details saved, but its images could not be flagged for review. Check the image pair before publishing." };
    }
  } else {
    const options = await getCatalogueOptions();
    const { data: inactive } = await auth.supabase.from("variants").select("id").eq("product_id", productId).eq("design", design).eq("colour", colour).eq("size", "standard").eq("is_active", false).maybeSingle();
    const { error } = inactive
      ? await auth.supabase.from("variants").update({ is_active: true }).eq("id", inactive.id)
      : await auth.supabase.from("variants").insert({ product_id: productId, design, colour, size: "standard", sku: `HF-${crypto.randomUUID()}`, price_ugx: options.sizes[0].price, is_active: true });
    if (error) {
      if (!id) await auth.supabase.from("products").delete().eq("id", productId);
      return { error: "Could not create the matching image set. Please try again." };
    }
  }
  revalidatePath("/admin"); revalidatePath("/admin/products"); revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}/images`);
}

export async function addImageSetAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) return { error: "Not authorised." };
  const productId = text(formData, "product_id", 40);
  const design = text(formData, "design", 120);
  const size = "standard";
  const colour = text(formData, "colour", 60);
  if (!/^[0-9a-f-]{36}$/i.test(productId) || !design || !colour) return { error: "Choose a design and colour." };
  const { data: product } = await auth.supabase.from("products").select("id,status").eq("id", productId).maybeSingle();
  if (!product) return { error: "Listing not found." };
  if (product.status === "published") return { error: "Unpublish this listing before changing its image sets." };
  const { data: same } = await auth.supabase.from("variants").select("id,is_active").eq("product_id", productId).eq("design", design).eq("size", size).eq("colour", colour).maybeSingle();
  if (same?.is_active) return { error: "This image combination is already listed below." };
  const shared = await getCatalogueOptions();
  const result = same
    ? await auth.supabase.from("variants").update({ is_active: true }).eq("id", same.id)
    : await auth.supabase.from("variants").insert({ product_id: productId, design, size, colour, sku: `HF-${crypto.randomUUID()}`, price_ugx: shared.sizes[0].price, is_active: true });
  if (result.error) return { error: "Could not add the image combination." };
  revalidatePath(`/admin/products/${productId}/images`);
  redirect(`/admin/products/${productId}/images?added=1`);
}

export async function removeImageSetAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) return { error: "Not authorised." };
  const productId = text(formData, "product_id", 40);
  const variantId = text(formData, "variant_id", 40);
  if (!/^[0-9a-f-]{36}$/i.test(productId) || !/^[0-9a-f-]{36}$/i.test(variantId)) return { error: "Invalid image set." };
  const { data: product } = await auth.supabase.from("products").select("status").eq("id", productId).maybeSingle();
  if (!product || product.status === "published") return { error: "Unpublish this listing before discarding an image set." };
  const { data: variant } = await auth.supabase.from("variants").select("id,design,is_active").eq("id", variantId).eq("product_id", productId).maybeSingle();
  if (!variant?.is_active) return { error: "This image set is no longer in the listing." };
  const [{ data: assets }, { data: active }] = await Promise.all([
    auth.supabase.from("configurator_assets").select("storage_path").eq("variant_id", variantId),
    auth.supabase.from("variants").select("id,design").eq("product_id", productId).eq("is_active", true).order("created_at"),
  ]);
  const firstSet = active?.[0]?.id === variantId;
  const { data: primaryPhoto } = firstSet ? await auth.supabase.from("product_images").select("id,storage_path").eq("product_id", productId).eq("is_primary", true).maybeSingle() : { data: null };
  const { error } = await auth.supabase.from("variants").delete().eq("id", variantId).eq("product_id", productId);
  if (error) return { error: "Could not discard this image set." };
  if (firstSet && active?.[1]) {
    await auth.supabase.from("products").update({ name: active[1].design, model_name: active[1].design }).eq("id", productId);
  }
  if (primaryPhoto) {
    const { error: photoError } = await auth.supabase.from("product_images").delete().eq("id", primaryPhoto.id).eq("product_id", productId);
    if (!photoError) await Promise.allSettled([removeMediaFile(primaryPhoto.storage_path)]);
  }
  await Promise.allSettled((assets ?? []).map((asset) => removeMediaFile(asset.storage_path)));
  revalidatePath("/"); revalidatePath("/admin/products"); revalidatePath(`/admin/products/${productId}`); revalidatePath(`/admin/products/${productId}/images`); revalidatePath(`/admin/products/${productId}/review`);
  return { success: true };
}

async function publicationChecklist(db: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, productId: string) {
  const options = await getCatalogueOptions();
  const [{ data: variants }, { data: gallery }] = await Promise.all([
    db.from("variants").select("id,design,size,colour,sku,price_ugx").eq("product_id", productId).eq("is_active", true),
    db.from("product_images").select("id").eq("product_id", productId).eq("is_primary", true),
  ]);
  const missing: string[] = [];
  if (!variants?.length) missing.push("an image set is missing");
  if (!gallery?.length) missing.push("a primary gallery image is missing");
  if (!options.sizes.length) missing.push("the shared bed size and price list is missing");
  if (variants?.some((v) => !v.design || !v.size || !v.colour || !v.sku || Number(v.price_ugx) < 1)) missing.push("an image set needs its design, size or colour");
  if (variants?.length) {
    const { data: assets } = await db.from("configurator_assets").select("variant_id,view,match_confirmed").in("variant_id", variants.map((v) => v.id)).eq("is_active", true);
    const pairs = new Set((assets ?? []).filter((asset) => asset.match_confirmed).map((asset) => `${asset.variant_id}:${asset.view}`));
    if (variants.some((v) => !pairs.has(`${v.id}:frame`) || !pairs.has(`${v.id}:dressed`))) missing.push("matching frame-only and dressed images are missing for some image sets");
  }
  return missing;
}

export async function setProductPublicationAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) return { error: "Not authorised." };
  const id = text(formData, "id", 40);
  const intent = text(formData, "intent", 12);
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["publish", "unpublish", "archive"].includes(intent)) return { error: "Invalid listing action." };
  const { data: product } = await auth.supabase.from("products").select("id,status").eq("id", id).maybeSingle();
  if (!product) return { error: "Listing not found." };
  if (intent === "publish") {
    const missing = await publicationChecklist(auth.supabase, id);
    if (missing.length) return { error: `Cannot publish: ${missing.join("; ")}.` };
  }
  const nextStatus = intent === "publish" ? "published" : intent === "unpublish" ? "draft" : "archived";
  const { error } = await auth.supabase.from("products").update({ status: nextStatus }).eq("id", id);
  if (error) return { error: error.message.includes("Cannot publish") ? "The database publication checklist failed. Review the variant images." : "Could not change listing status." };
  revalidatePath("/"); revalidatePath("/admin"); revalidatePath("/admin/products"); revalidatePath(`/admin/products/${id}`); revalidatePath(`/admin/products/${id}/review`);
  return { success: true };
}

export async function archiveProductAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) return { error: "Not authorised." };
  const id = text(formData, "id", 40);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid product." };
  const { error } = await auth.supabase.from("products").update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: "Could not archive this product." };
  revalidatePath("/"); revalidatePath("/admin"); revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProductAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) return { error: "Not authorised." };
  const id = text(formData, "id", 40);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid product." };
  const { data: product } = await auth.supabase.from("products").select("id,status").eq("id", id).maybeSingle();
  if (!product) return { error: "Product not found." };
  if (product.status === "published") return { error: "Archive this product before deleting it." };
  const [{ data: gallery }, { data: variants }] = await Promise.all([
    auth.supabase.from("product_images").select("storage_path").eq("product_id", id),
    auth.supabase.from("variants").select("id").eq("product_id", id),
  ]);
  const { data: assets } = variants?.length
    ? await auth.supabase.from("configurator_assets").select("storage_path").in("variant_id", variants.map((v) => v.id))
    : { data: [] };
  const paths = [...(gallery ?? []), ...(assets ?? [])].map((row) => row.storage_path);
  const { error } = await auth.supabase.from("products").delete().eq("id", id);
  if (error) return { error: "Could not delete this product. Check whether it is referenced by retained records." };
  await Promise.all(paths.map(removeMediaFile));
  revalidatePath("/"); revalidatePath("/admin"); revalidatePath("/admin/products");
  redirect("/admin/products?deleted=1");
}

export async function uploadProductImageAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) return { error: "Not authorised." };
  const productId = text(formData, "product_id", 40);
  const requestedAlt = text(formData, "alt_text", 240);
  const primaryUpload = text(formData, "image_role", 10) === "primary";
  const file = formData.get("file");
  if (!/^[0-9a-f-]{36}$/i.test(productId) || !(file instanceof File)) return { error: "Choose an image under 7 MB." };
  const { data: product } = await auth.supabase.from("products").select("id,name").eq("id", productId).maybeSingle();
  if (!product) return { error: "Product not found." };
  const alt_text = requestedAlt || `${product.name} bed photo`;
  let media: Awaited<ReturnType<typeof saveMediaImage>>;
  try { media = await saveMediaImage(file, productId); } catch (error) { return { error: error instanceof Error ? error.message : "Image upload failed." }; }
  if (primaryUpload) {
    const { data: current } = await auth.supabase.from("product_images").select("id,storage_path").eq("product_id", productId).eq("is_primary", true).maybeSingle();
    if (current) {
      const { error } = await auth.supabase.from("product_images").update({ storage_path: media.storagePath, image_url: media.imageUrl, alt_text }).eq("id", current.id).eq("product_id", productId);
      if (error) { await removeMediaFile(media.storagePath); return { error: "Primary image could not be replaced." }; }
      await removeMediaFile(current.storage_path);
      revalidatePath("/"); revalidatePath(`/admin/products/${productId}/images`); revalidatePath(`/admin/products/${productId}/review`);
      return { success: true };
    }
  }
  const { count: priorCount } = await auth.supabase.from("product_images").select("id", { count: "exact", head: true }).eq("product_id", productId);
  const { error } = await auth.supabase.from("product_images").insert({ product_id: productId, storage_path: media.storagePath, image_url: media.imageUrl, alt_text, display_order: priorCount ?? 0, is_primary: primaryUpload || (priorCount ?? 0) === 0 });
  if (error) {
    await removeMediaFile(media.storagePath);
    return { error: "Image metadata could not be saved." };
  }
  revalidatePath("/");
  revalidatePath(`/admin/products/${productId}`); revalidatePath(`/admin/products/${productId}/images`); revalidatePath(`/admin/products/${productId}/review`);
  return { success: true };
}

export async function setPrimaryImageAction(formData: FormData) {
  const auth = await requireAdmin(); if (!auth.supabase || !auth.user) return { error: "Not authorised." };
  const productId = text(formData, "product_id", 40); const imageId = text(formData, "image_id", 40);
  if (!/^[0-9a-f-]{36}$/i.test(productId) || !/^[0-9a-f-]{36}$/i.test(imageId)) return { error: "Invalid image." };
  const { data: target } = await auth.supabase.from("product_images").select("id").eq("id", imageId).eq("product_id", productId).maybeSingle();
  if (!target) return { error: "Image not found in this product." };
  const { error: clearError } = await auth.supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId).eq("is_primary", true);
  if (clearError) return { error: "Could not update the primary image." };
  const { error } = await auth.supabase.from("product_images").update({ is_primary: true }).eq("id", imageId).eq("product_id", productId);
  if (error) return { error: "Could not set the primary image." };
  revalidatePath("/"); revalidatePath(`/admin/products/${productId}`); revalidatePath("/admin/products");
  return { success: true };
}

export async function reorderProductImageAction(formData: FormData) {
  const auth = await requireAdmin(); if (!auth.supabase || !auth.user) return { error: "Not authorised." };
  const productId = text(formData, "product_id", 40); const imageId = text(formData, "image_id", 40); const direction = text(formData, "direction", 5);
  if (!/^[0-9a-f-]{36}$/i.test(productId) || !/^[0-9a-f-]{36}$/i.test(imageId) || !["up", "down"].includes(direction)) return { error: "Invalid image order." };
  const { data: images } = await auth.supabase.from("product_images").select("id,display_order").eq("product_id", productId).order("display_order");
  const index = images?.findIndex((image) => image.id === imageId) ?? -1; const nextIndex = index + (direction === "up" ? -1 : 1);
  if (index < 0 || nextIndex < 0 || nextIndex >= (images?.length ?? 0)) return { error: "Image is already at the end of the gallery." };
  const current = images![index]; const neighbor = images![nextIndex];
  const first = await auth.supabase.from("product_images").update({ display_order: neighbor.display_order }).eq("id", current.id).eq("product_id", productId);
  const second = await auth.supabase.from("product_images").update({ display_order: current.display_order }).eq("id", neighbor.id).eq("product_id", productId);
  if (first.error || second.error) return { error: "Could not reorder the gallery." };
  revalidatePath(`/admin/products/${productId}`); return { success: true };
}

export async function removeProductImageAction(formData: FormData) {
  const auth = await requireAdmin(); if (!auth.supabase || !auth.user) return { error: "Not authorised." };
  const productId = text(formData, "product_id", 40); const imageId = text(formData, "image_id", 40);
  if (!/^[0-9a-f-]{36}$/i.test(productId) || !/^[0-9a-f-]{36}$/i.test(imageId)) return { error: "Invalid image." };
  const { data: image } = await auth.supabase.from("product_images").select("storage_path").eq("id", imageId).eq("product_id", productId).maybeSingle();
  if (!image) return { error: "Image not found." };
  const { error } = await auth.supabase.from("product_images").delete().eq("id", imageId).eq("product_id", productId);
  if (error) return { error: "Could not remove this image." };
  await removeMediaFile(image.storage_path);
  revalidatePath("/");
  revalidatePath(`/admin/products/${productId}`); revalidatePath("/admin/products"); return { success: true };
}

export async function uploadConfiguratorImageAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) return { error: "Not authorised." };
  const variantId = text(formData, "variant_id", 40);
  const view = text(formData, "view", 10);
  const requestedAlt = text(formData, "alt_text", 240);
  const match_confirmed = formData.get("match_confirmed") === "on";
  const file = formData.get("file");
  if (!/^[0-9a-f-]{36}$/i.test(variantId) || !["frame", "dressed"].includes(view) || !(file instanceof File)) return { error: "Choose a JPG, PNG or WebP image under 7 MB." };
  if (!match_confirmed) return { error: "Confirm the image matches the selected design and colour." };
  const { data: variant } = await auth.supabase.from("variants").select("id,product_id,design,colour").eq("id", variantId).maybeSingle();
  if (!variant) return { error: "Variant not found." };
  const alt_text = requestedAlt || `${variant.design} ${variant.colour} bed, ${view === "frame" ? "frame only" : "dressed"}`;
  const { data: oldAsset } = await auth.supabase.from("configurator_assets").select("storage_path").eq("variant_id", variantId).eq("view", view).maybeSingle();
  let media: Awaited<ReturnType<typeof saveMediaImage>>;
  try { media = await saveMediaImage(file, `${variant.product_id}/configurator`); } catch (error) { return { error: error instanceof Error ? error.message : "Image upload failed." }; }
  const { error } = await auth.supabase.from("configurator_assets").upsert({ variant_id: variantId, view, storage_path: media.storagePath, image_url: media.imageUrl, alt_text, match_confirmed, is_active: true }, { onConflict: "variant_id,view" });
  if (error) {
    await removeMediaFile(media.storagePath);
    return { error: "Could not save the image mapping." };
  }
  if (oldAsset?.storage_path && oldAsset.storage_path !== media.storagePath) await removeMediaFile(oldAsset.storage_path);
  revalidatePath("/");
  revalidatePath(`/admin/products/${variant.product_id}`); revalidatePath(`/admin/products/${variant.product_id}/images`); revalidatePath(`/admin/products/${variant.product_id}/review`);
  return { success: true };
}
