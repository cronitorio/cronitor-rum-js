import { RUM_GLOBAL_CONFIG } from './config';
import { CronitorRUMEvent } from './collect';
import { log } from './helpers';

export function collectEvent(eventName: string, dimensionOverrides: any): CronitorRUMEvent {
  return {
    client_key: RUM_GLOBAL_CONFIG.clientKey,
    environment: RUM_GLOBAL_CONFIG.environment,
    event_name: eventName,
    user_agent: getUserAgent(),
    url: getUrl(),
    referrer: getReferrer(),
    language: getUserLanguage(),
    connection_type: getConnectionType(),
    screen_width: getScreenWidth(),
    timezone: getTimezone(),
    ...getUTMParams(),
    ...getPageLoadTimings(eventName),
    ...(dimensionOverrides || {}),
  };
}

const getUrl = () => {
  const fragment = RUM_GLOBAL_CONFIG.includeURLFragment ? window.location.hash : '';
  const queryParts: string[] = [];
  if (RUM_GLOBAL_CONFIG.includeURLQueryParams && RUM_GLOBAL_CONFIG.includeURLQueryParams.length > 0) {
    const params = new URLSearchParams(window.location.search);
    for (const param of RUM_GLOBAL_CONFIG.includeURLQueryParams) {
      if (params.has(param)) {
        const value = params.get(param);
        if (value) {
          queryParts.push(`${param}=${value}`);
        } else {
          queryParts.push(`${param}`);
        }
      }
    }
  }
  let query = '';
  if (queryParts && queryParts.length > 0) {
    query = `?${queryParts.join('&')}`;
  }
  return window.location.protocol + '//' + window.location.hostname + window.location.pathname + query + fragment;
};

const getUserAgent = () => window.navigator.userAgent;

const matchQueryStringGroup = (pattern: string | RegExp) => {
  const result = window.location.search.match(pattern);
  return result ? result[2] : undefined;
};

const getUTMParams = () => {
  return {
    utm_source: matchQueryStringGroup(/[?&](ref|source|utm_source)=([^?&]+)/),
    utm_campaign: matchQueryStringGroup(/[?&](utm_campaign)=([^?&]+)/),
    utm_medium: matchQueryStringGroup(/[?&](utm_medium)=([^?&]+)/),
    utm_content: matchQueryStringGroup(/[?&](utm_content)=([^?&]+)/),
    utm_term: matchQueryStringGroup(/[?&](utm_term)=([^?&]+)/),
  };
};

const getUserLanguage = () => {
  const nav = window.navigator;
  // @ts-ignore
  return nav ? nav.userLanguage || nav.language : undefined;
};

const getTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return undefined;
  }
};

const getConnectionType = () => {
  const hasEffectiveType = navigator.connection && 'effectiveType' in navigator.connection;
  // @ts-ignore
  return hasEffectiveType ? navigator.connection.effectiveType : undefined;
};

const getReferrer = () => {
  const referrer = document.referrer;
  if (referrer) {
    const parsed = new URL(referrer);
    // Do not use referrer if it comes from same hostname
    if (parsed.hostname.toLowerCase() === window.location.hostname.toLowerCase()) {
      return undefined;
    }
    return parsed.protocol + '//' + parsed.hostname + parsed.pathname;
  }
  return undefined;
};

const getScreenWidth = () => {
  return window?.innerWidth;
};

const asIntOrUndefined = (value: any) => {
  try {
    if (value) {
      const rounded = Math.ceil(value);
      if (isNaN(rounded) || rounded < 0) {
        return undefined;
      }
      return rounded;
    } else {
      return undefined;
    }
  } catch (e) {
    // No error
    return undefined;
  }
};

const getPageLoadTimings = (eventName: string) => {
  let timings: any = {};

  // Only send timings for full page loads (no SPA transitions or custom events)
  if (eventName !== 'Pageview' || window.cronitor._initialPageLoadSent) {
    return timings;
  }

  try {
    // @ts-ignore
    const perf = window.performance || window.mozPerformance || window.msPerformance || window.webkitPerformance || {};

    // Latest Performance Navigation Timing API
    if (perf.getEntriesByType) {
      const entry: PerformanceNavigationTiming = perf.getEntriesByType('navigation')[0];
      if (entry) {
        timings = {
          page_load_dns: entry.domainLookupEnd - entry.domainLookupStart,
          page_load_connect: entry.connectEnd - entry.connectStart,
          page_load_ssl: entry.secureConnectionStart ? entry.requestStart - entry.secureConnectionStart : undefined,
          page_load_ttfb: entry.responseStart - entry.requestStart,
          page_load_download: entry.responseEnd - entry.responseStart,
          page_load_dom_content_loaded: entry.domContentLoadedEventEnd - entry.responseEnd,
          page_load_render: entry.domComplete - entry.domContentLoadedEventEnd,
          page_load_total: entry.loadEventStart,
          page_load_transfer_size: entry.transferSize,
        };
      }
    }
  } catch (err) {
    log('Error while loading performance metrics', err);
  }

  for (const key of Object.keys(timings)) {
    timings[key] = asIntOrUndefined(timings[key]);
  }

  // Mark initial pageload as sent
  window.cronitor._initialPageLoadSent = true;

  return timings;
};
