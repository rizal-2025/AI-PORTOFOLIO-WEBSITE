import { registerHooks } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/headers") {
      return nextResolve(
        new URL("./next-headers-shim.mts", import.meta.url).href,
        context,
      );
    }
    if (specifier === "next/server") {
      return nextResolve("next/server.js", context);
    }
    if (!specifier.startsWith("@/")) {
      return nextResolve(specifier, context);
    }
    const absolutePath = join(repositoryRoot, specifier.slice(2));
    return nextResolve(pathToFileURL(`${absolutePath}.ts`).href, context);
  },
});
