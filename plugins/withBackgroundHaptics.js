const { withDangerousMod, createRunOncePlugin } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withBackgroundHaptics(config) {
  return withDangerousMod(config, ['ios', async (cfg) => {
    const projectRoot = cfg.modRequest.platformProjectRoot;
    const srcRoot = path.join(cfg.modRequest.projectRoot, 'ios');
    const files = ['BackgroundHaptic.swift', 'BackgroundHaptic.mm', 'BackgroundHaptic-Bridging-Header.h'];
    for (const file of files) {
      const src = path.join(srcRoot, file);
      const dest = path.join(projectRoot, file);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
      }
    }
    return cfg;
  }]);
}

module.exports = createRunOncePlugin(withBackgroundHaptics, 'with-background-haptics', '1.0.0');
