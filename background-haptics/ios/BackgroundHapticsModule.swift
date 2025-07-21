import ExpoModulesCore
import AudioToolbox

public class BackgroundHapticsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BackgroundHaptics")

    AsyncFunction("impact") { (style: String?) in
      var soundID: SystemSoundID = 1519
      if let style = style {
        switch style {
        case "heavy":
          soundID = 1521
        case "medium":
          soundID = 1520
        default:
          soundID = 1519
        }
      }
      AudioServicesPlaySystemSound(soundID)
    }
    .runOnQueue(.main)
  }
}
