# cPanel deployment

GitHub Actions builds Home Finds on every push to `main` with Node.js `22.23.5` and `next build --webpack`. It publishes the production runtime to the generated `cpanel-deploy` branch, then connects to cPanel over SSH and tells the existing clone to fetch that runtime. cPanel does not run the Next.js build. The deployment updates `tmp/restart.txt` after a new build is checked out so Passenger restarts the app.

## cPanel Node.js application

Configure **Setup Node.js App** for the main domain:

- Node.js version: `22.23.5`
- Mode: `Production`
- Application URL: `mightyhomefinds.com` at `/`
- Application root: `homefinds` (the directory containing `package.json`, `app/`, `public/`, and `passenger.cjs`)
- Startup file: `passenger.cjs`
- This CloudLinux/LiteSpeed host routes Node.js apps through a LiteSpeed application socket and does not provide `PORT`. `passenger.cjs` uses the socket when `PORT` is absent and uses a TCP port when another Passenger host provides one.

The cPanel home directory is `/home2/mightyhomefinds`; the app and cloned Git repository are `/home2/mightyhomefinds/homefinds`.

## Enable GitHub Actions SSH deployment

1. In cPanel, open **SSH Access → Manage SSH Keys**. Generate a dedicated deployment key pair there, or import the public key generated for this workflow. Authorize the public key. Keep the private key private; it belongs only in a GitHub Actions secret.
2. In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret** and add:

   - `CPANEL_SSH_HOST`: `cloud207.cloudwebhosting.com` (confirmed with `hostname -f` in cPanel Terminal).
   - `CPANEL_SSH_PORT`: `37980` (previously confirmed as the working SSH port for this server).
   - `CPANEL_SSH_USER`: `mightyhomefinds` (the username shown by this account's cPanel Terminal prompt).
   - `CPANEL_SSH_PRIVATE_KEY`: the private key corresponding to the authorized public key. Include the full key text, including its begin/end lines.
   - `CPANEL_SSH_KEY_PASSPHRASE`: the passphrase used when this private key was generated. The workflow decrypts its temporary runner copy for the SSH connection; it does not change the cPanel key.
   - `CPANEL_SSH_KNOWN_HOSTS`: the verified SSH host-key line for this host and port. Obtain it with `ssh-keyscan -p <port> <host>` and verify its fingerprint with the hosting provider before saving it. For a non-default port, the known-hosts entry must use the `[host]:port` format returned by `ssh-keyscan`.

   Do not paste private keys or secret values into chat, commits, or project files.
3. Remove or disable the temporary cPanel cron job used for deployment once the SSH workflow succeeds. Do not leave two deployment mechanisms active.
4. Push a commit to `main`, or run **Actions → Build and deploy Home Finds to cPanel → Run workflow**. The workflow should show build, runtime-branch publish, SSH pull, and Passenger restart steps.

The SSH deployment uses the cPanel clone's existing public GitHub remote and checks out the generated `cpanel-deploy` runtime. It preserves untracked server files such as `node_modules` and environment files. The private key and host key are supplied as GitHub secrets; host checking is strict.

## Dependency changes

The deployment preserves server `node_modules`. If `package.json` or `package-lock.json` changes, use the cPanel Node.js App's **Run NPM Install** action with Node.js `22.23.5` after deployment, then restart the app. The production Next.js build runs in GitHub Actions to avoid cPanel build-memory limits.

## Current product limitations

The site remains a storefront prototype. Deployment does not add a database, live inventory, authentication, payment processing, or an operational order service. The manual MoMo flow must not be represented as automatic payment verification. Confirm the receiving number and support contact before taking real payments.

## Supabase catalogue admin

The admin dashboard uses Supabase Auth and PostgreSQL for staff access and catalogue records. Product and configurator image files are stored on cPanel, not Supabase Storage. In cPanel **Setup Node.js App → Environment variables**, set `HOMEFINDS_MEDIA_DIR=/home2/mightyhomefinds/homefinds-media`, then restart Passenger. This folder is outside the deployed app checkout, so GitHub deployments do not replace uploaded files. Production uploads now fail closed if the variable is missing, relative, or inside the checkout. Confirm the app user can create and write the directory, read uploaded files through `/media/...`, and that the hosting backup includes this directory; those host checks have not been completed in this workspace. Local development uses the git-ignored `.local-media/` folder. Existing bundled assets remain in `public/assets/` until their managed replacements are ready.

Configure Supabase Auth and PostgreSQL credentials for staff access and catalogue records; product images are stored on cPanel as described above. Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` (publishable/anon key only) as cPanel runtime variables. Staff invitations and Auth Admin operations also require `SUPABASE_SECRET_KEY`, the current Supabase server-only secret key (`sb_secret_…`). The app accepts the legacy `SUPABASE_SERVICE_ROLE_KEY` name as a fallback during migration. Keep either key server-only: never add it to browser code, a `NEXT_PUBLIC_` variable, GitHub Actions, or a committed file. The staff screen is owner-only. There is no public sign-up route.

The Home Finds Supabase project is currently named `solomon.billionairesurge@gmail.com's Project` in the `HomeFind's` organization, region `eu-west-2`, project ref `gsfphkotxfkwcsetsbvu` (`https://gsfphkotxfkwcsetsbvu.supabase.co`). The catalogue migration `202611240001_catalogue_admin.sql` has been applied to this project. The generated project ref is not a secret; the CLI's local link is ignored and must be recreated on another workstation.

### Storefront catalogue source

The storefront uses published Supabase products when there is a valid published catalogue; otherwise, the generated visual prototype remains as a fallback. Product and category edits in Admin are saved to Supabase. Migration `202611250001_import_storefront_drafts.sql` imports the six prototype categories and eleven existing bed designs with one current image each as editable drafts. Their sample prices and product claims are illustrative, so the import does not create sale variants or publish products. Review each design, add confirmed prices and matched frame/dressed images, then publish it. Once managed products are published, the storefront switches to those records. The additional generated size/finish image combinations remain in the prototype asset index until mapped to managed variants.

### Supabase database migrations

Schema changes are version-controlled under `supabase/migrations/` and deployed with the Supabase CLI. Do not make schema changes to the hosted project in the SQL/Table Editor; doing so bypasses migration history and can make later pushes fail. The repository includes `supabase/config.toml`; the local Supabase CLI link is intentionally not committed.

1. Install/use Supabase CLI v3.3 or later and authenticate with `npx supabase login` (the access token is stored by the CLI, not in the repository).
2. Link this checkout to the confirmed project with `npx supabase link --project-ref gsfphkotxfkwcsetsbvu`.
3. Review the target and pending migration list with `npx supabase migration list --remote`, then preview pending SQL with `npx supabase db push --dry-run --remote`.
4. After confirming the target project and preview, apply with `npx supabase db push --remote`. The CLI asks for confirmation. Do not use `--yes` for production unless the operator explicitly intends to apply the listed changes.

For each future schema change, add a new timestamped SQL migration (for example, `npx supabase migration new add_variant_dimensions`), review it, and push it through this workflow. Never edit a migration that has already been applied to a shared/production project; add a new migration instead. Agents may prepare and review migration files, but must not push schema changes to production without explicit authorization for that push. The existing catalogue migration also creates a legacy Supabase Storage bucket, but new admin uploads use the cPanel media folder. Confirm project backup/retention settings before uploading production assets.

The catalogue migration is applied, but the production cPanel runtime still needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and the settings below. Do not deploy expecting staff invitations to work until the migration and project configuration are complete.

### Staff invitations and owner setup

1. Apply and review `202611240002_staff_management.sql` with the migration workflow above. It adds staff status/email fields, owner-only staff RLS, an active-accepted staff authorization gate, audit events, and database protection against removing the last active owner. It will stop if an existing staff profile has no matching Auth email; resolve that account before retrying.
2. In cPanel **Setup Node.js App → Environment variables**, add:
   - `SUPABASE_SECRET_KEY`: create/reveal the project’s secret key (`sb_secret_…`) in Supabase **Project Settings → API Keys**. This is read only in server modules for Auth Admin operations. Do not copy its value into source control, a `NEXT_PUBLIC_` variable, a GitHub secret, or a client component. Restart the Passenger application after saving.
   - `HOMEFINDS_SITE_URL=https://mightyhomefinds.com` (use the canonical HTTPS storefront origin).
3. In Supabase **Authentication → URL Configuration**, set the site URL to `https://mightyhomefinds.com` and allow `https://mightyhomefinds.com/admin/invite/accept` as a redirect URL.
4. In **Authentication → Email Templates → Invite user**, set the link to the SSR confirmation route so the token is verified and stored in the staff member’s session cookie. For example:

   ```html
   <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/admin/invite/accept">Accept invitation</a>
   ```

   Confirm the project’s email sender, invite template, and expiry settings before sending live invitations. Do not use a template that exposes the service-role secret or sends the raw token to application logs.
5. Provision the first owner. First create the owner’s Auth user in Supabase **Authentication → Users → Add user** with an email and a temporary password, then open **SQL Editor** and run the following after replacing the two example values. This inserts catalogue access for that existing Auth user; it does not create a password or send an invitation:

   ```sql
   insert into public.staff_profiles (user_id, email, display_name, role, is_active, invitation_status)
   select id, email, 'Home Finds Owner', 'owner', true, 'accepted'
   from auth.users
   where lower(email) = lower('owner@example.com')
   on conflict (user_id) do nothing;
   ```

   Check that exactly one profile was added and sign in at `/admin/login`. Keep at least two active accepted owners before deactivating or demoting an owner. Database triggers reject removal of the final active owner, including a self-change.
6. Owners can invite `owner` or `catalogue_admin` staff at `/admin/staff`. New staff set their password through the email invitation. Revoke blocks the pending Auth user and records a revoked status. Resend rotates the pending Auth user and sends a fresh invitation link; this invalidates the old link. Role changes, deactivation, invites, revokes and resends are recorded in the existing catalogue audit log.

The migration is prepared locally and must be reviewed/applied by an authorized operator using the CLI workflow above. No invitation email or production staff account was changed while implementing these changes.
