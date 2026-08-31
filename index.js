(function () {
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) resolve(value);
    else Promise.resolve(value).then(_next, _throw);
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
var __profileToolsPlugin = function __profileToolsPlugin() {
    try {
        var React = vendetta.metro.common.React;
        var ReactNative = vendetta.metro.common.ReactNative;
        var { ScrollView, View, Text, TextInput, Switch, Pressable, StyleSheet } = ReactNative;
        var { after } = vendetta.patcher;
        var { FluxDispatcher } = vendetta.metro.common;
        var UserStore = vendetta.metro.findByStoreName("UserStore");
        var UserProfileStore = vendetta.metro.findByStoreName("UserProfileStore");
        var profileActions = vendetta.metro.findByProps("getUser", "fetchProfile");
        var useBadgesModule = vendetta.metro.findByName("useBadges", false);
        var jsxRuntime = vendetta.metro.findByProps("jsx", "jsxs");
        var storage = vendetta.plugin.storage;
        var useProxy = vendetta.storage.useProxy;
        var showToast = vendetta.ui.toasts.showToast;
        var h = React.createElement;
        var defaults = {
            apiUrl: "https://badges.equicord.org/",
            globalBadges: true,
            showModName: "none",
            profiles: {}
        };
        for (var [key, value] of Object.entries(defaults)){
            if (storage[key] === undefined) storage[key] = value;
        }
        if (!storage.profiles || typeof storage.profiles !== "object") storage.profiles = {};
        var styles = StyleSheet.create({
            screen: {
                flex: 1
            },
            content: {
                padding: 14,
                paddingBottom: 40,
                gap: 18
            },
            section: {
                backgroundColor: "#1e1f22",
                borderRadius: 14,
                padding: 14,
                gap: 12
            },
            title: {
                color: "#f2f3f5",
                fontSize: 18,
                fontWeight: "700"
            },
            label: {
                color: "#b5bac1",
                fontSize: 13,
                fontWeight: "600",
                marginBottom: 5
            },
            hint: {
                color: "#949ba4",
                fontSize: 12,
                lineHeight: 17
            },
            input: {
                color: "#f2f3f5",
                backgroundColor: "#111214",
                borderRadius: 9,
                paddingHorizontal: 12,
                paddingVertical: 10
            },
            row: {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12
            },
            rowText: {
                color: "#f2f3f5",
                fontSize: 15,
                flex: 1
            },
            button: {
                backgroundColor: "#5865f2",
                borderRadius: 9,
                paddingHorizontal: 14,
                paddingVertical: 11,
                alignItems: "center"
            },
            secondaryButton: {
                backgroundColor: "#4e5058"
            },
            dangerButton: {
                backgroundColor: "#da373c"
            },
            disabled: {
                opacity: 0.45
            },
            buttonText: {
                color: "#ffffff",
                fontWeight: "700"
            },
            warning: {
                color: "#f0b232",
                fontSize: 12
            }
        });
        var serviceNames = {
            badgevault: "BadgeVault",
            nekocord: "Nekocord",
            reviewdb: "ReviewDB",
            aero: "Aero",
            aliucord: "Aliucord",
            raincord: "Raincord",
            velocity: "Velocity",
            enmity: "Enmity",
            paicord: "Paicord",
            bunny: "Bunny",
            goosemod: "GooseMod",
            replugged: "Replugged",
            betterdiscord: "BetterDiscord",
            vendroidenhanced: "Vendroid Enhanced",
            revenge: "Revenge",
            record: "ReCord"
        };
        var userOriginals = new Map();
        var profileOriginals = new Map();
        var badgeProps = new Map();
        var visibleUsers = new Set();
        var visualKeys = [
            "username",
            "globalName",
            "avatar",
            "banner",
            "bio",
            "pronouns",
            "accentColor",
            "publicFlags",
            "premiumType"
        ];
        var assignableKeys = [
            ...visualKeys,
            "getAvatarURL",
            "getBannerURL"
        ];
        var badgeUsers = {};
        var unpatches = [];
        var badgeTimer;
        function patchAfter(parent, method, callback) {
            if (!parent || typeof parent[method] !== "function") return;
            try {
                var unpatch = after(method, parent, callback);
                if (typeof unpatch === "function") unpatches.push(unpatch);
            } catch (error) {
                vendetta.logger.error(`ProfileTools: failed to patch ${method}`, error);
            }
        }
        function rememberAndAssign(target, values, originals) {
            if (!target || !values) return target;
            var saved = originals.get(target);
            if (!saved) originals.set(target, saved = {});
            for (var key of assignableKeys){
                if (values[key] === undefined) continue;
                if (!(key in saved)) saved[key] = target[key];
                try {
                    target[key] = values[key];
                } catch (unused) {}
            }
            return target;
        }
        function customValues(userId) {
            var custom = storage.profiles[userId];
            if (!custom) return;
            var values = {
                ...custom
            };
            if (custom.avatar?.startsWith("http")) values.getAvatarURL = function() {
                return custom.avatar;
            };
            if (custom.banner?.startsWith("http")) values.getBannerURL = function() {
                return custom.banner;
            };
            return values;
        }
        function applyUser(user) {
            var values = user?.id && customValues(user.id);
            return values ? rememberAndAssign(user, values, userOriginals) : user;
        }
        function applyProfile(profile, userId) {
            var values = customValues(userId);
            return profile && values ? rememberAndAssign(profile, values, profileOriginals) : profile;
        }
        function restoreMap(originals) {
            for (var [target, values] of originals){
                for (var [key, value] of Object.entries(values)){
                    try {
                        target[key] = value;
                    } catch (unused) {}
                }
            }
            originals.clear();
        }
        function fetchUser(userId) {
            return _async_to_generator(function*() {
                try {
                    yield profileActions?.getUser?.(userId);
                } catch (unused) {}
                try {
                    yield profileActions?.fetchProfile?.(userId, {
                        withMutualGuilds: false
                    });
                } catch (unused) {}
            })();
        }
        function refreshProfiles(...userIds) {
            restoreMap(userOriginals);
            restoreMap(profileOriginals);
            var ids = new Set([
                ...Object.keys(storage.profiles),
                ...userIds
            ]);
            var current = UserStore.getCurrentUser?.();
            if (current) {
                ids.add(current.id);
                FluxDispatcher.dispatch({
                    type: "CURRENT_USER_UPDATE",
                    user: current
                });
            }
            ids.forEach(function(id) {
                return FluxDispatcher.dispatch({
                    type: "USER_UPDATE",
                    user: {
                        id
                    }
                });
            });
        }
        function labelFor(badge) {
            var service = badge.mod && (serviceNames[badge.mod] || badge.mod);
            if (!service || storage.showModName === "none") return badge.tooltip;
            return storage.showModName === "prefix" ? `${service} - ${badge.tooltip}` : `${badge.tooltip} - ${service}`;
        }
        function refreshGlobalBadges() {
            return _async_to_generator(function*() {
                if (!storage.globalBadges || !storage.apiUrl?.trim()) {
                    badgeUsers = {};
                    visibleUsers.forEach(invalidateBadges);
                    return;
                }
                var base = storage.apiUrl.endsWith("/") ? storage.apiUrl : `${storage.apiUrl}/`;
                var response = yield fetch(`${base}users`, {
                    cache: "no-cache"
                });
                if (!response.ok) throw new Error(`Global Badges HTTP ${response.status}`);
                var body = yield response.json();
                badgeUsers = Object.fromEntries(Object.entries(body?.users || {}).map(function([id, badges]) {
                    return [
                        id,
                        (Array.isArray(badges) ? badges : []).filter(function(badge) {
                            return badge?.badge && badge?.tooltip && badge.mod !== "vencord" && badge.mod !== "equicord";
                        })
                    ];
                }));
                visibleUsers.forEach(invalidateBadges);
            })();
        }
        function profileBadges(userId) {
            var custom = storage.profiles[userId]?.badges || [];
            var global = storage.globalBadges ? badgeUsers[userId] || [] : [];
            return [
                ...custom.map(function(badge, index) {
                    return {
                        id: `profiletools-custom-${userId}-${badge.id || index}`,
                        label: badge.label,
                        url: badge.url
                    };
                }),
                ...global.map(function(badge, index) {
                    return {
                        id: `profiletools-global-${userId}-${index}`,
                        label: labelFor(badge),
                        url: badge.badge
                    };
                })
            ];
        }
        function patchBadgeElement(Component, element) {
            if (typeof Component !== "function" || ![
                "ProfileBadge",
                "RenderedBadge"
            ].includes(Component.name)) return;
            var props = badgeProps.get(element?.props?.id);
            if (props) Object.assign(element.props, props);
        }
        function invalidateBadges(userId) {
            if (userId) FluxDispatcher.dispatch({
                type: "USER_UPDATE",
                user: {
                    id: userId
                }
            });
        }
        function parseColor(value) {
            var normalized = value.trim().replace(/^#/, "");
            if (!normalized) return undefined;
            var parsed = Number.parseInt(normalized, 16);
            return Number.isFinite(parsed) ? parsed : undefined;
        }
        function badgesToText(badges) {
            return (badges || []).map(function(badge) {
                return `${badge.label}|${badge.url}`;
            }).join("\n");
        }
        function parseBadges(value) {
            return value.split("\n").map(function(line) {
                var separator = line.indexOf("|");
                if (separator < 1) return null;
                var badge = {
                    label: line.slice(0, separator).trim(),
                    url: line.slice(separator + 1).trim()
                };
                return badge.label && badge.url ? badge : null;
            }).filter(Boolean);
        }
        function Field({ label, value, onChangeText, placeholder, multiline, keyboardType }) {
            return h(View, null, h(Text, {
                style: styles.label
            }, label), h(TextInput, {
                style: [
                    styles.input,
                    multiline && {
                        minHeight: 76,
                        textAlignVertical: "top"
                    }
                ],
                value,
                onChangeText,
                placeholder,
                placeholderTextColor: "#6d6f78",
                multiline,
                keyboardType,
                autoCapitalize: "none"
            }));
        }
        function ActionButton({ text, onPress, disabled, variant }) {
            return h(Pressable, {
                onPress,
                disabled,
                style: [
                    styles.button,
                    variant === "secondary" && styles.secondaryButton,
                    variant === "danger" && styles.dangerButton,
                    disabled && styles.disabled
                ]
            }, h(Text, {
                style: styles.buttonText
            }, text));
        }
        function Toggle({ label, value, onValueChange }) {
            return h(View, {
                style: styles.row
            }, h(Text, {
                style: styles.rowText
            }, label), h(Switch, {
                value,
                onValueChange
            }));
        }
        function Settings() {
            useProxy(storage);
            var currentId = UserStore.getCurrentUser?.()?.id || "";
            var [userId, setUserId] = React.useState(currentId);
            var [activeUserId, setActiveUserId] = React.useState(currentId);
            var initial = storage.profiles[currentId] || {};
            var [draft, setDraft] = React.useState({
                ...initial
            });
            var [badgeText, setBadgeText] = React.useState(badgesToText(initial.badges));
            var normalizedUserId = userId.trim();
            var validUserId = /^\d{15,22}$/.test(normalizedUserId);
            var selected = validUserId && activeUserId === normalizedUserId;
            var update = function update(key, value) {
                return setDraft(function(previous) {
                    return {
                        ...previous,
                        [key]: value || undefined
                    };
                });
            };
            var loadProfile = function loadProfile() {
                return _async_to_generator(function*() {
                    if (!validUserId) return showToast("ProfileTools: Invalid user ID");
                    yield fetchUser(normalizedUserId);
                    var saved = storage.profiles[normalizedUserId] || {};
                    setActiveUserId(normalizedUserId);
                    setDraft({
                        ...saved
                    });
                    setBadgeText(badgesToText(saved.badges));
                    showToast("ProfileTools: Profile loaded");
                })();
            };
            var reloadBadges = function reloadBadges() {
                return _async_to_generator(function*() {
                    try {
                        yield refreshGlobalBadges();
                        invalidateBadges(activeUserId);
                        showToast("ProfileTools: Global badges refreshed");
                    } catch (error) {
                        showToast(`ProfileTools: ${String(error)}`);
                    }
                })();
            };
            return h(ScrollView, {
                style: styles.screen,
                contentContainerStyle: styles.content
            }, h(View, {
                style: styles.section
            }, h(Text, {
                style: styles.title
            }, "Global Badges"), h(Toggle, {
                label: "Show Global Badges",
                value: Boolean(storage.globalBadges),
                onValueChange: function onValueChange(value) {
                    storage.globalBadges = value;
                    void reloadBadges();
                }
            }), h(Field, {
                label: "API URL",
                value: storage.apiUrl || "",
                onChangeText: function onChangeText(value) {
                    return storage.apiUrl = value;
                }
            }), h(Pressable, {
                onPress: function onPress() {
                    storage.showModName = storage.showModName === "none" ? "prefix" : storage.showModName === "prefix" ? "suffix" : "none";
                    invalidateBadges(activeUserId);
                }
            }, h(Text, {
                style: styles.rowText
            }, `Client name style: ${storage.showModName}`)), h(ActionButton, {
                text: "Refresh badges",
                variant: "secondary",
                onPress: function onPress() {
                    return void reloadBadges();
                }
            })), h(View, {
                style: styles.section
            }, h(Text, {
                style: styles.title
            }, "Select profile by User ID"), h(Field, {
                label: "Discord User ID",
                value: userId,
                onChangeText: setUserId,
                placeholder: "Enter a Discord user ID",
                keyboardType: "numeric"
            }), !validUserId && userId ? h(Text, {
                style: styles.warning
            }, "User ID must contain 15–22 digits.") : null, validUserId && !selected ? h(Text, {
                style: styles.warning
            }, "Load this user ID before editing or saving.") : null, h(ActionButton, {
                text: "Load saved profile",
                variant: "secondary",
                disabled: !validUserId,
                onPress: function onPress() {
                    return void loadProfile();
                }
            })), h(View, {
                style: styles.section
            }, h(Text, {
                style: styles.title
            }, `Custom Profile — ${activeUserId || "No user selected"}`), h(Text, {
                style: styles.hint
            }, "Changes are local to this device and do not modify the Discord account."), h(Field, {
                label: "Username",
                value: draft.username || "",
                onChangeText: function onChangeText(value) {
                    return update("username", value);
                }
            }), h(Field, {
                label: "Display name",
                value: draft.globalName || "",
                onChangeText: function onChangeText(value) {
                    return update("globalName", value);
                }
            }), h(Field, {
                label: "Avatar URL",
                value: draft.avatar || "",
                onChangeText: function onChangeText(value) {
                    return update("avatar", value);
                }
            }), h(Field, {
                label: "Banner URL",
                value: draft.banner || "",
                onChangeText: function onChangeText(value) {
                    return update("banner", value);
                }
            }), h(Field, {
                label: "Bio",
                value: draft.bio || "",
                multiline: true,
                onChangeText: function onChangeText(value) {
                    return update("bio", value);
                }
            }), h(Field, {
                label: "Pronouns",
                value: draft.pronouns || "",
                onChangeText: function onChangeText(value) {
                    return update("pronouns", value);
                }
            }), h(Field, {
                label: "Accent color (hex)",
                value: draft.accentColor === undefined ? "" : draft.accentColor.toString(16).padStart(6, "0"),
                placeholder: "5865f2",
                onChangeText: function onChangeText(value) {
                    return setDraft(function(previous) {
                        return {
                            ...previous,
                            accentColor: parseColor(value)
                        };
                    });
                }
            }), h(Field, {
                label: "Custom badges (one Name|URL per line)",
                value: badgeText,
                multiline: true,
                placeholder: "My Badge|https://example.com/badge.png",
                onChangeText: setBadgeText
            }), h(ActionButton, {
                text: "Save and apply",
                disabled: !selected,
                onPress: function onPress() {
                    storage.profiles[normalizedUserId] = {
                        ...draft,
                        badges: parseBadges(badgeText)
                    };
                    refreshProfiles(normalizedUserId);
                    invalidateBadges(normalizedUserId);
                    showToast("ProfileTools: Profile applied");
                }
            }), h(ActionButton, {
                text: "Delete custom profile",
                variant: "danger",
                disabled: !selected || !storage.profiles[normalizedUserId],
                onPress: function onPress() {
                    delete storage.profiles[normalizedUserId];
                    setDraft({});
                    setBadgeText("");
                    refreshProfiles(normalizedUserId);
                    invalidateBadges(normalizedUserId);
                }
            })));
        }
        return {
            onLoad () {
                try {
                    unpatches = [];
                    patchAfter(UserStore, "getUser", function(_args, user) {
                        return applyUser(user);
                    });
                    patchAfter(UserStore, "getCurrentUser", function(_args, user) {
                        return applyUser(user);
                    });
                    patchAfter(UserProfileStore, "getUserProfile", function([userId], profile) {
                        return applyProfile(profile, userId);
                    });
                    patchAfter(useBadgesModule, "default", function([user], result) {
                        var _loop = function(badge) {
                            badgeProps.set(badge.id, {
                                id: badge.id,
                                source: {
                                    uri: badge.url
                                },
                                label: badge.label,
                                userId
                            });
                            if (!result.some(function(item) {
                                return item?.id === badge.id;
                            })) {
                                result.unshift({
                                    id: badge.id,
                                    description: badge.label,
                                    icon: " _"
                                });
                            }
                        };
                        var userId = user?.userId || user?.id;
                        if (!userId || !Array.isArray(result)) return;
                        visibleUsers.add(userId);
                        for (var badge of profileBadges(userId))_loop(badge);
                    });
                    patchAfter(jsxRuntime, "jsx", function([Component], element) {
                        return patchBadgeElement(Component, element);
                    });
                    patchAfter(jsxRuntime, "jsxs", function([Component], element) {
                        return patchBadgeElement(Component, element);
                    });
                    if (storage.globalBadges) void refreshGlobalBadges().catch(function(error) {
                        return vendetta.logger.error(error);
                    });
                    badgeTimer = setInterval(function() {
                        if (storage.globalBadges) void refreshGlobalBadges().catch(function(error) {
                            return vendetta.logger.error(error);
                        });
                    }, 30 * 60 * 1000);
                } catch (error) {
                    vendetta.logger.error("ProfileTools: startup failed", error);
                    try {
                        showToast(`ProfileTools startup warning: ${String(error)}`);
                    } catch (unused) {}
                }
            },
            onUnload () {
                unpatches.forEach(function(unpatch) {
                    return unpatch?.();
                });
                unpatches = [];
                if (badgeTimer) clearInterval(badgeTimer);
                badgeTimer = undefined;
                restoreMap(userOriginals);
                restoreMap(profileOriginals);
                badgeProps.clear();
                visibleUsers.clear();
            },
            settings: Settings
        };
    } catch (error) {
        var message = `ProfileTools initialization failed: ${String(error)}`;
        try {
            vendetta.logger.error(message, error);
        } catch (unused) {}
        return {
            onLoad () {
                try {
                    vendetta.ui.toasts.showToast(message);
                } catch (unused) {}
            },
            onUnload () {},
            settings: function settings() {
                return null;
            }
        };
    }
};

return __profileToolsPlugin;
})()