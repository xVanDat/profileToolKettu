import swc from "@swc/core";
import crypto from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const source = await readFile("src/index.js", "utf8");
const transformed = await swc.transform(`var __profileToolsPlugin = ${source}`, {
    filename: "src/index.js",
    jsc: {
        parser: { syntax: "ecmascript" },
        externalHelpers: false,
    },
    env: {
        targets: "fully supports es6",
        include: [
            "transform-arrow-functions",
            "transform-block-scoping",
            "transform-classes",
            "transform-async-to-generator",
            "transform-async-generator-functions",
        ],
        exclude: [
            "transform-parameters",
            "transform-template-literals",
            "transform-exponentiation-operator",
            "transform-named-capturing-groups-regex",
            "transform-nullish-coalescing-operator",
            "transform-object-rest-spread",
            "transform-optional-chaining",
            "transform-logical-assignment-operators",
        ],
    },
});

const bundle = `(function () {\n${transformed.code}\nreturn __profileToolsPlugin;\n})()`;
new Function("vendetta", `return ${bundle}`);

const manifest = JSON.parse(await readFile("manifest.json", "utf8"));
manifest.main = "index.js";
manifest.hash = crypto.createHash("sha256").update(bundle).digest("hex");

await writeFile("index.js", bundle);
await writeFile("manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Built index.js (${Buffer.byteLength(bundle)} bytes)`);
console.log(`SHA-256 ${manifest.hash}`);
