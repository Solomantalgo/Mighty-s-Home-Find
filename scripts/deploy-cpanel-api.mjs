import { readFile } from "node:fs/promises";

const token = process.env.CPANEL_API_TOKEN;
const username = process.env.CPANEL_USERNAME;
const host = process.env.CPANEL_HOST;
const appRoot = process.env.CPANEL_APP_ROOT;
const homeDirectory = "/home2/mightyhomefinds";
const archivePath = process.argv[2];

if (!token || !username || !host || !appRoot || !archivePath) {
  throw new Error("Missing cPanel deployment configuration or archive path.");
}

const authorization = `cpanel ${username}:${token}`;
const baseUrl = `https://${host}:2083`;

async function responseJson(response, label) {
  const text = await response.text();
  let payload;

  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`${label} returned HTTP ${response.status} with a non-JSON response.`);
  }

  if (!response.ok) {
    throw new Error(`${label} failed with HTTP ${response.status}: ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function uploadFile(directory, filename, contents) {
  const form = new FormData();
  form.set("dir", directory);
  form.set("overwrite", "1");
  form.set("file-1", new Blob([contents]), filename);

  const response = await fetch(`${baseUrl}/execute/Fileman/upload_files`, {
    method: "POST",
    headers: { Authorization: authorization },
    body: form,
    signal: AbortSignal.timeout(180_000),
  });
  const payload = await responseJson(response, `Upload ${filename}`);

  if (payload?.result?.status !== 1) {
    throw new Error(`cPanel did not confirm uploading ${filename}: ${JSON.stringify(payload)}`);
  }
}

async function callApi2Fileman(operation, parameters) {
  const query = new URLSearchParams({
    cpanel_jsonapi_user: username,
    cpanel_jsonapi_apiversion: "2",
    cpanel_jsonapi_module: "Fileman",
    cpanel_jsonapi_func: operation,
    ...parameters,
  });
  const response = await fetch(`${baseUrl}/json-api/cpanel?${query}`, {
    headers: { Authorization: authorization },
    signal: AbortSignal.timeout(180_000),
  });
  return responseJson(response, `cPanel Fileman ${operation}`);
}

function assertApi2Success(payload, operation) {
  const result = payload?.cpanelresult;
  const eventSucceeded = result?.event?.result === 1;
  const entries = Array.isArray(result?.data) ? result.data : [];
  const entriesSucceeded = entries.every((entry) => entry?.result === 1);

  if (!eventSucceeded || !entriesSucceeded) {
    throw new Error(`cPanel Fileman ${operation} did not report success: ${JSON.stringify(payload)}`);
  }
}

const archiveName = `homefinds-deploy-${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}.tar.gz`;
const archive = await readFile(archivePath);
const archiveRelativePath = `${appRoot}/${archiveName}`;

console.log(`Uploading ${archiveName} to the cPanel app root over HTTPS.`);
await uploadFile(appRoot, archiveName, archive);

console.log("Extracting the production build into the cPanel app root.");
const extractResult = await callApi2Fileman("fileop", {
  op: "extract",
  sourcefiles: archiveRelativePath,
  doubledecode: "1",
});
assertApi2Success(extractResult, "extract");

console.log("Removing the temporary deployment archive.");
const deleteResponse = await fetch(
  `${baseUrl}/execute/Fileman/delete_file?${new URLSearchParams({
    path: `${homeDirectory}/${archiveRelativePath}`,
  })}`,
  { headers: { Authorization: authorization }, signal: AbortSignal.timeout(180_000) },
);
const deleteResult = await responseJson(deleteResponse, "Remove deployment archive");
if (deleteResult?.result?.status !== 1) {
  throw new Error(`cPanel did not confirm removing ${archiveName}: ${JSON.stringify(deleteResult)}`);
}

const restartMarker = `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}\n`;
console.log("Updating Passenger's restart marker after extraction.");
await uploadFile(`${appRoot}/tmp`, "restart.txt", Buffer.from(restartMarker));
console.log("cPanel upload, extraction, cleanup, and Passenger restart marker completed.");
