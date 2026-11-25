"use strict";
/* eslint @typescript-eslint/no-require-imports: off */

// Dedicated cPanel / Passenger entry point for the Next.js production server.
// In cPanel, set the Node.js application's Startup File to: passenger.cjs
const { createServer } = require("node:http");
const path = require("node:path");

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : undefined;

if (rawPort && (!Number.isInteger(port) || port < 1 || port > 65535)) {
  throw new Error("If provided, PORT must be a valid TCP port.");
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

    const onListening = () => {
      console.log(
        port
          ? `Home Finds production server listening on port ${port}`
          : "Home Finds production server listening on the LiteSpeed application socket",
      );
    };

    // LiteSpeed's CloudLinux Node.js Selector patches listen() to use its
    // application socket and does not provide PORT. Other Passenger hosts can
    // continue to supply PORT and use a TCP listener.
    if (port) {
      server.listen(port, onListening);
    } else {
      server.once("listening", onListening);
      server.listen();
    }
  })
  .catch((error) => {
    console.error("Could not prepare the Next.js production build:", error);
    process.exitCode = 1;
  });
