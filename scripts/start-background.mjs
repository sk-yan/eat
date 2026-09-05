import { spawn } from "node:child_process";
import { mkdir, open, readFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
await mkdir(new URL("../.runtime/", import.meta.url), { recursive: true });
try {
  const state = JSON.parse(
    await readFile(new URL("../.runtime/server.json", import.meta.url), "utf8"),
  );
  const result = await fetch(`${state.url}/api/health`, {
    signal: AbortSignal.timeout(1000),
  });
  if (result.ok && (await result.json()).recipes) {
    console.log(state.url);
    process.exit(0);
  }
} catch {
  /* No healthy instance exists. */
}
await rm(new URL("../.runtime/server.json", import.meta.url), { force: true });
const log = await open(new URL("../.runtime/server.log", import.meta.url), "a");
const child = spawn(process.execPath, ["--env-file-if-exists=.env", "server/index.mjs"], {
  cwd: root,
  detached: true,
  stdio: ["ignore", log.fd, log.fd],
});
child.unref();
await log.close();
for (let i = 0; i < 30; i++) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  try {
    const state = JSON.parse(
      await readFile(
        new URL("../.runtime/server.json", import.meta.url),
        "utf8",
      ),
    );
    const result = await fetch(`${state.url}/api/health`, {
      signal: AbortSignal.timeout(1000),
    });
    if (result.ok) {
      console.log(state.url);
      process.exit(0);
    }
  } catch {
    /* Wait for the detached process to listen. */
  }
}
throw new Error("Server did not become ready; inspect .runtime/server.log");
