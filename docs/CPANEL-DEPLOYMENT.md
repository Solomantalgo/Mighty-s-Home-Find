# cPanel deployment

GitHub Actions builds Home Finds on every push to `main` with Node.js `22.23.5` and `next build --webpack`. It publishes the production runtime to the `cpanel-deploy` branch. A cPanel cron job checks that branch over outbound HTTPS once per minute, checks out new builds in the existing `homefinds` app root, and updates `tmp/restart.txt` only when the build changes. This pull-based flow avoids the hosting account's blocked FTP passive data port and browser verification on cPanel API requests. GitHub Actions does not connect to cPanel directly.

## cPanel Node.js application

Configure **Setup Node.js App** for the main domain:

- Node.js version: `22.23.5`
- Mode: `Production`
- Application URL: `mightyhomefinds.com` at `/`
- Application root: `homefinds` (the directory containing `package.json`, `app/`, `public/`, and `passenger.cjs`)
- Startup file: `passenger.cjs`
- Passenger must provide the assigned `PORT`.

The cPanel home directory shown for this account is `/home2/mightyhomefinds`; the app and cloned Git repository are `/home2/mightyhomefinds/homefinds`.

## One-time cPanel cron setup

Wait until GitHub Actions has created the `cpanel-deploy` branch. In cPanel, open **Cron Jobs** and add this command to run **once per minute**:

```sh
/bin/bash -c 'APP=/home2/mightyhomefinds/homefinds; GIT=/usr/bin/git; cd "$APP" || exit 1; "$GIT" fetch --quiet origin cpanel-deploy || exit 1; target=$("$GIT" rev-parse FETCH_HEAD) || exit 1; current=$("$GIT" rev-parse HEAD) || exit 1; if [ "$target" != "$current" ]; then "$GIT" checkout --force --detach "$target" || exit 1; printf "%s\n" "$target" > "$APP/tmp/restart.txt"; fi'
```

The command uses the existing public GitHub clone, fetches only the `cpanel-deploy` branch, and leaves the Node.js app's untracked `node_modules` and environment files in place. It restarts Passenger only after a new runtime commit arrives. The expected update delay is up to one minute.

## GitHub Actions behavior

The workflow needs `contents: write` permission to publish the built runtime branch. It packages the app source, `public/` media, runtime package files, Passenger entry point, and `.next` build. It does not publish `.git`, `node_modules`, `.env` files, planning assets, or QA screenshots. The `cpanel-deploy` branch is generated output; do not edit it by hand.

The old `CPANEL_FTP_*` and `CPANEL_API_TOKEN` GitHub secrets are no longer used. After confirming the cron deployment works, remove those secrets and revoke the cPanel API token.

## Dependency changes

The deployment preserves server `node_modules`. If `package.json` or `package-lock.json` changes, use the cPanel Node.js App's **Run NPM Install** action with Node.js `22.23.5` after the cron has pulled the build, then restart the app. The production Next.js build continues to run in GitHub Actions.

## Current product limitations

The site remains a storefront prototype. Deployment does not add a database, live inventory, authentication, payment processing, or an operational order service. The manual MoMo flow must not be represented as automatic payment verification. Confirm the receiving number and support contact before taking real payments.
