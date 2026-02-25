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
