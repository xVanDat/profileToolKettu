# ProfileTools for Kettu

A standalone public plugin for the Kettu Android Discord client.

## Features

- Customize a local profile by entering any Discord user ID.
- Override username, display name, avatar, banner, bio, pronouns, accent color, public flags, and premium type.
- Add custom profile badges from image URLs.
- Display global badges from the Equicord badges API.
- No account switcher, Fake User, or Replace User hooks.

All profile changes are local to your device. The plugin does not modify Discord accounts or send profile changes to Discord.

## Install

1. In Kettu, enable **Settings → General → Developer Settings**.
2. Open **Settings → Plugins** and choose **Install a plugin**.
3. Paste this URL:

   ```text
   https://raw.githubusercontent.com/xVanDat/profileToolKettu/main/
   ```

4. Accept the unproxied-plugin warning and install.
5. Open the ProfileTools settings, enter a Discord user ID, then load and edit its local profile.

## Updating

Keep automatic plugin updates enabled in Kettu. Kettu checks `manifest.json` and downloads a new `index.js` whenever the manifest hash changes.

## License

GPL-3.0-or-later. This is a mobile adaptation of the original Equicord/Vencord ProfileTools plugin.
