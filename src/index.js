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

    const userOriginals = new Map();
    const profileOriginals = new Map();
    const badgeProps = new Map();
    const visibleUsers = new Set();
    const visualKeys = [
        "username", "globalName", "avatar", "banner", "bio", "pronouns",
        "accentColor", "publicFlags", "premiumType",
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
        return profile && values ? rememberAndAssign(profile, values, profileOriginals) : profile;
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
        const custom = storage.profiles[userId]?.badges || [];
        const global = storage.globalBadges ? badgeUsers[userId] || [] : [];
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
        ];
    }

    function patchBadgeElement(Component, element) {
        if (typeof Component !== "function" || !["ProfileBadge", "RenderedBadge"].includes(Component.name)) return;
        const props = badgeProps.get(element?.props?.id);
        if (props) Object.assign(element.props, props);
    }

    function invalidateBadges(userId) {
        if (userId) FluxDispatcher.dispatch({ type: "USER_UPDATE", user: { id: userId } });
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
                h(Field, {
                    label: "Custom badges (one Name|URL per line)", value: badgeText,
                    multiline: true, placeholder: "My Badge|https://example.com/badge.png", onChangeText: setBadgeText,
                }),
                h(ActionButton, {
                    text: "Save and apply", disabled: !selected,
                    onPress: () => {
                        storage.profiles[normalizedUserId] = { ...draft, badges: parseBadges(badgeText) };
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
