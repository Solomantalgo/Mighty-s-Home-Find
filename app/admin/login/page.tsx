import Link from "next/link";
import Image from "next/image";
import { SignInForm } from "@/app/admin/login/sign-in-form";
import { signInAction } from "@/app/admin/actions";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  return <main className="admin-login-page"><section className="admin-login-card"><Link className="admin-login-logo" href="/" aria-label="Mighty’s Home Finds storefront"><Image src="/assets/brand/mightys-home-finds-logo.png" alt="Mighty’s Home Finds — Home and Living Essentials" width={2172} height={724} priority/></Link><span className="admin-login-label">CATALOGUE ADMIN</span><h1>Welcome back</h1><p>Sign in with your authorised staff account.</p>{!configured && <div className="admin-alert">Admin sign-in needs Supabase project settings. Add the URL and anon key to the server environment.</div>}{error && <div className="admin-alert" role="alert">{error}</div>}<SignInForm action={signInAction} configured={configured}/><Link className="admin-back" href="/">← Back to the shop</Link></section></main>;
}
