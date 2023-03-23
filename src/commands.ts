import { collect, CronitorRUMEvent } from './collect';
import { evalTrackingToggle, log, patchHistoryAPI } from './helpers';
import { CronitorRUMConfig, RUM_GLOBAL_CONFIG, setConfig } from './config';
import { throttle } from './throttle';
import { listenForCoreWebVitals, listenForErrors } from './listeners';

export type Command = 'track' | 'config' | 'captureError';

export interface CronitorRUMInterpreter {
  (command: 'track', eventName: string, dimensionOverrides?: any): void;
  (command: 'config', conf: Partial<CronitorRUMConfig>): void;
  (command: 'captureError', event: ErrorEvent, dimensionOverrides?: any): void;
}

export const interpret: CronitorRUMInterpreter = (
  command: Command,
  value?: CronitorRUMConfig | string | {},
  dimensionOverrides: Partial<CronitorRUMEvent> = {},
) => {
  switch (command) {
    case 'config':
      if (!value) return log('Passed empty config params');
      config(value as CronitorRUMConfig);
      break;
    case 'track':
      track(value as string, dimensionOverrides);
      break;
    case 'captureError':
      captureError(value, dimensionOverrides);
      break;
    default:
      log(`Unknown command`, command, true);
      return;
  }
};

// Throttle error events to avoid a flood of API calls in case of user mistakes
export const captureError = throttle((event: ErrorEvent, dimensionOverrides: Partial<CronitorRUMEvent> = {}) => {
  track('Error', {
    error_type: event.error?.name || 'Error',
    message: event.error?.message || event.message,
    lineno: event.lineno,
    colno: event.colno,
    filename: event.filename,
    ...dimensionOverrides,
  });
}, 1000);

export const track = (eventName: string, dimensionOverrides: Partial<CronitorRUMEvent> = {}) => {
  const callback = () => collect(eventName, dimensionOverrides);

  // Document has loaded, fire next
  if (document.readyState === 'complete') {
    setTimeout(callback, 0);
  } else {
    // Document hasn't loaded, schedule callback on load
    log('Document not ready, adding event listener');
    window.addEventListener('load', () => {
      setTimeout(callback, 0);
    });
  }
};

export const config = (params: Partial<CronitorRUMConfig>) => {
  const before = { ...RUM_GLOBAL_CONFIG };
  const after = setConfig(params);

  // If tracking mode is 'pageload' we only trigger one pageview, no SPA navigations are followed
  // If tracking mode is 'history' we trigger an initial pageview AND bind to the browser history to track clientside changes
  if (RUM_GLOBAL_CONFIG.trackMode && ['pageload', 'history'].indexOf(RUM_GLOBAL_CONFIG.trackMode) > -1) {
    if (RUM_GLOBAL_CONFIG.trackMode === 'history') {
      patchHistoryAPI();
    }

    // Send initial event once site is set for the first time
    if (!before.clientKey && after.clientKey) {
      log('Triggering initial pageview');
      track('Pageview');
    }
  }

  log(`Tracking mode: ${RUM_GLOBAL_CONFIG.trackMode}`);
};

export const load = (clientKey: string, conf?: CronitorRUMConfig): void => {
  config({
    clientKey,
    // Disable auto-track on the JS client. Most projects using this library need
    // more control over the event handlers.
    trackMode: 'off',
    ...conf,
  });
  browserInit();
};

export const browserInit = () => {
  // Check if tracking has been enabled/disabled
  evalTrackingToggle();

  // Double check cronitor object before inner queue, might not have initialized yet.
  // Any commands user triggered before script has fully loaded will be present in queue
  const commandQueue = (window.cronitor && window.cronitor.q) || [];
  // @ts-ignore
  window.cronitor = interpret;
  window.cronitor.q = commandQueue;

  // Process initial queue
  for (const item of commandQueue) {
    window.cronitor.apply(this, item);
  }

  // Setup basic JS error tracking
  if (RUM_GLOBAL_CONFIG.autoTrackErrors) {
    listenForErrors();
  }

  // Setup Core Web Vitals
  if (RUM_GLOBAL_CONFIG.autoTrackCoreWebVitals) {
    listenForCoreWebVitals();
  }
};
