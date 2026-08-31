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
        var decorationModule = vendetta.metro.findByProps("getAvatarDecorationURL");
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
        var badgeDefinitions = [
            [
                1,
                "Discord Staff",
                "5e74e9b61934fc1f67c65515d1f7e60d"
            ],
            [
                2,
                "Partnered Server Owner",
                "3f9748e53446a137a052f3454e2de41e"
            ],
            [
                4,
                "HypeSquad Events",
                "bf01d1073931f921909045f3a39fd264"
            ],
            [
                8,
                "Bug Hunter Level 1",
                "2717692c7dca7289b35297368a940dd0"
            ],
            [
                64,
                "HypeSquad Bravery",
                "8a88d63823d8a71cd5e390baa45efa02"
            ],
            [
                128,
                "HypeSquad Brilliance",
                "011940fd013da3f7fb926e4a1cd2e618"
            ],
            [
                256,
                "HypeSquad Balance",
                "3aa41de486fa12454c3761e8e223442e"
            ],
            [
                512,
                "Early Supporter",
                "7060786766c9c840eb3019e725d2b358"
            ],
            [
                16384,
                "Bug Hunter Level 2",
                "848f79194d4be5ff5f81505cbd0ce1e6"
            ],
            [
                131072,
                "Early Verified Bot Developer",
                "6df5892e0f35b051f8b61eace34f4967"
            ],
            [
                262144,
                "Former Discord Moderator",
                "fee1624003e2fee35cb398e125dc479b"
            ],
            [
                4194304,
                "Active Developer",
                "6bdc42827a38498929a4920da12695d9"
            ]
        ];
        var specialBadgeDefinitions = {
            quest: [
                "Completed a Quest",
                "7d9ae358c8c5e118768335dbe68b4fb8"
            ],
            orbs: [
                "Orbs — Apprentice",
                "83d8a1eb09a8d64e59233eec5d4d5c2d"
            ],
            oldname: [
                "Originally Known As",
                "6de6d34650760ba5551a79732e98ed60"
            ],
            gifting_icon: [
                "Gifting Icon",
                "64f2413c9b9803661322aaad25826b62"
            ],
            gifting_patron: [
                "Gifting Patron",
                "ac305d1b9481f312ce4419e7f8296558"
            ],
            gifting_champion: [
                "Gifting Champion",
                "8b7792c4f65953d3ff564f23429cb79e"
            ],
            gifting_luminary: [
                "Gifting Luminary",
                "3119f5504b2cd09576a323908c7c3517"
            ],
            gifting_hero: [
                "Gifting Hero",
                "77d65b1f210014a11eb1582ee06ab684"
            ],
            gifting_legend: [
                "Gifting Legend",
                "7fe346cfc5da1340087d8759a9e7a395"
            ],
            gifting_level: [
                "Level Reached",
                "ca105ad9cfc8580c765101d17bbb2323"
            ]
        };
        var nitroBadges = [
            [
                "Nitro",
                "2ba85e8026a8614b640c2837bcdfe21b",
                0
            ],
            [
                "Bronze",
                "4f33c4a9c64ce221936bd256c356f91f",
                1
            ],
            [
                "Silver",
                "4514fab914bdbfb4ad2fa23df76121a6",
                3
            ],
            [
                "Gold",
                "2895086c18d5531d499862e41d1155a6",
                6
            ],
            [
                "Platinum",
                "0334688279c8359120922938dcb1d6f8",
                12
            ],
            [
                "Diamond",
                "0d61871f72bb9a33a7ae568c1fb4f20a",
                24
            ],
            [
                "Emerald",
                "11e2d339068b55d3a506cff34d3780f3",
                36
            ],
            [
                "Ruby",
                "cd5e2cfd9d7f27a8cdcd3e8a8d5dc9f4",
                60
            ],
            [
                "Opal",
                "5b154df19c53dce2af92c9b61e6be5e2",
                72
            ]
        ];
        var boostBadges = [
            [
                "1 Month Server Booster",
                "51040c70d4f20a921ad6674ff86fc95c",
                1
            ],
            [
                "2 Month Server Booster",
                "0e4080d1d333bc7ad29ef6528b6f2fb7",
                2
            ],
            [
                "3 Month Server Booster",
                "72bed924410c304dbe3d00a6e593ff59",
                3
            ],
            [
                "6 Month Server Booster",
                "df199d2050d3ed4ebf84d64ae83989f8",
                6
            ],
            [
                "9 Month Server Booster",
                "996b3e870e8a22ce519b3a50e6bdd52f",
                9
            ],
            [
                "12 Month Server Booster",
                "991c9f39ee33d7537d9f408c3e53141e",
                12
            ],
            [
                "15 Month Server Booster",
                "cb3ae83c15e970e8f3d410bc62cb8b99",
                15
            ],
            [
                "18 Month Server Booster",
                "7142225d31238f6387d9f09efaa02759",
                18
            ],
            [
                "24 Month Server Booster",
                "ec92202290b48d0879b7413d2dde3bab",
                24
            ]
        ];
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
            "flags",
            "premiumType",
            "avatarDecoration",
            "avatarDecorationData",
            "profileEffectId",
            "profileEffect",
            "premiumSince",
            "premiumGuildSince",
            "themeColors"
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
            if (custom.badgeFlags !== undefined) {
                values.publicFlags = Number(custom.badgeFlags) || 0;
                values.flags = Number(custom.badgeFlags) || 0;
            }
            if (custom.decorationAsset) {
                values.avatarDecoration = null;
                values.avatarDecorationData = {
                    asset: custom.decorationAsset,
                    skuId: custom.decorationAsset
                };
            }
            if (custom.profileEffectId) {
                values.profileEffectId = custom.profileEffectId;
                values.profileEffect = {
                    expireAt: null,
                    skuId: custom.profileEffectId
                };
            }
            if (custom.nitro) {
                var nitroLevel = Math.max(0, Math.min(nitroBadges.length - 1, Number(custom.nitroLevel) || 0));
                var nitroDate = new Date();
                nitroDate.setMonth(nitroDate.getMonth() - nitroBadges[nitroLevel][2]);
                values.premiumType = 2;
                values.premiumSince = nitroDate.toISOString();
                if (custom.boostLevel !== undefined && Number(custom.boostLevel) >= 0) {
                    var boostLevel = Math.max(0, Math.min(boostBadges.length - 1, Number(custom.boostLevel) || 0));
                    var boostDate = new Date();
                    boostDate.setMonth(boostDate.getMonth() - boostBadges[boostLevel][2]);
                    values.premiumGuildSince = boostDate.toISOString();
                }
                if (custom.accentColor !== undefined) {
                    values.themeColors = [
                        custom.accentColor,
                        custom.accentColor2 ?? custom.accentColor
                    ];
                }
            }
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
            if (!profile || !values) return profile;
            var custom = storage.profiles[userId] || {};
            var merged = {
                ...profile
            };
            for (var key of visualKeys){
                if (values[key] !== undefined) merged[key] = values[key];
            }
            if (Array.isArray(custom.connections) && custom.connections.length) {
                var existing = (profile.connectedAccounts || profile.connected_accounts || []).filter(function(item) {
                    return !item?._profileTools;
                });
                var connections = custom.connections.map(function(item, index) {
                    return {
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
                        _profileTools: true
                    };
                });
                merged.connectedAccounts = [
                    ...existing,
                    ...connections
                ];
                merged.connected_accounts = [
                    ...existing,
                    ...connections
                ];
            }
            return merged;
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
            var profile = storage.profiles[userId] || {};
            var custom = profile.badges || [];
            var global = storage.globalBadges ? badgeUsers[userId] || [] : [];
            var flags = Number(profile.badgeFlags) || 0;
            var flagBadges = badgeDefinitions.filter(function([flag]) {
                return flags & flag;
            }).map(function([flag, label, hash]) {
                return {
                    id: `profiletools-flag-${userId}-${flag}`,
                    label,
                    url: `https://cdn.discordapp.com/badge-icons/${hash}.png`
                };
            });
            var specialBadges = (profile.specialBadgeIds || []).map(function(id) {
                var definition = specialBadgeDefinitions[id];
                if (!definition) return null;
                var label = id === "oldname" && profile.oldName ? `Originally known as ${profile.oldName}` : id === "gifting_level" && profile.levelReached ? `Level ${profile.levelReached} Reached` : definition[0];
                return {
                    id: `profiletools-special-${userId}-${id}`,
                    label,
                    url: `https://cdn.discordapp.com/badge-icons/${definition[1]}.png`
                };
            }).filter(Boolean);
            var premiumBadges = [];
            if (profile.nitro) {
                var nitroLevel = Math.max(0, Math.min(nitroBadges.length - 1, Number(profile.nitroLevel) || 0));
                var nitro = nitroBadges[nitroLevel];
                premiumBadges.push({
                    id: `profiletools-nitro-${userId}-${nitroLevel}`,
                    label: `${nitro[0]} (${nitro[2]} months)`,
                    url: `https://cdn.discordapp.com/badge-icons/${nitro[1]}.png`
                });
                if (profile.boostLevel !== undefined && Number(profile.boostLevel) >= 0) {
                    var boostLevel = Math.max(0, Math.min(boostBadges.length - 1, Number(profile.boostLevel) || 0));
                    var boost = boostBadges[boostLevel];
                    premiumBadges.push({
                        id: `profiletools-boost-${userId}-${boostLevel}`,
                        label: boost[0],
                        url: `https://cdn.discordapp.com/badge-icons/${boost[1]}.png`
                    });
                }
            }
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
                }),
                ...flagBadges,
                ...specialBadges,
                ...premiumBadges
            ];
        }
        function patchBadgeElement(_Component, element) {
            var props = badgeProps.get(element?.props?.id);
            if (props) Object.assign(element.props, props);
            return element;
        }
        function invalidateBadges(userId) {
            if (userId) FluxDispatcher.dispatch({
                type: "USER_UPDATE",
                user: {
                    id: userId
                }
            });
        }
        function customDecorationUrl(options, original) {
            var data = options?.avatarDecorationData || options?.avatarDecoration || options;
            var userId = options?.userId;
            var matching = userId && storage.profiles[userId]?.decorationAsset ? storage.profiles[userId].decorationAsset : Object.values(storage.profiles).map(function(profile) {
                return profile?.decorationAsset;
            }).find(function(asset) {
                return asset && (asset === data?.asset || asset === data?.skuId);
            });
            if (!matching) return original;
            var animated = options?.canAnimate ?? options?.animated ?? true;
            return `https://cdn.discordapp.com/media/v1/collectibles-shop/${matching}/${animated ? "animated" : "static"}`;
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
        function connectionsToText(connections) {
            return (connections || []).map(function(item) {
                return `${item.platform || "domain"}|${item.name || ""}|${item.url || ""}`;
            }).join("\n");
        }
        function parseConnections(value) {
            return value.split("\n").map(function(line) {
                var [platform, name, ...urlParts] = line.split("|");
                var url = urlParts.join("|").trim();
                if (!name?.trim()) return null;
                return {
                    platform: platform?.trim() || "domain",
                    name: name.trim(),
                    url: url || undefined
                };
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
            var [connectionText, setConnectionText] = React.useState(connectionsToText(initial.connections));
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
                    setConnectionText(connectionsToText(saved.connections));
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
            }), h(Text, {
                style: styles.title
            }, "Cosmetics & Badges"), h(Toggle, {
                label: "Spoof Nitro",
                value: Boolean(draft.nitro),
                onValueChange: function onValueChange(value) {
                    return setDraft(function(previous) {
                        return {
                            ...previous,
                            nitro: value
                        };
                    });
                }
            }), draft.nitro ? h(Field, {
                label: "Evolving Nitro level (0–8)",
                value: String(draft.nitroLevel ?? 0),
                placeholder: "0 = Nitro, 8 = Opal",
                keyboardType: "numeric",
                onChangeText: function onChangeText(value) {
                    return setDraft(function(previous) {
                        return {
                            ...previous,
                            nitroLevel: Math.max(0, Math.min(8, Number.parseInt(value, 10) || 0))
                        };
                    });
                }
            }) : null, draft.nitro ? h(Field, {
                label: "Server Booster level (-1 = none, 0–8)",
                value: String(draft.boostLevel ?? -1),
                placeholder: "-1 = none, 0 = 1 month, 8 = 24 months",
                onChangeText: function onChangeText(value) {
                    return setDraft(function(previous) {
                        return {
                            ...previous,
                            boostLevel: value.trim() === "-1" || !value.trim() ? -1 : Math.max(0, Math.min(8, Number.parseInt(value, 10) || 0))
                        };
                    });
                }
            }) : null, draft.nitro ? h(Text, {
                style: styles.hint
            }, "Nitro level: 0 Nitro, 1 Bronze, 2 Silver, 3 Gold, 4 Platinum, 5 Diamond, 6 Emerald, 7 Ruby, 8 Opal. Booster uses levels 0–8 for 1–24 months.") : null, h(Field, {
                label: "Avatar decoration Asset/SKU ID",
                value: draft.decorationAsset || "",
                placeholder: "1144307957425778779",
                keyboardType: "numeric",
                onChangeText: function onChangeText(value) {
                    return update("decorationAsset", value.trim());
                }
            }), h(Field, {
                label: "Profile effect SKU ID",
                value: draft.profileEffectId || "",
                placeholder: "1139323092645183591",
                keyboardType: "numeric",
                onChangeText: function onChangeText(value) {
                    return update("profileEffectId", value.trim());
                }
            }), h(Field, {
                label: "Discord badge flags (decimal; combine by addition)",
                value: draft.badgeFlags === undefined ? "" : String(draft.badgeFlags),
                placeholder: "4194304 = Active Developer",
                keyboardType: "numeric",
                onChangeText: function onChangeText(value) {
                    return setDraft(function(previous) {
                        return {
                            ...previous,
                            badgeFlags: value.trim() ? Number.parseInt(value, 10) || 0 : undefined
                        };
                    });
                }
            }), h(Text, {
                style: styles.hint
            }, "Flags: Staff 1, Partner 2, HypeSquad 4, Bug Hunter 8/16384, Bravery 64, Brilliance 128, Balance 256, Early Supporter 512, Verified Developer 131072, Former Moderator 262144, Active Developer 4194304."), h(Field, {
                label: "Special badge IDs (comma-separated)",
                value: (draft.specialBadgeIds || []).join(", "),
                placeholder: "quest, orbs, oldname, gifting_icon, gifting_level",
                onChangeText: function onChangeText(value) {
                    return setDraft(function(previous) {
                        return {
                            ...previous,
                            specialBadgeIds: value.split(",").map(function(item) {
                                return item.trim();
                            }).filter(function(item) {
                                return specialBadgeDefinitions[item];
                            })
                        };
                    });
                }
            }), (draft.specialBadgeIds || []).includes("oldname") ? h(Field, {
                label: "Old username badge text",
                value: draft.oldName || "",
                placeholder: "OldUser#0000",
                onChangeText: function onChangeText(value) {
                    return update("oldName", value);
                }
            }) : null, (draft.specialBadgeIds || []).includes("gifting_level") ? h(Field, {
                label: "Level reached",
                value: String(draft.levelReached || 1),
                keyboardType: "numeric",
                onChangeText: function onChangeText(value) {
                    return setDraft(function(previous) {
                        return {
                            ...previous,
                            levelReached: Number.parseInt(value, 10) || 1
                        };
                    });
                }
            }) : null, h(Field, {
                label: "Custom badges (one Name|URL per line)",
                value: badgeText,
                multiline: true,
                placeholder: "My Badge|https://example.com/badge.png",
                onChangeText: setBadgeText
            }), h(Text, {
                style: styles.title
            }, "Custom Connections"), h(Text, {
                style: styles.hint
            }, "One connection per line: platform|display name|URL. Examples: github|xVanDat|https://github.com/xVanDat or domain|My Site|https://example.com"), h(Field, {
                label: "Connections",
                value: connectionText,
                multiline: true,
                placeholder: "github|xVanDat|https://github.com/xVanDat",
                onChangeText: setConnectionText
            }), h(ActionButton, {
                text: "Save and apply",
                disabled: !selected,
                onPress: function onPress() {
                    storage.profiles[normalizedUserId] = {
                        ...draft,
                        badges: parseBadges(badgeText),
                        connections: parseConnections(connectionText)
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
                    setConnectionText("");
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
                    patchAfter(UserProfileStore, "getGuildMemberProfile", function([userId], profile) {
                        return applyProfile(profile, userId);
                    });
                    patchAfter(decorationModule, "getAvatarDecorationURL", function([options], original) {
                        return customDecorationUrl(options, original);
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