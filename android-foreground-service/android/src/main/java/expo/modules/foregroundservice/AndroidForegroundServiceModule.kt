package expo.modules.foregroundservice

import android.content.Intent
import android.media.AudioAttributes
import android.media.SoundPool
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.ConcurrentHashMap

class AndroidForegroundServiceModule : Module() {
    // JS setTimeout/setInterval in React Native are driven by the Choreographer,
    // which stops when the screen turns off. These Handler-based timers run on a
    // dedicated thread and keep firing as long as the CPU is awake (the foreground
    // service holds a partial wakelock for that).
    private var handlerThread: HandlerThread? = null
    private var handler: Handler? = null
    private var intervalRunnable: Runnable? = null
    private val timeoutRunnables = ConcurrentHashMap<Int, Runnable>()

    // SoundPool plays short cues WITHOUT requesting audio focus, so compass
    // sounds mix on top of other apps' audio (music, navigation) instead of
    // ducking it — the Android equivalent of iOS MixWithOthers.
    private var soundPool: SoundPool? = null
    private val loadPromises = ConcurrentHashMap<Int, Promise>()

    private fun getSoundPool(): SoundPool {
        soundPool?.let { return it }
        val attributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        val pool = SoundPool.Builder()
            .setMaxStreams(4)
            .setAudioAttributes(attributes)
            .build()
        pool.setOnLoadCompleteListener { _, sampleId, status ->
            loadPromises.remove(sampleId)?.let { promise ->
                if (status == 0) {
                    promise.resolve(sampleId)
                } else {
                    promise.reject("E_SOUND_LOAD", "Failed to load sound (status $status)", null)
                }
            }
        }
        soundPool = pool
        return pool
    }

    private fun timerHandler(): Handler {
        handler?.let { return it }
        val thread = HandlerThread("SonicCompassTimers").apply { start() }
        handlerThread = thread
        return Handler(thread.looper).also { handler = it }
    }

    private fun stopIntervalInternal() {
        intervalRunnable?.let { handler?.removeCallbacks(it) }
        intervalRunnable = null
    }

    override fun definition() = ModuleDefinition {
        Name("AndroidForegroundService")

        Events("onTick", "onTimeout")

        AsyncFunction("startService") { title: String?, body: String? ->
            val context = appContext.reactContext
            if (context != null) {
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
        }

        AsyncFunction("stopService") {
            val context = appContext.reactContext
            if (context != null) {
                val intent = Intent(context, CompassForegroundService::class.java).apply {
                    action = CompassForegroundService.ACTION_STOP
                }
                context.startService(intent)
            }
        }

        AsyncFunction("updateNotification") { title: String?, body: String? ->
            val context = appContext.reactContext
            if (context != null) {
                val intent = Intent(context, CompassForegroundService::class.java).apply {
                    action = CompassForegroundService.ACTION_UPDATE
                    putExtra(CompassForegroundService.EXTRA_TITLE, title ?: "Sonic Compass")
                    putExtra(CompassForegroundService.EXTRA_BODY, body ?: "Running in background")
                }
                context.startService(intent)
            }
        }

        AsyncFunction("startInterval") { intervalMs: Double ->
            stopIntervalInternal()
            val h = timerHandler()
            val period = intervalMs.toLong().coerceAtLeast(100L)
            val runnable = object : Runnable {
                override fun run() {
                    sendEvent("onTick", emptyMap<String, Any>())
                    handler?.postDelayed(this, period)
                }
            }
            intervalRunnable = runnable
            h.postDelayed(runnable, period)
        }

        AsyncFunction("stopInterval") {
            stopIntervalInternal()
        }

        AsyncFunction("setTimeout") { id: Int, delayMs: Double ->
            val h = timerHandler()
            timeoutRunnables.remove(id)?.let { h.removeCallbacks(it) }
            val runnable = Runnable {
                timeoutRunnables.remove(id)
                sendEvent("onTimeout", mapOf("id" to id))
            }
            timeoutRunnables[id] = runnable
            h.postDelayed(runnable, delayMs.toLong().coerceAtLeast(0L))
        }

        AsyncFunction("clearTimeout") { id: Int ->
            timeoutRunnables.remove(id)?.let { handler?.removeCallbacks(it) }
        }

        AsyncFunction("loadSound") { path: String, promise: Promise ->
            val pool = getSoundPool()
            val cleanPath = path.removePrefix("file://")
            val sampleId = pool.load(cleanPath, 1)
            if (sampleId == 0) {
                promise.reject("E_SOUND_LOAD", "SoundPool could not load $cleanPath", null)
            } else {
                loadPromises[sampleId] = promise
            }
        }

        AsyncFunction("playSound") { soundId: Int, leftVolume: Double, rightVolume: Double ->
            soundPool?.play(
                soundId,
                leftVolume.toFloat().coerceIn(0f, 1f),
                rightVolume.toFloat().coerceIn(0f, 1f),
                1,
                0,
                1f
            )
        }

        OnDestroy {
            stopIntervalInternal()
            timeoutRunnables.values.forEach { handler?.removeCallbacks(it) }
            timeoutRunnables.clear()
            handlerThread?.quitSafely()
            handlerThread = null
            handler = null
            soundPool?.release()
            soundPool = null
            loadPromises.clear()
        }
    }
}
