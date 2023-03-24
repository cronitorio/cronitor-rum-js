import { CronitorRUMInterpreter } from './commands';

export const constants = {
  DEBUG_FLAG: `cronitor_rum_debug`,
  TRACKING_ENABLED: `cronitor_rum_enable`,
  TRACKING_DISABLED: `cronitor_rum_disable`,
};

export interface CronitorRUMGlobals {
  _previousPath: any;
  _initialPageLoadSent: boolean;
  _listeningForCoreWebVitals: any;
  _listeningForErrors: any;
  _historyPatched: boolean;
  q?: any[];
}

declare global {
  interface Window {
    cronitor: CronitorRUMGlobals & CronitorRUMInterpreter;
  }
}
