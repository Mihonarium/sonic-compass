# Android Foreground Service Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make background audio and vibration work reliably on Android by creating a foreground service that prevents the OS from killing the app process.

**Architecture:** Create a new Expo native module (`android-foreground-service`) containing a Kotlin `Service` class with `mediaPlayback` foreground service type, an Expo Modules API bridge for JS, and a config plugin that injects the service declaration and permissions into AndroidManifest.xml at build time. The JS side starts the service when audio initializes and stops it on cleanup.

**Tech Stack:** Kotlin (Android native), Expo Modules API, Expo config plugins (`withAndroidManifest`), `expo-av` (existing audio), React Native `Platform` API

---

### Task 1: Create the module scaffolding and package.json

**Files:**
- Create: `android-foreground-service/package.json`
- Create: `android-foreground-service/expo-module.config.json`

**Step 1: Create package.json**

```json
{
  "name": "android-foreground-service",
  "version": "1.0.0",
  "author": "Mikhail Samin",
  "license": "Proprietary",
  "homepage": "https://contact.ms/compass/",
  "summary": "Android foreground service for persistent background audio",
  "description": "Expo native module that starts an Android foreground service to keep background audio alive",
  "main": "src/index.js",
  "types": "src/index.js",
  "sideEffects": false,
  "dependencies": {},
  "peerDependencies": {
    "expo": "*"
  }
}
```

**Step 2: Create expo-module.config.json**

```json
{
  "name": "android-foreground-service",
  "platforms": ["android"],
  "android": {
    "modules": ["expo.modules.foregroundservice.AndroidForegroundServiceModule"]
  }
}
```

**Step 3: Commit**

```bash
git add android-foreground-service/package.json android-foreground-service/expo-module.config.json
git commit -m "feat: scaffold android-foreground-service module"
```

---

### Task 2: Create the Kotlin foreground service class

**Files:**
- Create: `android-foreground-service/android/src/main/java/expo/modules/foregroundservice/CompassForegroundService.kt`

**Step 1: Write CompassForegroundService.kt**

This is the Android `Service` that runs in the foreground with a persistent notification.

```kotlin
package expo.modules.foregroundservice

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat

class CompassForegroundService : Service() {

    companion object {
        const val CHANNEL_ID = "sonic_compass_foreground"
        const val NOTIFICATION_ID = 1001
        const val ACTION_START = "ACTION_START"
        const val ACTION_STOP = "ACTION_STOP"
        const val ACTION_UPDATE = "ACTION_UPDATE"
        const val EXTRA_TITLE = "EXTRA_TITLE"
        const val EXTRA_BODY = "EXTRA_BODY"
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val title = intent.getStringExtra(EXTRA_TITLE) ?: "Sonic Compass"
                val body = intent.getStringExtra(EXTRA_BODY) ?: "Running in background"
                startForegroundWithNotification(title, body)
            }
            ACTION_UPDATE -> {
                val title = intent.getStringExtra(EXTRA_TITLE) ?: "Sonic Compass"
                val body = intent.getStringExtra(EXTRA_BODY) ?: "Running in background"
                updateNotification(title, body)
            }
            ACTION_STOP -> {
                ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }
        return START_STICKY
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Sonic Compass Background",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Keeps Sonic Compass running in the background"
            setShowBadge(false)
            setSound(null, null)
            enableVibration(false)
        }
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannel(channel)
    }

    private fun buildNotification(title: String, body: String): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setSilent(true)
            .build()
    }

    private fun startForegroundWithNotification(title: String, body: String) {
        val notification = buildNotification(title, body)
        try {
            ServiceCompat.startForeground(
                this,
                NOTIFICATION_ID,
                notification,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
                } else {
                    0
                }
            )
        } catch (e: Exception) {
            // If we can't start foreground, stop the service
            stopSelf()
        }
    }

    private fun updateNotification(title: String, body: String) {
        val notification = buildNotification(title, body)
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, notification)
    }

    override fun onDestroy() {
        super.onDestroy()
    }
}
```

