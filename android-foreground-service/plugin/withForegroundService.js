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
