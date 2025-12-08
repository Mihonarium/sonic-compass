package expo.modules.backgroundhaptics

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise

class BackgroundHapticsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("BackgroundHaptics")

    AsyncFunction("impact") { style: String?, promise: Promise ->
      val context = appContext.reactContext ?: run {
        promise.resolve(null)
        return@AsyncFunction
      }

      val vibrator = getVibrator(context)
      if (vibrator == null || !vibrator.hasVibrator()) {
        promise.resolve(null)
        return@AsyncFunction
      }

      val duration = when (style) {
        "heavy" -> 100L
        "medium" -> 50L
        "light" -> 25L
        else -> 50L
      }

      val amplitude = when (style) {
        "heavy" -> 255
        "medium" -> 180
        "light" -> 100
        else -> 180
      }

      try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          vibrator.vibrate(VibrationEffect.createOneShot(duration, amplitude))
        } else {
          @Suppress("DEPRECATION")
          vibrator.vibrate(duration)
        }
        promise.resolve(null)
      } catch (e: Exception) {
        promise.resolve(null)
      }
    }
  }

  private fun getVibrator(context: Context): Vibrator? {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
      vibratorManager?.defaultVibrator
    } else {
      @Suppress("DEPRECATION")
      context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
    }
  }
}
