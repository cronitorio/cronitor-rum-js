import { log } from './helpers';
import { captureError, track } from './commands';
import { onCLS, onFID, onLCP } from 'web-vitals';

export function listenForErrors() {
  if (!!window?.cronitor?._listeningForErrors) {
    return;
  }

  window.addEventListener('error', captureError);
  window.cronitor._listeningForErrors = true;

  log('Listening for errors');
}

export function listenForCoreWebVitals() {
  if (!!window?.cronitor?._listeningForCoreWebVitals) {
    return;
  }

  const handler = (eventName: any, dimension: any) => (event: any) => {
    track(eventName, { [dimension]: event.value });
  };

  onCLS(handler('WebVital', 'web_vital_cls'));
  onFID(handler('WebVital', 'web_vital_fid'));
  onLCP(handler('WebVital', 'web_vital_lcp'));

  window.cronitor._listeningForCoreWebVitals = true;

  log('Listening for Core Web Vitals');
}
