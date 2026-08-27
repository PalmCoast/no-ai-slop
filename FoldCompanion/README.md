# Fold Companion

A private, configurable Android app that helps you route work off your phone.
Built for the **Samsung Galaxy Z Fold 7** and other Android phones. It is not an
assistant, it does not pretend to be you, and it does not touch anyone else's data.

> **This will not record calls.** There is no call recording, no background
> microphone, and no call-audio access anywhere in this app. In two-party-consent
> states (e.g. Florida), this app is built to stay on the right side of that line —
> it never records anyone.

## What it does

- **Home** — four tap-to-call buttons you configure yourself. Tapping one opens the
  phone dialer with the number filled in; you press the call button. The app never
  places the call itself.
- **Queue** — a share target. Share a Gmail/Yahoo message or a job listing into
  Fold Companion and it saves the subject, a snippet, and the first link locally,
  queued for your desktop agent. Tap **Export** to write a JSON + text file to Downloads.
- **Mail** — an optional, read-only list of new Gmail/Yahoo notifications. Off until
  you turn it on yourself in system Settings.
- **Settings** — set the label + number for all four call buttons, your name and
  emails, and your desktop agent's name (default "Reed"). Everything persists locally.

The UI is dark cream/steel. No orange. No ads. No trackers.

## Layouts (Fold 7)

The app adapts to the screen using window size classes:

- **Folded (cover screen, narrow):** single column of call buttons, bottom navigation.
- **Unfolded (inner screen, wide):** two-column button grid, side navigation rail.

## Permissions — what it asks for and what it refuses

**Declared permissions: none.** The app requests no runtime permissions.

- **No `INTERNET` permission.** The app literally cannot send data off the device.
  The only way anything leaves the phone is the file you write with **Export**.
- **No `CALL_PHONE`.** Calls use `ACTION_DIAL` (opens the dialer); the app can't dial
  on its own.
- **No storage permission.** Export uses the scoped `MediaStore` Downloads API on
  Android 10+ (the Fold 7 is well past that), so no `WRITE_EXTERNAL_STORAGE` is needed.

**One optional, user-granted access:**

- **Notification access** (`BIND_NOTIFICATION_LISTENER_SERVICE`). This is *not* a
  normal permission — you grant it by hand in
  **Settings → Notifications → Device & app notifications → (Fold Companion)**, or via
  the in-app button on the Mail screen. When on, the app reads only Gmail/Yahoo
  notification titles/previews to build a local list. It never dismisses, replies to,
  forwards, or sends anything. Turn it off anytime and the list stops updating.

### Deliberately excluded (and why)

| Not included | Why |
| --- | --- |
| Call recording / `RECORD_AUDIO` | Two-party consent. Never record other people. |
| Reading SMS / `READ_SMS` / `RECEIVE_SMS` | No message interception. |
| Accessibility service | Not a keylogger and won't auto-click for you. |
| Screen-reading of other apps | The app never reads other apps' screens. |
| System-alert-window / overlays | No drawing over other apps. |
| Device Admin | No remote wipe / policy control on a personal phone. |
| Auto-reply / send mail | The app sends nothing. Your desktop agent handles replies. |

If a feature would need one of these, it was left out on purpose.

## Build and install on the Fold over USB

You need the Android SDK + JDK 17+ on a computer. On the phone, enable
**Developer options → USB debugging** (Settings → About phone → tap *Build number*
seven times, then Settings → Developer options → USB debugging).

```bash
# 1. Plug the Fold 7 in over USB and accept the "Allow USB debugging?" prompt.
adb devices                       # confirm the phone is listed

# 2. From this folder, build the debug APK:
./gradlew :app:assembleDebug

# 3. Install it:
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

The app appears as **Fold Companion**. Open it, and the four call buttons are on Home.

### Release build (the one to keep on the phone)

```bash
./gradlew :app:assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

By default the release APK is signed with the Android debug key, which is fine for
personal sideloading. To sign with your own key (recommended so future updates
install over the top), copy `keystore.properties.template` to `keystore.properties`
(gitignored), generate a keystore, and fill it in:

```bash
keytool -genkeypair -v -keystore fold-companion-release.jks \
  -alias fold -keyalg RSA -keysize 2048 -validity 10000
```

To grant the optional mail list: open the app → **Mail** tab → **Open
notification-access settings** → enable Fold Companion.

To find an export: **Queue** tab → **Export** → files land in
`Downloads/FoldCompanion/`.

## Tech

- Kotlin, single module, Jetpack Compose (Material 3), minSdk 26, target/compile SDK 35.
- Room for the local saved-items and mail-notice lists; DataStore for settings.
- Adaptive layout via `material3-window-size-class`.
- No network stack, no analytics, no third-party ad/tracking SDKs.

## Tests

```bash
./gradlew :app:testDebugUnitTest    # JVM unit tests (dialing, share parsing, export, mail filter)
./gradlew :app:lintDebug            # Android lint
```