**Step 2: Commit**

```bash
git add android-foreground-service/android/
git commit -m "feat: add Kotlin foreground service with mediaPlayback type"
```

---

### Task 3: Create the Expo module bridge (Kotlin)

**Files:**
- Create: `android-foreground-service/android/src/main/java/expo/modules/foregroundservice/AndroidForegroundServiceModule.kt`

**Step 1: Write the Expo module that bridges JS to the Kotlin service**

```kotlin
package expo.modules.foregroundservice

import android.content.Intent
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AndroidForegroundServiceModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("AndroidForegroundService")

        AsyncFunction("startService") { title: String?, body: String? ->
            val context = appContext.reactContext ?: return@AsyncFunction
            val intent = Intent(context, CompassForegroundService::class.java).apply {
                action = CompassForegroundService.ACTION_START
                putExtra(CompassForegroundService.EXTRA_TITLE, title ?: "Sonic Compass")
                putExtra(CompassForegroundService.EXTRA_BODY, body ?: "Running in background")
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        AsyncFunction("stopService") {
            val context = appContext.reactContext ?: return@AsyncFunction
            val intent = Intent(context, CompassForegroundService::class.java).apply {
                action = CompassForegroundService.ACTION_STOP
            }
            context.startService(intent)
        }

        AsyncFunction("updateNotification") { title: String?, body: String? ->
            val context = appContext.reactContext ?: return@AsyncFunction
            val intent = Intent(context, CompassForegroundService::class.java).apply {
                action = CompassForegroundService.ACTION_UPDATE
                putExtra(CompassForegroundService.EXTRA_TITLE, title ?: "Sonic Compass")
                putExtra(CompassForegroundService.EXTRA_BODY, body ?: "Running in background")
            }
            context.startService(intent)
        }
    }
}
```

**Step 2: Commit**

```bash
git add android-foreground-service/android/
git commit -m "feat: add Expo module bridge for foreground service"
```

---

### Task 4: Create the Android build.gradle

**Files:**
- Create: `android-foreground-service/android/build.gradle`

**Step 1: Write build.gradle**

Note: Must use `build.gradle` (Groovy), not `build.gradle.kts` — Expo autolinking doesn't detect `.kts` files.

```groovy
apply plugin: 'com.android.library'
apply plugin: 'kotlin-android'
apply plugin: 'maven-publish'

group = 'expo.modules.foregroundservice'
version = '1.0.0'

android {
    namespace "expo.modules.foregroundservice"
    compileSdkVersion safeExtGet("compileSdkVersion", 35)

    defaultConfig {
        minSdkVersion safeExtGet("minSdkVersion", 24)
        targetSdkVersion safeExtGet("targetSdkVersion", 35)
    }

    publishing {
        singleVariant("release") {
            withSourcesJar()
        }
    }

    lintOptions {
        abortOnError false
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

repositories {
    mavenCentral()
    google()
}

dependencies {
    implementation project(':expo-modules-core')
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:${safeExtGet('kotlinVersion', '1.9.25')}"
    implementation "androidx.core:core-ktx:1.13.1"
}

def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}
```

**Step 2: Create AndroidManifest.xml for the library**

Create `android-foreground-service/android/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
</manifest>
```

This is the minimal manifest for a library module. The actual service declaration and permissions are injected by the config plugin into the app's manifest.

**Step 3: Commit**

```bash
git add android-foreground-service/android/
git commit -m "feat: add Android build.gradle and manifest for foreground service module"
```

---

### Task 5: Create the JS bridge layer

**Files:**
- Create: `android-foreground-service/src/index.js`
- Create: `android-foreground-service/src/module.js`

**Step 1: Write module.js with platform guard**

