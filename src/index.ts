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
   * Override the RUM script URL which is used for loading.
   */
  scriptSrc?: string;
  /**
   * Honor the Do-Not-Track (DNT) setting on the user's browser. Default: false.
   */
  honorDNT?: boolean;
  /**
   * Tracking mode. Default: 'history'.
   */
  trackMode?: 'pageload' | 'history' | 'off';
  /**
   * Whether or not the URL fragment (hash part) should be reported. Default: false.
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
}

interface CronitorRUMInterpreter {
  (command: 'track', eventName: string, dimensionOverrides?: any): void;
  (command: 'config', config: CronitorRUMConfig): void;
  q?: any[];
}

declare global {
  interface Window {
    cronitor: CronitorRUMInterpreter;
  }
}

const interpret: CronitorRUMInterpreter = function (command: any, arg1?: any, arg2?: any): void {
  // If real script already loaded (it's async), keep it
  // Otherwise inject temporary queue to hold events while it loads
  window.cronitor =
    window.cronitor ||
    function () {
      (window.cronitor.q = window.cronitor.q || []).push(arguments);
    };
  try {
    window.cronitor(command, arg1, arg2);
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.warn('There was an error while executing a CronitorRUM command', e);
  }
};

export const load = (clientKey: string, config?: CronitorRUMConfig): void => {
  const tracker = document.createElement('script');
  tracker.async = true;
  tracker.src = config?.scriptSrc ?? 'https://rum.cronitor.io/script.js';
  document.head.appendChild(tracker);

  interpret('config', {
    clientKey,
    // Disable auto-track on the JS client. Most projects using this library need
    // more control over the event handlers.
    trackMode: 'off',
    ...config,
  });
};

export const config = (config: CronitorRUMConfig): void => {
  interpret('config', config);
};

export const track = (eventName: string, dimensionOverrides?: any): void => {
  interpret('track', eventName, dimensionOverrides);
};
