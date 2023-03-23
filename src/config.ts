import { log } from './helpers';
import { CronitorRUMEvent } from './collect';

/**
 * The CronitorRUM script configuration object.
 */
export interface CronitorRUMConfig {
  /**
   * Your site's client key.
   */
  clientKey?: string;
  /**
   * The environment for which you want to send events to. Unless provided, will use the Cronitor account default environment.
   */
  environment?: string;
  /**
   * Debug mode allows events to be sent on localhost, and logs to console. Default: false.
   */
  debug?: boolean;
  /**
   * Enables or disables the tracking script. If disabled, no events are ever sent. Default: true.
   */
  enabled?: boolean;
  /**
   * Enable to filter out events from localhost. Default: false.
   */
  filterLocalhost?: boolean;
  /**
   * Optionally define a function which modifies or skips events right before sending them to the analytics API.
   */
  beforeSend?: (payload: CronitorRUMEvent) => CronitorRUMEvent | undefined;
  /**
   * Override the ingestion API where the events will be sent to.
   */
  ingestionHost?: string;
  /**
   * Honor the Do-Not-Track (DNT) setting on the user's browser. Default: false.
   */
  honorDNT?: boolean;
  /**
   * Tracking mode. Default: 'history'.
   */
  trackMode?: 'pageload' | 'history' | 'off';
  /**
   * Whether the URL fragment (hash part) should be reported. Default: false.
   */
  includeURLFragment?: boolean;
  /**
   * Selectively include URL query params in the event data. Default: empty, no query params are collected.
   * Example:
   *    includeURLQueryParams: ["tab", "pageNum"]
   */
  includeURLQueryParams?: string[];
  /**
   * Whether the SDK should send Error events automatically.
   */
  autoTrackErrors?: boolean;
  /**
   * Whether the SDK should send Core Web Vital events automatically.
   */
  autoTrackCoreWebVitals?: boolean;
}

// Default RUM config
// Adding new config options is safe
// Do NOT change existing defaults - would break existing integrations
export let RUM_GLOBAL_CONFIG: CronitorRUMConfig = {
  ingestionHost: 'https://rum.cronitor.io',
  honorDNT: false,
  filterLocalhost: false,
  debug: false,
  trackMode: 'history',
  enabled: true,
  autoTrackErrors: true,
  autoTrackCoreWebVitals: true,
};

export const setConfig = (params: Partial<CronitorRUMConfig>) => {
  RUM_GLOBAL_CONFIG = { ...RUM_GLOBAL_CONFIG, ...params };
  log('Updated configuration', RUM_GLOBAL_CONFIG);
  return RUM_GLOBAL_CONFIG;
};