```javascript
import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

let AndroidForegroundServiceModule;
if (Platform.OS === 'android') {
  AndroidForegroundServiceModule = requireNativeModule('AndroidForegroundService');
} else {
  // No-op on iOS — iOS uses UIBackgroundModes audio instead
  AndroidForegroundServiceModule = {
    startService: () => Promise.resolve(),
    stopService: () => Promise.resolve(),
    updateNotification: () => Promise.resolve(),
  };
}

export default AndroidForegroundServiceModule;
```

**Step 2: Write index.js**

```javascript
import AndroidForegroundServiceModule from './module';

export function startService(title, body) {
  return AndroidForegroundServiceModule.startService(title ?? null, body ?? null);
}

export function stopService() {
  return AndroidForegroundServiceModule.stopService();
}

export function updateNotification(title, body) {
  return AndroidForegroundServiceModule.updateNotification(title ?? null, body ?? null);
}

export default { startService, stopService, updateNotification };
```

**Step 3: Commit**

```bash
git add android-foreground-service/src/
git commit -m "feat: add JS bridge for android-foreground-service"
```

---

### Task 6: Create the config plugin

**Files:**
- Create: `android-foreground-service/plugin/withForegroundService.js`

**Step 1: Write the config plugin**

This plugin adds the service declaration and permissions to AndroidManifest.xml at build time.

```javascript
const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');

function withForegroundService(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    // Add permissions at manifest level
    if (!manifest.manifest['uses-permission']) {
      manifest.manifest['uses-permission'] = [];
    }

    const existingPermissions = manifest.manifest['uses-permission'].map(
      (p) => p.$['android:name']
    );

    const requiredPermissions = [
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
      'android.permission.POST_NOTIFICATIONS',
    ];

    for (const perm of requiredPermissions) {
      if (!existingPermissions.includes(perm)) {
        manifest.manifest['uses-permission'].push({
          $: { 'android:name': perm },
        });
      }
    }

    // Add service declaration to application
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    // Check if service already exists
    const serviceExists = mainApplication.service.some(
      (s) => s.$['android:name'] === 'expo.modules.foregroundservice.CompassForegroundService'
    );

    if (!serviceExists) {
      mainApplication.service.push({
        $: {
          'android:name': 'expo.modules.foregroundservice.CompassForegroundService',
          'android:enabled': 'true',
          'android:exported': 'false',
          'android:foregroundServiceType': 'mediaPlayback',
        },
      });
    }

    return config;
  });
}

module.exports = withForegroundService;
```

**Step 2: Commit**

```bash
git add android-foreground-service/plugin/
git commit -m "feat: add config plugin for AndroidManifest service declaration"
```

---

### Task 7: Register the module in package.json and app.json

**Files:**
- Modify: `package.json` (root) — add dependency
- Modify: `app.json` — add plugin, update permissions

**Step 1: Add the local dependency to root package.json**

Add to `dependencies`:
```json
"android-foreground-service": "./android-foreground-service"
```

**Step 2: Update app.json**

Add the config plugin and update permissions:

In `expo.plugins`, add:
```json
["./android-foreground-service/plugin/withForegroundService"]
```

Update `expo.android.permissions` to:
```json
["VIBRATE", "FOREGROUND_SERVICE", "FOREGROUND_SERVICE_MEDIA_PLAYBACK", "POST_NOTIFICATIONS"]
```

**Step 3: Commit**

```bash
git add package.json app.json
git commit -m "feat: register android-foreground-service module and config plugin"
```

---

### Task 8: Integrate foreground service into App.js

**Files:**
- Modify: `App.js` — import module, start/stop service, optionally update notification

**Step 1: Add import**

At the top of App.js, add after the BackgroundHaptics import:
```javascript
import AndroidForegroundService from 'android-foreground-service';
```

**Step 2: Start the service in initAudio**

