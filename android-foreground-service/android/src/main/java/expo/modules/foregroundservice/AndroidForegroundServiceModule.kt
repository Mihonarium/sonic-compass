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
