# cPanel deployment

GitHub Actions builds Home Finds on every push to `main` with Node.js `22.23.5` and `next build --webpack`. It then uploads a compressed production package through cPanel's authenticated HTTPS API on port `2083`, extracts it into the `homefinds` Node.js app root, removes the temporary archive, and uploads `tmp/restart.txt` last to restart Passenger. This avoids the FTP passive data-port timeout seen with this hosting account. No build runs on the cPanel server.

## cPanel Node.js application

Configure **Setup Node.js App** for the main domain:

- Node.js version: `22.23.5`
- Mode: `Production`
- Application URL: `mightyhomefinds.com` at `/`
- Application root: `homefinds` (the directory containing `package.json`, `app/`, `public/`, and `passenger.cjs`)
- Startup file: `passenger.cjs`
- Passenger must provide the assigned `PORT`.

The cPanel account home directory shown in this account is `/home2/mightyhomefinds`; the app directory is `/home2/mightyhomefinds/homefinds`.

## GitHub Actions secret

In the repository's **Settings > Secrets and variables > Actions**, configure:

- `CPANEL_API_TOKEN`: a cPanel API token created under **Security > Manage API Tokens**.

The workflow uses cPanel account username `mightyhomefinds` and the server hostname `cloud207.cloudwebhosting.com`. Keep the token in GitHub Secrets only; never commit it or paste it into chat. The token authorizes cPanel API calls as the account, so revoke it in cPanel if it is no longer needed.

The previous `CPANEL_FTP_*` secrets are not used by this workflow. They can be removed after the HTTPS API deployment succeeds.

## Build and deployment behavior

For each push to `main`, GitHub Actions runs `npm ci`, then `npx next build --webpack`. It stages the app source, runtime package files, public assets, Passenger entry point, and production `.next` output. It excludes `.git`, server `node_modules`, environment files, planning assets, and QA screenshots. The workflow preserves server dependencies and environment files. The cPanel API extracts the package, deletes the temporary archive, then updates `tmp/restart.txt` to restart Passenger.

The workflow uses cPanel UAPI `Fileman::upload_files` for HTTPS uploads. It uses cPanel API 2 `Fileman::fileop` only for archive extraction because cPanel does not provide an equivalent UAPI extraction function. Both requests use the cPanel API token over HTTPS with certificate verification enabled.

## Dependency changes

The deployment preserves server `node_modules`. If `package.json` or `package-lock.json` changes, use the cPanel Node.js App's **Run NPM Install** action with Node.js `22.23.5` after deployment, then restart the app. The production Next.js build still runs in GitHub Actions.

## Current product limitations

The site remains a storefront prototype. Deployment does not add a database, live inventory, authentication, payment processing, or an operational order service. The manual MoMo flow must not be represented as automatic payment verification. Confirm the receiving number and support contact before taking real payments.
