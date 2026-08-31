import crypto from "node:crypto";
import { readFile } from "node:fs/promises";

const source = await readFile("index.js", "utf8");
const manifest = JSON.parse(await readFile("manifest.json", "utf8"));
const digest = crypto.createHash("sha256").update(source).digest("hex");
if (digest !== manifest.hash) throw new Error(`Hash mismatch: ${digest} != ${manifest.hash}`);
if (!source.startsWith("(")) throw new Error("Bundle must start with an opening parenthesis");

const noop = () => { };
const installedPatches = [];
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
        findByStoreName: name => name === "UserStore"
            ? { getUser: noop, getCurrentUser: noop }
            : { getUserProfile: noop, getGuildMemberProfile: noop },
        findByProps: (...props) => props.includes("getAvatarDecorationURL")
            ? { getAvatarDecorationURL: noop }
            : props.includes("jsx") ? { jsx: noop, jsxs: noop } : {},
        findByName: () => ({ default: noop }),
    },
    patcher: { after: (method, parent, callback) => {
        installedPatches.push({ method, parent, callback });
        return noop;
    } },
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

const plugin = load(api);
api.plugin.storage.profiles = {
    "123456789012345678": {
        badgeFlags: 4194304,
        nitro: true,
        nitroLevel: 3,
        boostLevel: 2,
        decorationAsset: "1144307957425778779",
        profileEffectId: "1139323092645183591",
        connections: [{ platform: "github", name: "xVanDat", url: "https://github.com/xVanDat" }],
    },
};
plugin.onLoad();
const profilePatch = installedPatches.find(patch => patch.method === "getUserProfile");
const profile = profilePatch.callback(["123456789012345678"], { userId: "123456789012345678" });
if (profile.profileEffectId !== "1139323092645183591" || profile.avatarDecorationData?.asset !== "1144307957425778779" || profile.connectedAccounts?.length !== 1 || profile.premiumType !== 2 || !profile.premiumSince || !profile.premiumGuildSince) {
    throw new Error("Profile cosmetics/connections patch failed");
}
plugin.onUnload();

for (const vendetta of [{ ...api, metro: { ...api.metro, common: {} } }]) {
    const fallbackPlugin = load(vendetta);
    if (typeof fallbackPlugin?.onLoad !== "function" || typeof fallbackPlugin?.onUnload !== "function" || typeof fallbackPlugin?.settings !== "function") {
        throw new Error("Invalid plugin exports");
    }
    fallbackPlugin.onLoad();
    fallbackPlugin.onUnload();
}

console.log(`Kettu bundle test passed: ${digest}`);
