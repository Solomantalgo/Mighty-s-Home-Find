# cPanel deployment preparation

This app is prepared for cPanel's **Setup Node.js App / Passenger** using Node.js **22.23.5**. No deployment to the live domain has been performed.

## cPanel application settings

Create a Node.js application for the main domain `mightyhomefinds.com` and bind it to the domain root. Use the repository/project root as the **Application root**: the directory containing `package.json`, `app/`, `public/`, and `passenger.cjs`. The actual absolute hosting path has not been supplied, so choose and record it in cPanel rather than copying a guessed path from this guide.

Set these application values:

- **Node.js version:** `22.23.5`
- **Application mode:** `Production`
- **Application URL:** `mightyhomefinds.com` at `/`
- **Application startup file:** `passenger.cjs` (not `app.js`; `prototype/app.js` is the preserved old HTML prototype)
- **Environment:** ensure Passenger provides its assigned `PORT`; do not hard-code a port

`passenger.cjs` starts Next.js with `dev: false`, waits for the production build, then listens on Passenger's `PORT`. It fails fast when `PORT` is missing or invalid. The regular `npm start` remains available for standard Node hosting; cPanel must use the dedicated startup filename above.

## Install, build, and restart

Run these commands from the application root in cPanel's terminal/SSH session, using the Node 22.23.5 environment selected for the app:

```sh
npm ci
npm run build
```

Then start or restart the application from **Setup Node.js App**. Passenger must start `passenger.cjs` after the build has completed. After each deployed source update, install if the lockfile changed, run `npm run build`, then restart the Node.js application in cPanel. Keep the built `.next/` directory on the server; do not deploy this app as static files only.

For a local production smoke check, build first and run:

```sh
npm run start:passenger
```

This command also requires `PORT` to be set, matching Passenger behavior. `npm start` runs Next's standard production server and is not the cPanel startup-file setting.

## GitHub `main` to cPanel

The intended flow is a push to the approved GitHub `main` branch followed by an automated deployment to the cPanel application root. A push to GitHub alone does not make cPanel pull or rebuild the repository. The recommended bridge is a GitHub Actions workflow that connects to the cPanel account over SSH, updates the cPanel-managed checkout (or performs the provider-approved checkout), runs `npm ci` and `npm run build` in the application root, and invokes the cPanel-supported Passenger restart. Confirm the provider's supported restart command/mechanism before enabling that workflow. cPanel Git Version Control may be used for the checkout, but it needs an explicit GitHub-to-cPanel trigger to make GitHub pushes automatic.

No workflow or credentials are included yet because the host and repository connection details are unknown. To configure automation without committing credentials, provide/configure:

1. The canonical GitHub repository URL and confirmation that `main` is the production branch.
2. The cPanel SSH hostname, SSH port, and deployment username.
3. The exact absolute cPanel application/repository root and confirmation that the deploy user can update it.
4. Whether that path is a cPanel Git Version Control checkout or a direct checkout, and the provider-approved update command.
5. The cPanel-supported build/restart commands and whether GitHub Actions may run `npm ci` and `npm run build` on the host.
6. The approved SSH key arrangement: which public key to authorize in cPanel and which private key to store in GitHub Actions secrets. Store the private key only as a GitHub Actions secret; never put it in this repository.
7. Confirmation that outbound SSH from GitHub-hosted Actions to the cPanel host is allowed, or the provider's required alternative deployment mechanism.

Once those values are provided, add the repository workflow using the confirmed connection and secret names. Do not put passwords, private keys, tokens, or `.env` values in source control. Do not deploy to the live domain until the production application root, root-domain mapping, backup/rollback plan, and restart path are confirmed.

## Current limitations

This is a client-side storefront prototype. Deployment does not add a database, live inventory, authentication, payment processing, or an operational order service. The manual MoMo prototype must not be represented as automatic payment verification. The Home Finds receiving number and payment support contact also remain to be configured separately before accepting real payments.
