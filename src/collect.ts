import { RUM_GLOBAL_CONFIG } from './config';
import { log } from './helpers';
import { constants } from './constants';
import { collectEvent } from './collectors';

export interface CronitorRUMEvent {
  client_key: string;
  event_name: string;
  environment?: string;
  url?: string;
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_content?: string;
  utm_term?: string;
  language?: string;
  timezone?: string;
  screen_width?: number;
  page_load_dns?: number;
  page_load_connect?: number;
  page_load_ssl?: number;
  page_load_ttfb?: number;
  page_load_download?: number;
  page_load_dom_content_loaded?: number;
  page_load_render?: number;
  page_load_total?: number;
  page_load_transfer_size?: number;
  connection_type?: string;
  value?: number;
  web_vital_cls?: number;
  web_vital_fid?: number;
  web_vital_lcp?: number;
  error_type?: string;
  message?: string;
  lineno?: number;
  colno?: number;
  filename?: string;
}

export const collect = async (eventName: string, dimensionOverrides: any) => {
  const event = collectEvent(eventName, dimensionOverrides);
  const payload = transformEvent(event);
  // Send event if transformation yielded payload and should collect approves
  if (payload && shouldCollect(payload)) {
    await send(payload);
  }
};

export const send = async (event: CronitorRUMEvent) => {
  const url = `${RUM_GLOBAL_CONFIG.ingestionHost}/api/rum/events`;
  const data = JSON.stringify(event);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, data);
  } else {
    await fetch(url, {
      body: data,
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
    });
  }
  log('Sent events', event);
};

export const shouldCollect = (payload: CronitorRUMEvent) => {
  if (!RUM_GLOBAL_CONFIG.clientKey) {
    log('Bad configuration: missing clientKey', undefined, true);
    return false;
  }
  if (!payload.event_name || !/^[a-zA-Z][a-zA-Z0-9\_\-\.]{0,63}$/.test(payload.event_name)) {
    log('Invalid event name.', undefined, true);
    return;
  }
  if ((window.localStorage && window.localStorage.getItem(constants.TRACKING_DISABLED)) || !RUM_GLOBAL_CONFIG.enabled) {
    log('Skipping event collection, Cronitor RUM has been manually disabled on this browser.', undefined, true);
    return false;
  }

  if (!RUM_GLOBAL_CONFIG.debug) {
    if (RUM_GLOBAL_CONFIG.honorDNT && 'doNotTrack' in window.navigator && window.navigator.doNotTrack === '1') {
      log("Honoring 'Do Not Track'", undefined, true);
      return false;
    }
    if (
      RUM_GLOBAL_CONFIG.filterLocalhost &&
      /^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*\:)*?:?0*1$/.test(window.location.hostname)
    ) {
      log('Skipping event collection, localhost filter enabled', undefined, true);
      return false;
    }
    if (window.location.protocol === 'file:') {
      log("Can't track from file URLs", undefined, true);
      return false;
    }
    // @ts-ignore
    if (window.document.visibilityState === 'prerender') {
      log('Skipping event collection, document is pre-rendering', undefined, true);
      return false;
    }
    if (window.navigator.webdriver) {
      log('Skipping event collection, navigation is automated', undefined, true);
      return false;
    }
  }

  // De-duplicate consecutive Pageview events
  // Sometimes this happens with SSR frameworks when refreshing the page clientside
  if (payload.event_name === 'Pageview') {
    const previousPath = window.cronitor._previousPath;
    // Use url from event in case transform changed it
    const currentPath = payload.url;
    window.cronitor._previousPath = currentPath;
    if (previousPath && previousPath === currentPath) {
      log('Skipping event collection, duplicate pageview detected');
      return;
    }
  }
  return true;
};

const transformEvent: (event: CronitorRUMEvent) => CronitorRUMEvent | undefined = (event) => {
  const result: CronitorRUMEvent = event;

  if (RUM_GLOBAL_CONFIG.beforeSend) {
    let transformed: CronitorRUMEvent | undefined;
    try {
      transformed = RUM_GLOBAL_CONFIG.beforeSend({ ...event });
    } catch (err) {
      console.error(err);
    }
    if (!transformed) {
      log('beforeSend hook returned null or undefined, skipping event collection');
      return;
    }

    // Do not allow override of client_key
    transformed.client_key = event.client_key;

    // Only send known keys, not everything the user added to the event obj
    for (const key of Object.keys(event)) {
      // @ts-ignore
      result[key] = transformed[key];
    }
  }

  return result;
};
