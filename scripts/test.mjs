import crypto from "node:crypto";
import { readFile } from "node:fs/promises";

const source = await readFile("index.js", "utf8");
const manifest = JSON.parse(await readFile("manifest.json", "utf8"));
const digest = crypto.createHash("sha256").update(source).digest("hex");
if (digest !== manifest.hash) throw new Error(`Hash mismatch: ${digest} != ${manifest.hash}`);
if (!source.startsWith("(")) throw new Error("Bundle must start with an opening parenthesis");

const noop = () => { };
const React = { createElement: noop, useState: value => [value, noop] };
const ReactNative = {
    ScrollView: noop,
    View: noop,
    Text: noop,
    TextInput: noop,
    Switch: noop,
    Pressable: noop,
    StyleSheet: { create: value => value },
};
const api = {
    metro: {
        common: { React, ReactNative, FluxDispatcher: { dispatch: noop } },
        findByStoreName: () => ({}),
        findByProps: () => ({}),
        findByName: () => ({}),
    },
    patcher: { after: () => noop },
    plugin: { storage: {} },
    storage: { useProxy: noop },
    ui: { toasts: { showToast: noop } },
    logger: { error: noop },
};

globalThis.fetch = async () => { throw new Error("Offline test"); };
globalThis.setInterval = () => 1;
globalThis.clearInterval = noop;

function load(vendetta) {
    const raw = (0, eval)(`vendetta=>{return ${source}}`)(vendetta);
    return typeof raw === "function" ? raw() : raw;
}

for (const vendetta of [api, { ...api, metro: { ...api.metro, common: {} } }]) {
    const plugin = load(vendetta);
    if (typeof plugin?.onLoad !== "function" || typeof plugin?.onUnload !== "function" || typeof plugin?.settings !== "function") {
        throw new Error("Invalid plugin exports");
    }
    plugin.onLoad();
    plugin.onUnload();
}

console.log(`Kettu bundle test passed: ${digest}`);
