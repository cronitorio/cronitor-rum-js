import { constants } from './constants';
import { RUM_GLOBAL_CONFIG } from './config';
import { track } from './commands';

export const hasQueryParam = (value: string) => window && window.location.search.indexOf(value) > -1;

export const evalTrackingToggle = () => {
  const enableSet = hasQueryParam(constants.TRACKING_ENABLED);
  const disableSet = hasQueryParam(constants.TRACKING_DISABLED);
  if (enableSet || disableSet) {
    if (!window.localStorage) {
      log("Can't disable Cronitor RUM. This browser does not support local storage.", undefined, true);
      return;
    }
    if (enableSet) {
      window.localStorage.removeItem(constants.TRACKING_DISABLED);
      log('Cronitor RUM has been enabled on this device.', undefined, true);
    }
    if (disableSet) {
      window.localStorage.setItem(constants.TRACKING_DISABLED, 'true');
      log('Cronitor RUM has been disabled on this device.', undefined, true);
    }
  }
};

export const patchHistoryAPI = () => {
  // Patch browser history API to track state changes
  if (window.history.pushState && !window.cronitor._historyPatched) {
    log("Single page app mode is set to 'history', patching History API");
    const existing = window.history.pushState;
    const hook = () => track('Pageview');
    window.history.pushState = function () {
      // @ts-ignore
      existing.apply(this, arguments);
      hook();
    };
    window.addEventListener('popstate', hook);
    window.cronitor._historyPatched = true;
    log('Listening for History API changes');
  }
};

export const log = (msg: string, extra?: any, critical?: boolean) => {
  const canLog = RUM_GLOBAL_CONFIG.debug || hasQueryParam(constants.DEBUG_FLAG);
  if (!critical && !canLog) {
    return;
  }
  const message = `[Cronitor RUM] ${msg}`;
  if (extra) console.log(message, extra);
  else console.log(message);
};