In the `initAudio` function, after `Audio.setAudioModeAsync(...)` succeeds (around line 208), add:
```javascript
      // Start Android foreground service to prevent OS from killing background audio
      if (Platform.OS === 'android') {
        try {
          await AndroidForegroundService.startService('Sonic Compass', 'Running in background');
        } catch (e) {
          console.warn('Could not start foreground service:', e);
        }
      }
```

**Step 3: Stop the service in cleanup**

In the cleanup function inside the main `useEffect` (around line 555-568), add before the `return`:
```javascript
      // Stop Android foreground service
      if (Platform.OS === 'android') {
        AndroidForegroundService.stopService().catch(() => {});
      }
```

**Step 4: Optionally update notification with heading**

In the `updateCompass` function (around line 397), add after `setHeading(roundedHeading)`:
```javascript
    // Update notification with current heading (Android only, low overhead — just a string)
    if (Platform.OS === 'android' && isBackground.current) {
      AndroidForegroundService.updateNotification(
        'Sonic Compass',
        `Heading: ${Math.round(roundedHeading)}°`
      ).catch(() => {});
    }
```

Note: Since updateCompass fires frequently (every degree change), we should throttle this. Add a ref and throttle to every ~2 seconds:

Add a ref near the other refs (around line 145):
```javascript
  const lastNotificationUpdate = useRef(0);
```

Then the update in updateCompass becomes:
```javascript
    // Update notification with current heading (Android only, throttled to every 2s)
    if (Platform.OS === 'android' && isBackground.current) {
      const now = Date.now();
      if (now - lastNotificationUpdate.current > 2000) {
        lastNotificationUpdate.current = now;
        AndroidForegroundService.updateNotification(
          'Sonic Compass',
          `Heading: ${Math.round(roundedHeading)}°`
        ).catch(() => {});
      }
    }
```

**Step 5: Commit**

```bash
git add App.js
git commit -m "feat: integrate foreground service into app lifecycle"
```

---

### Task 9: Update CLAUDE.md and README.md

**Files:**
- Modify: `CLAUDE.md` — document the new module
- Modify: `README.md` — update Android limitation note

**Step 1: Update CLAUDE.md**

Add to the Key Files section:
```
- `android-foreground-service/` — Expo native module (Kotlin/Android) that starts a foreground service with mediaPlayback type to keep background audio alive on Android. Includes a config plugin that injects service declaration and permissions into AndroidManifest.xml.
```

Update the Platform-Specific Notes to remove or update the Android limitation about background audio stopping.

**Step 2: Update README.md**

Remove or update the Android limitation note (line 122) since background audio now works reliably with the foreground service. Replace with something like:
```
- **Android**: A persistent notification ("Sonic Compass is running") is required by Android to keep background audio alive. This is normal Android behavior for apps that play audio in the background.
```

**Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: update docs for Android foreground service"
```

---

### Task 10: Quality review pass

**Step 1: Read every file in `android-foreground-service/` and verify:**
- Package names match between expo-module.config.json and Kotlin files
- build.gradle compiles with correct SDK versions
- Config plugin adds all required permissions and service declaration
- JS bridge handles both platforms correctly

**Step 2: Read App.js integration points and verify:**
- Service starts after audio mode is set
- Service stops on cleanup
- Notification updates are throttled
- No crashes on iOS (everything is no-op guarded)

**Step 3: Verify app.json has all required entries:**
- Plugin registered
- Permissions include FOREGROUND_SERVICE_MEDIA_PLAYBACK and POST_NOTIFICATIONS

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: quality review fixes for foreground service"
```

---

## Key References

- [Android Foreground Service Types (Android 14+)](https://developer.android.com/about/versions/14/changes/fgs-types-required)
- [Launch a Foreground Service](https://developer.android.com/develop/background-work/services/fgs/launch)
- [Expo Modules API: Native Module Tutorial](https://docs.expo.dev/modules/native-module-tutorial/)
- [Expo Config Plugins](https://docs.expo.dev/config-plugins/plugins/)
- [expo-av background playback issue](https://github.com/expo/expo/issues/26216)
