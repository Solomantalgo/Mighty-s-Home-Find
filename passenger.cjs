"use strict";
/* eslint @typescript-eslint/no-require-imports: off */

// Dedicated cPanel / Passenger entry point for the Next.js production server.
// In cPanel, set the Node.js application's Startup File to: passenger.cjs
const { createServer } = require("node:http");
const path = require("node:path");

const rawPort = process.env.PORT;
const port = Number(rawPort);

if (!rawPort || !Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("Passenger must provide a valid PORT environment variable.");
}

// Passenger starts this file directly. Always serve the built production app.
process.env.NODE_ENV = "production";

const next = require("next");
const app = next({
  dev: false,
  dir: path.resolve(__dirname),
  port,
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer((request, response) => {
      Promise.resolve(handle(request, response)).catch((error) => {
        console.error("Next.js request failed:", error);
        if (!response.headersSent) {
          response.statusCode = 500;
          response.end("Internal Server Error");
        } else {
          response.destroy(error);
        }
      });
    });

    server.listen(port, () => {
      console.log(`Home Finds production server listening on Passenger port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Could not prepare the Next.js production build:", error);
    process.exitCode = 1;
  });
