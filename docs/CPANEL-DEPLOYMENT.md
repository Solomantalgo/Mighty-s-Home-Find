# cPanel deployment

GitHub Actions builds Home Finds on every push to `main` with Node.js `22.23.5` and `next build --webpack`. It publishes the production runtime to the generated `cpanel-deploy` branch, then connects to cPanel over SSH and tells the existing clone to fetch that runtime. cPanel does not run the Next.js build. The deployment updates `tmp/restart.txt` after a new build is checked out so Passenger restarts the app.

## cPanel Node.js application

Configure **Setup Node.js App** for the main domain:

- Node.js version: `22.23.5`
- Mode: `Production`
- Application URL: `mightyhomefinds.com` at `/`
- Application root: `homefinds` (the directory containing `package.json`, `app/`, `public/`, and `passenger.cjs`)
- Startup file: `passenger.cjs`
- Passenger must provide the assigned `PORT`.

The cPanel home directory is `/home2/mightyhomefinds`; the app and cloned Git repository are `/home2/mightyhomefinds/homefinds`.

## Enable GitHub Actions SSH deployment

1. In cPanel, open **SSH Access → Manage SSH Keys**. Generate a dedicated deployment key pair there, or import the public key generated for this workflow. Authorize the public key. Keep the private key private; it belongs only in a GitHub Actions secret.
2. In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret** and add:

   - `CPANEL_SSH_HOST`: `cloud207.cloudwebhosting.com` (confirmed with `hostname -f` in cPanel Terminal).
   - `CPANEL_SSH_PORT`: `37980` (previously confirmed as the working SSH port for this server).
   - `CPANEL_SSH_USER`: `mightyhomefinds` (the username shown by this account's cPanel Terminal prompt).
   - `CPANEL_SSH_PRIVATE_KEY`: the private key corresponding to the authorized public key. Include the full key text, including its begin/end lines.
   - `CPANEL_SSH_KNOWN_HOSTS`: the verified SSH host-key line for this host and port. Obtain it with `ssh-keyscan -p <port> <host>` and verify its fingerprint with the hosting provider before saving it. For a non-default port, the known-hosts entry must use the `[host]:port` format returned by `ssh-keyscan`.

   Do not paste private keys or secret values into chat, commits, or project files.
3. Remove or disable the temporary cPanel cron job used for deployment once the SSH workflow succeeds. Do not leave two deployment mechanisms active.
4. Push a commit to `main`, or run **Actions → Build and deploy Home Finds to cPanel → Run workflow**. The workflow should show build, runtime-branch publish, SSH pull, and Passenger restart steps.

The SSH deployment uses the cPanel clone's existing public GitHub remote and checks out the generated `cpanel-deploy` runtime. It preserves untracked server files such as `node_modules` and environment files. The private key and host key are supplied as GitHub secrets; host checking is strict.

## Dependency changes

The deployment preserves server `node_modules`. If `package.json` or `package-lock.json` changes, use the cPanel Node.js App's **Run NPM Install** action with Node.js `22.23.5` after deployment, then restart the app. The production Next.js build runs in GitHub Actions to avoid cPanel build-memory limits.

## Current product limitations

The site remains a storefront prototype. Deployment does not add a database, live inventory, authentication, payment processing, or an operational order service. The manual MoMo flow must not be represented as automatic payment verification. Confirm the receiving number and support contact before taking real payments.
