import Foundation
import AudioToolbox
import React

@objc(BackgroundHaptic)
class BackgroundHaptic: NSObject {
  @objc
  func trigger() {
    AudioServicesPlaySystemSound(SystemSoundID(1520))
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
