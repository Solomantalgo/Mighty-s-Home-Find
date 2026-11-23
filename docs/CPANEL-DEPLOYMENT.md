# cPanel deployment

The GitHub Actions workflow builds Home Finds on each push to `main` using Node.js `22.23.5` and `next build --webpack`, then deploys the application and `.next` output to cPanel over **explicit FTPS**. The FTP account is restricted to the Home Finds app root, so the remote destination is `./`. After the app files are uploaded, the workflow updates `tmp/restart.txt` last to trigger Passenger. No SSH commands or cPanel-side build are used.

## cPanel Node.js App

Configure **Setup Node.js App** for the root of `mightyhomefinds.com`:

- Node.js version: `22.23.5`
- Mode: `Production`
- Application URL: `mightyhomefinds.com` at `/`
- Application root: the directory containing `package.json`, `app/`, `public/`, and `passenger.cjs`
- Startup file: `passenger.cjs` (do not use `app.js`; `prototype/app.js` belongs to the preserved old prototype)
- Passenger must provide its assigned `PORT`

The FTP account must be restricted to this application root. The workflow uploads to `./` within that account and does not need or assume an absolute hosting path. `passenger.cjs` runs the production Next.js server (`dev: false`) and listens on Passenger's assigned port; it requires the uploaded `.next` build.

## GitHub Actions secrets

The workflow is [`.github/workflows/deploy-cpanel.yml`](../.github/workflows/deploy-cpanel.yml). In the repository's **Settings → Secrets and variables → Actions → Secrets**, configure:

- `CPANEL_FTP_SERVER` = `ftp.mightyhomefinds.com`
- `CPANEL_FTP_PORT` = `21`
- `CPANEL_FTP_USERNAME` = the cPanel FTP account username
- `CPANEL_FTP_PASSWORD` = the cPanel FTP account password

The workflow checks that all four secrets are present and that the server and port match the supplied destination before connecting. It uses `protocol: ftps` (explicit FTPS) and certificate validation. No credentials belong in source control. When these secrets are unset, the build can run, but the job stops before opening an FTPS connection.

## Build and upload behavior

For each `main` push, GitHub Actions runs `npm ci`, then `npx next build --webpack` on the runner. It stages the app source, runtime package files, public assets, Passenger entry point, and production `.next` output. It excludes `.git`, `node_modules`, `.env` files, planning assets, and QA screenshots. It does not use the destructive clean-slate option, so server dependencies and environment files remain in place. The restart marker contains a unique workflow run value so each deployment updates it.

The workflow must not be run against production until the four repository secrets are configured and the FTP account is confirmed to be restricted to the Home Finds application root. The first live deployment should have an agreed backup and rollback plan.

## Dependency changes

The deployment intentionally preserves server `node_modules`. If `package.json` or `package-lock.json` changes, the upload does not install those dependencies. After deploying such a change, use the cPanel Node.js App's **Run NPM Install** action with Node.js `22.23.5`, then restart the app. This installs dependencies only; the production Next.js build still runs in GitHub Actions. If that cPanel control is unavailable, confirm the provider's supported dependency-install method before merging dependency changes.

## Prototype limitations

The site remains a client-side storefront prototype. This deployment does not add a database, live inventory, authentication, payment processing, or an operational order service. The manual MoMo prototype must not be represented as automatic payment verification. Configure the Home Finds receiving number and payment support contact before accepting real payments.
