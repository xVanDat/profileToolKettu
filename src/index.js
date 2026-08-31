() => {
    try {
    const React = vendetta.metro.common.React;
    const ReactNative = vendetta.metro.common.ReactNative;
    const { ScrollView, View, Text, TextInput, Switch, Pressable, StyleSheet } = ReactNative;
    const { after } = vendetta.patcher;
    const { FluxDispatcher } = vendetta.metro.common;
    const UserStore = vendetta.metro.findByStoreName("UserStore");
    const UserProfileStore = vendetta.metro.findByStoreName("UserProfileStore");
    const profileActions = vendetta.metro.findByProps("getUser", "fetchProfile");
    const useBadgesModule = vendetta.metro.findByName("useBadges", false);
    const jsxRuntime = vendetta.metro.findByProps("jsx", "jsxs");
    const decorationModule = vendetta.metro.findByProps("getAvatarDecorationURL");
    const storage = vendetta.plugin.storage;
    const useProxy = vendetta.storage.useProxy;
    const showToast = vendetta.ui.toasts.showToast;
    const h = React.createElement;

    const defaults = {
        apiUrl: "https://badges.equicord.org/",
        globalBadges: true,
        showModName: "none",
        profiles: {},
    };
    for (const [key, value] of Object.entries(defaults)) {
        if (storage[key] === undefined) storage[key] = value;
    }
    if (!storage.profiles || typeof storage.profiles !== "object") storage.profiles = {};

    const styles = StyleSheet.create({
        screen: { flex: 1 },
        content: { padding: 14, paddingBottom: 40, gap: 18 },
        section: { backgroundColor: "#1e1f22", borderRadius: 14, padding: 14, gap: 12 },
        title: { color: "#f2f3f5", fontSize: 18, fontWeight: "700" },
        label: { color: "#b5bac1", fontSize: 13, fontWeight: "600", marginBottom: 5 },
        hint: { color: "#949ba4", fontSize: 12, lineHeight: 17 },
        input: { color: "#f2f3f5", backgroundColor: "#111214", borderRadius: 9, paddingHorizontal: 12, paddingVertical: 10 },
        row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
        rowText: { color: "#f2f3f5", fontSize: 15, flex: 1 },
        button: { backgroundColor: "#5865f2", borderRadius: 9, paddingHorizontal: 14, paddingVertical: 11, alignItems: "center" },
        secondaryButton: { backgroundColor: "#4e5058" },
        dangerButton: { backgroundColor: "#da373c" },
        disabled: { opacity: 0.45 },
        buttonText: { color: "#ffffff", fontWeight: "700" },
        warning: { color: "#f0b232", fontSize: 12 },
    });

    const serviceNames = {
        badgevault: "BadgeVault", nekocord: "Nekocord", reviewdb: "ReviewDB",
        aero: "Aero", aliucord: "Aliucord", raincord: "Raincord",
        velocity: "Velocity", enmity: "Enmity", paicord: "Paicord",
        bunny: "Bunny", goosemod: "GooseMod", replugged: "Replugged",
        betterdiscord: "BetterDiscord", vendroidenhanced: "Vendroid Enhanced",
        revenge: "Revenge", record: "ReCord",
    };

    const badgeDefinitions = [
        [1, "Discord Staff", "5e74e9b61934fc1f67c65515d1f7e60d"],
        [2, "Partnered Server Owner", "3f9748e53446a137a052f3454e2de41e"],
        [4, "HypeSquad Events", "bf01d1073931f921909045f3a39fd264"],
        [8, "Bug Hunter Level 1", "2717692c7dca7289b35297368a940dd0"],
        [64, "HypeSquad Bravery", "8a88d63823d8a71cd5e390baa45efa02"],
        [128, "HypeSquad Brilliance", "011940fd013da3f7fb926e4a1cd2e618"],
        [256, "HypeSquad Balance", "3aa41de486fa12454c3761e8e223442e"],
        [512, "Early Supporter", "7060786766c9c840eb3019e725d2b358"],
        [16384, "Bug Hunter Level 2", "848f79194d4be5ff5f81505cbd0ce1e6"],
        [131072, "Early Verified Bot Developer", "6df5892e0f35b051f8b61eace34f4967"],
        [262144, "Former Discord Moderator", "fee1624003e2fee35cb398e125dc479b"],
        [4194304, "Active Developer", "6bdc42827a38498929a4920da12695d9"],
    ];
    const specialBadgeDefinitions = {
        quest: ["Completed a Quest", "7d9ae358c8c5e118768335dbe68b4fb8"],
        orbs: ["Orbs — Apprentice", "83d8a1eb09a8d64e59233eec5d4d5c2d"],
        oldname: ["Originally Known As", "6de6d34650760ba5551a79732e98ed60"],
        gifting_icon: ["Gifting Icon", "64f2413c9b9803661322aaad25826b62"],
        gifting_patron: ["Gifting Patron", "ac305d1b9481f312ce4419e7f8296558"],
        gifting_champion: ["Gifting Champion", "8b7792c4f65953d3ff564f23429cb79e"],
        gifting_luminary: ["Gifting Luminary", "3119f5504b2cd09576a323908c7c3517"],
        gifting_hero: ["Gifting Hero", "77d65b1f210014a11eb1582ee06ab684"],
        gifting_legend: ["Gifting Legend", "7fe346cfc5da1340087d8759a9e7a395"],
        gifting_level: ["Level Reached", "ca105ad9cfc8580c765101d17bbb2323"],
    };

    const userOriginals = new Map();
    const profileOriginals = new Map();
    const badgeProps = new Map();
    const visibleUsers = new Set();
    const visualKeys = [
        "username", "globalName", "avatar", "banner", "bio", "pronouns",
        "accentColor", "publicFlags", "flags", "premiumType", "avatarDecoration",
        "avatarDecorationData", "profileEffectId", "profileEffect",
    ];
    const assignableKeys = [...visualKeys, "getAvatarURL", "getBannerURL"];
    let badgeUsers = {};
    let unpatches = [];
    let badgeTimer;

    function patchAfter(parent, method, callback) {
        if (!parent || typeof parent[method] !== "function") return;
        try {
            const unpatch = after(method, parent, callback);
            if (typeof unpatch === "function") unpatches.push(unpatch);
        } catch (error) {
            vendetta.logger.error(`ProfileTools: failed to patch ${method}`, error);
        }
    }

    function rememberAndAssign(target, values, originals) {
        if (!target || !values) return target;
        let saved = originals.get(target);
        if (!saved) originals.set(target, saved = {});
        for (const key of assignableKeys) {
            if (values[key] === undefined) continue;
            if (!(key in saved)) saved[key] = target[key];
            try { target[key] = values[key]; } catch { }
        }
        return target;
    }

    function customValues(userId) {
        const custom = storage.profiles[userId];
        if (!custom) return;
        const values = { ...custom };
        if (custom.badgeFlags !== undefined) {
            values.publicFlags = Number(custom.badgeFlags) || 0;
            values.flags = Number(custom.badgeFlags) || 0;
        }
        if (custom.decorationAsset) {
            values.avatarDecoration = null;
            values.avatarDecorationData = { asset: custom.decorationAsset, skuId: custom.decorationAsset };
        }
        if (custom.profileEffectId) {
            values.profileEffectId = custom.profileEffectId;
            values.profileEffect = { expireAt: null, skuId: custom.profileEffectId };
        }
        if (custom.avatar?.startsWith("http")) values.getAvatarURL = () => custom.avatar;
        if (custom.banner?.startsWith("http")) values.getBannerURL = () => custom.banner;
        return values;
    }

    function applyUser(user) {
        const values = user?.id && customValues(user.id);
        return values ? rememberAndAssign(user, values, userOriginals) : user;
    }

    function applyProfile(profile, userId) {
        const values = customValues(userId);
        if (!profile || !values) return profile;
        const custom = storage.profiles[userId] || {};
        const merged = { ...profile };
        for (const key of visualKeys) {
            if (values[key] !== undefined) merged[key] = values[key];
        }
        if (Array.isArray(custom.connections) && custom.connections.length) {
            const existing = (profile.connectedAccounts || profile.connected_accounts || []).filter(item => !item?._profileTools);
            const connections = custom.connections.map((item, index) => ({
                type: item.platform || "domain",
                id: item.name || `profiletools-${index}`,
                name: item.name || item.url || "ProfileTools",
                verified: true,
                visibility: 1,
                showActivity: false,
                show_activity: false,
                friendSync: false,
                friend_sync: false,
                metadataVisibility: 0,
                metadata_visibility: 0,
                twoWayLink: false,
                two_way_link: false,
                metadata: {},
                url: item.url || undefined,
                _profileTools: true,
            }));
            merged.connectedAccounts = [...existing, ...connections];
            merged.connected_accounts = [...existing, ...connections];
        }
        return merged;
    }

    function restoreMap(originals) {
        for (const [target, values] of originals) {
            for (const [key, value] of Object.entries(values)) {
                try { target[key] = value; } catch { }
            }
        }
        originals.clear();
    }

    async function fetchUser(userId) {
        try { await profileActions?.getUser?.(userId); } catch { }
        try { await profileActions?.fetchProfile?.(userId, { withMutualGuilds: false }); } catch { }
    }

    function refreshProfiles(...userIds) {
        restoreMap(userOriginals);
        restoreMap(profileOriginals);
        const ids = new Set([...Object.keys(storage.profiles), ...userIds]);
        const current = UserStore.getCurrentUser?.();
        if (current) {
            ids.add(current.id);
            FluxDispatcher.dispatch({ type: "CURRENT_USER_UPDATE", user: current });
        }
        ids.forEach(id => FluxDispatcher.dispatch({ type: "USER_UPDATE", user: { id } }));
    }

    function labelFor(badge) {
        const service = badge.mod && (serviceNames[badge.mod] || badge.mod);
        if (!service || storage.showModName === "none") return badge.tooltip;
        return storage.showModName === "prefix"
            ? `${service} - ${badge.tooltip}`
            : `${badge.tooltip} - ${service}`;
    }

    async function refreshGlobalBadges() {
        if (!storage.globalBadges || !storage.apiUrl?.trim()) {
            badgeUsers = {};
            visibleUsers.forEach(invalidateBadges);
            return;
        }
        const base = storage.apiUrl.endsWith("/") ? storage.apiUrl : `${storage.apiUrl}/`;
        const response = await fetch(`${base}users`, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Global Badges HTTP ${response.status}`);
        const body = await response.json();
        badgeUsers = Object.fromEntries(Object.entries(body?.users || {}).map(([id, badges]) => [
            id,
            (Array.isArray(badges) ? badges : []).filter(badge =>
                badge?.badge && badge?.tooltip && badge.mod !== "vencord" && badge.mod !== "equicord"
            ),
        ]));
        visibleUsers.forEach(invalidateBadges);
    }

    function profileBadges(userId) {
        const profile = storage.profiles[userId] || {};
        const custom = profile.badges || [];
        const global = storage.globalBadges ? badgeUsers[userId] || [] : [];
        const flags = Number(profile.badgeFlags) || 0;
        const flagBadges = badgeDefinitions.filter(([flag]) => flags & flag).map(([flag, label, hash]) => ({
            id: `profiletools-flag-${userId}-${flag}`,
            label,
            url: `https://cdn.discordapp.com/badge-icons/${hash}.png`,
        }));
        const specialBadges = (profile.specialBadgeIds || []).map(id => {
            const definition = specialBadgeDefinitions[id];
            if (!definition) return null;
            const label = id === "oldname" && profile.oldName
                ? `Originally known as ${profile.oldName}`
                : id === "gifting_level" && profile.levelReached
                    ? `Level ${profile.levelReached} Reached`
                    : definition[0];
            return {
                id: `profiletools-special-${userId}-${id}`,
                label,
                url: `https://cdn.discordapp.com/badge-icons/${definition[1]}.png`,
            };
        }).filter(Boolean);
        return [
            ...custom.map((badge, index) => ({
                id: `profiletools-custom-${userId}-${badge.id || index}`,
                label: badge.label,
                url: badge.url,
            })),
            ...global.map((badge, index) => ({
                id: `profiletools-global-${userId}-${index}`,
                label: labelFor(badge),
                url: badge.badge,
            })),
            ...flagBadges,
            ...specialBadges,
        ];
    }

    function patchBadgeElement(_Component, element) {
        const props = badgeProps.get(element?.props?.id);
        if (props) Object.assign(element.props, props);
        return element;
    }

    function invalidateBadges(userId) {
        if (userId) FluxDispatcher.dispatch({ type: "USER_UPDATE", user: { id: userId } });
    }

    function customDecorationUrl(options, original) {
        const data = options?.avatarDecorationData || options?.avatarDecoration || options;
        const userId = options?.userId;
        const matching = userId && storage.profiles[userId]?.decorationAsset
            ? storage.profiles[userId].decorationAsset
            : Object.values(storage.profiles).map(profile => profile?.decorationAsset).find(asset =>
                asset && (asset === data?.asset || asset === data?.skuId)
            );
        if (!matching) return original;
        const animated = options?.canAnimate ?? options?.animated ?? true;
        return `https://cdn.discordapp.com/media/v1/collectibles-shop/${matching}/${animated ? "animated" : "static"}`;
    }

    function parseColor(value) {
        const normalized = value.trim().replace(/^#/, "");
        if (!normalized) return undefined;
        const parsed = Number.parseInt(normalized, 16);
        return Number.isFinite(parsed) ? parsed : undefined;
    }

    function badgesToText(badges) {
        return (badges || []).map(badge => `${badge.label}|${badge.url}`).join("\n");
    }

    function parseBadges(value) {
        return value.split("\n").map(line => {
            const separator = line.indexOf("|");
            if (separator < 1) return null;
            const badge = { label: line.slice(0, separator).trim(), url: line.slice(separator + 1).trim() };
            return badge.label && badge.url ? badge : null;
        }).filter(Boolean);
    }

    function connectionsToText(connections) {
        return (connections || []).map(item => `${item.platform || "domain"}|${item.name || ""}|${item.url || ""}`).join("\n");
    }

    function parseConnections(value) {
        return value.split("\n").map(line => {
            const [platform, name, ...urlParts] = line.split("|");
            const url = urlParts.join("|").trim();
            if (!name?.trim()) return null;
            return { platform: platform?.trim() || "domain", name: name.trim(), url: url || undefined };
        }).filter(Boolean);
    }

    function Field({ label, value, onChangeText, placeholder, multiline, keyboardType }) {
        return h(View, null,
            h(Text, { style: styles.label }, label),
            h(TextInput, {
                style: [styles.input, multiline && { minHeight: 76, textAlignVertical: "top" }],
                value, onChangeText, placeholder, placeholderTextColor: "#6d6f78",
                multiline, keyboardType, autoCapitalize: "none",
            })
        );
    }

    function ActionButton({ text, onPress, disabled, variant }) {
        return h(Pressable, {
            onPress, disabled,
            style: [styles.button, variant === "secondary" && styles.secondaryButton,
                variant === "danger" && styles.dangerButton, disabled && styles.disabled],
        }, h(Text, { style: styles.buttonText }, text));
    }

    function Toggle({ label, value, onValueChange }) {
        return h(View, { style: styles.row },
            h(Text, { style: styles.rowText }, label),
            h(Switch, { value, onValueChange })
        );
    }

    function Settings() {
        useProxy(storage);
        const currentId = UserStore.getCurrentUser?.()?.id || "";
        const [userId, setUserId] = React.useState(currentId);
        const [activeUserId, setActiveUserId] = React.useState(currentId);
        const initial = storage.profiles[currentId] || {};
        const [draft, setDraft] = React.useState({ ...initial });
        const [badgeText, setBadgeText] = React.useState(badgesToText(initial.badges));
        const [connectionText, setConnectionText] = React.useState(connectionsToText(initial.connections));
        const normalizedUserId = userId.trim();
        const validUserId = /^\d{15,22}$/.test(normalizedUserId);
        const selected = validUserId && activeUserId === normalizedUserId;
        const update = (key, value) => setDraft(previous => ({ ...previous, [key]: value || undefined }));

        const loadProfile = async () => {
            if (!validUserId) return showToast("ProfileTools: Invalid user ID");
            await fetchUser(normalizedUserId);
            const saved = storage.profiles[normalizedUserId] || {};
            setActiveUserId(normalizedUserId);
            setDraft({ ...saved });
            setBadgeText(badgesToText(saved.badges));
            setConnectionText(connectionsToText(saved.connections));
            showToast("ProfileTools: Profile loaded");
        };

        const reloadBadges = async () => {
            try {
                await refreshGlobalBadges();
                invalidateBadges(activeUserId);
                showToast("ProfileTools: Global badges refreshed");
            } catch (error) {
                showToast(`ProfileTools: ${String(error)}`);
            }
        };

        return h(ScrollView, { style: styles.screen, contentContainerStyle: styles.content },
            h(View, { style: styles.section },
                h(Text, { style: styles.title }, "Global Badges"),
                h(Toggle, {
                    label: "Show Global Badges", value: Boolean(storage.globalBadges),
                    onValueChange: value => { storage.globalBadges = value; void reloadBadges(); },
                }),
                h(Field, { label: "API URL", value: storage.apiUrl || "", onChangeText: value => storage.apiUrl = value }),
                h(Pressable, {
                    onPress: () => {
                        storage.showModName = storage.showModName === "none" ? "prefix" : storage.showModName === "prefix" ? "suffix" : "none";
                        invalidateBadges(activeUserId);
                    },
                }, h(Text, { style: styles.rowText }, `Client name style: ${storage.showModName}`)),
                h(ActionButton, { text: "Refresh badges", variant: "secondary", onPress: () => void reloadBadges() })
            ),
            h(View, { style: styles.section },
                h(Text, { style: styles.title }, "Select profile by User ID"),
                h(Field, {
                    label: "Discord User ID", value: userId, onChangeText: setUserId,
                    placeholder: "Enter a Discord user ID", keyboardType: "numeric",
                }),
                !validUserId && userId ? h(Text, { style: styles.warning }, "User ID must contain 15–22 digits.") : null,
                validUserId && !selected ? h(Text, { style: styles.warning }, "Load this user ID before editing or saving.") : null,
                h(ActionButton, { text: "Load saved profile", variant: "secondary", disabled: !validUserId, onPress: () => void loadProfile() })
            ),
            h(View, { style: styles.section },
                h(Text, { style: styles.title }, `Custom Profile — ${activeUserId || "No user selected"}`),
                h(Text, { style: styles.hint }, "Changes are local to this device and do not modify the Discord account."),
                h(Field, { label: "Username", value: draft.username || "", onChangeText: value => update("username", value) }),
                h(Field, { label: "Display name", value: draft.globalName || "", onChangeText: value => update("globalName", value) }),
                h(Field, { label: "Avatar URL", value: draft.avatar || "", onChangeText: value => update("avatar", value) }),
                h(Field, { label: "Banner URL", value: draft.banner || "", onChangeText: value => update("banner", value) }),
                h(Field, { label: "Bio", value: draft.bio || "", multiline: true, onChangeText: value => update("bio", value) }),
                h(Field, { label: "Pronouns", value: draft.pronouns || "", onChangeText: value => update("pronouns", value) }),
                h(Field, {
                    label: "Accent color (hex)",
                    value: draft.accentColor === undefined ? "" : draft.accentColor.toString(16).padStart(6, "0"),
                    placeholder: "5865f2", onChangeText: value => setDraft(previous => ({ ...previous, accentColor: parseColor(value) })),
                }),
                h(Text, { style: styles.title }, "Cosmetics & Badges"),
                h(Field, {
                    label: "Avatar decoration Asset/SKU ID",
                    value: draft.decorationAsset || "",
                    placeholder: "1144307957425778779",
                    keyboardType: "numeric",
                    onChangeText: value => update("decorationAsset", value.trim()),
                }),
                h(Field, {
                    label: "Profile effect SKU ID",
                    value: draft.profileEffectId || "",
                    placeholder: "1139323092645183591",
                    keyboardType: "numeric",
                    onChangeText: value => update("profileEffectId", value.trim()),
                }),
                h(Field, {
                    label: "Discord badge flags (decimal; combine by addition)",
                    value: draft.badgeFlags === undefined ? "" : String(draft.badgeFlags),
                    placeholder: "4194304 = Active Developer",
                    keyboardType: "numeric",
                    onChangeText: value => setDraft(previous => ({ ...previous, badgeFlags: value.trim() ? Number.parseInt(value, 10) || 0 : undefined })),
                }),
                h(Text, { style: styles.hint }, "Flags: Staff 1, Partner 2, HypeSquad 4, Bug Hunter 8/16384, Bravery 64, Brilliance 128, Balance 256, Early Supporter 512, Verified Developer 131072, Former Moderator 262144, Active Developer 4194304."),
                h(Field, {
                    label: "Special badge IDs (comma-separated)",
                    value: (draft.specialBadgeIds || []).join(", "),
                    placeholder: "quest, orbs, oldname, gifting_icon, gifting_level",
                    onChangeText: value => setDraft(previous => ({
                        ...previous,
                        specialBadgeIds: value.split(",").map(item => item.trim()).filter(item => specialBadgeDefinitions[item]),
                    })),
                }),
                (draft.specialBadgeIds || []).includes("oldname") ? h(Field, {
                    label: "Old username badge text", value: draft.oldName || "", placeholder: "OldUser#0000",
                    onChangeText: value => update("oldName", value),
                }) : null,
                (draft.specialBadgeIds || []).includes("gifting_level") ? h(Field, {
                    label: "Level reached", value: String(draft.levelReached || 1), keyboardType: "numeric",
                    onChangeText: value => setDraft(previous => ({ ...previous, levelReached: Number.parseInt(value, 10) || 1 })),
                }) : null,
                h(Field, {
                    label: "Custom badges (one Name|URL per line)", value: badgeText,
                    multiline: true, placeholder: "My Badge|https://example.com/badge.png", onChangeText: setBadgeText,
                }),
                h(Text, { style: styles.title }, "Custom Connections"),
                h(Text, { style: styles.hint }, "One connection per line: platform|display name|URL. Examples: github|xVanDat|https://github.com/xVanDat or domain|My Site|https://example.com"),
                h(Field, {
                    label: "Connections", value: connectionText, multiline: true,
                    placeholder: "github|xVanDat|https://github.com/xVanDat",
                    onChangeText: setConnectionText,
                }),
                h(ActionButton, {
                    text: "Save and apply", disabled: !selected,
                    onPress: () => {
                        storage.profiles[normalizedUserId] = {
                            ...draft,
                            badges: parseBadges(badgeText),
                            connections: parseConnections(connectionText),
                        };
                        refreshProfiles(normalizedUserId);
                        invalidateBadges(normalizedUserId);
                        showToast("ProfileTools: Profile applied");
                    },
                }),
                h(ActionButton, {
                    text: "Delete custom profile", variant: "danger",
                    disabled: !selected || !storage.profiles[normalizedUserId],
                    onPress: () => {
                        delete storage.profiles[normalizedUserId];
                        setDraft({});
                        setBadgeText("");
                        setConnectionText("");
                        refreshProfiles(normalizedUserId);
                        invalidateBadges(normalizedUserId);
                    },
                })
            )
        );
    }

    return {
        onLoad() {
            try {
                unpatches = [];
                patchAfter(UserStore, "getUser", (_args, user) => applyUser(user));
                patchAfter(UserStore, "getCurrentUser", (_args, user) => applyUser(user));
                patchAfter(UserProfileStore, "getUserProfile", ([userId], profile) => applyProfile(profile, userId));
                patchAfter(UserProfileStore, "getGuildMemberProfile", ([userId], profile) => applyProfile(profile, userId));
                patchAfter(decorationModule, "getAvatarDecorationURL", ([options], original) => customDecorationUrl(options, original));
                patchAfter(useBadgesModule, "default", ([user], result) => {
                    const userId = user?.userId || user?.id;
                    if (!userId || !Array.isArray(result)) return;
                    visibleUsers.add(userId);
                    for (const badge of profileBadges(userId)) {
                        badgeProps.set(badge.id, { id: badge.id, source: { uri: badge.url }, label: badge.label, userId });
                        if (!result.some(item => item?.id === badge.id)) {
                            result.unshift({ id: badge.id, description: badge.label, icon: " _" });
                        }
                    }
                });
                patchAfter(jsxRuntime, "jsx", ([Component], element) => patchBadgeElement(Component, element));
                patchAfter(jsxRuntime, "jsxs", ([Component], element) => patchBadgeElement(Component, element));
                if (storage.globalBadges) void refreshGlobalBadges().catch(error => vendetta.logger.error(error));
                badgeTimer = setInterval(() => {
                    if (storage.globalBadges) void refreshGlobalBadges().catch(error => vendetta.logger.error(error));
                }, 30 * 60 * 1000);
            } catch (error) {
                vendetta.logger.error("ProfileTools: startup failed", error);
                try { showToast(`ProfileTools startup warning: ${String(error)}`); } catch { }
            }
        },
        onUnload() {
            unpatches.forEach(unpatch => unpatch?.());
            unpatches = [];
            if (badgeTimer) clearInterval(badgeTimer);
            badgeTimer = undefined;
            restoreMap(userOriginals);
            restoreMap(profileOriginals);
            badgeProps.clear();
            visibleUsers.clear();
        },
        settings: Settings,
    };
    } catch (error) {
        const message = `ProfileTools initialization failed: ${String(error)}`;
        try { vendetta.logger.error(message, error); } catch { }
        return {
            onLoad() {
                try { vendetta.ui.toasts.showToast(message); } catch { }
            },
            onUnload() { },
            settings: () => null,
        };
    }
};
