"use strict";var f=Object.defineProperty;var U=Object.getOwnPropertyDescriptor;var k=Object.getOwnPropertyNames;var L=Object.prototype.hasOwnProperty;var M=(e,n)=>{for(var t in n)f(e,t,{get:n[t],enumerable:!0})},S=(e,n,t,o)=>{if(n&&typeof n=="object"||typeof n=="function")for(let a of k(n))!L.call(e,a)&&a!==t&&f(e,a,{get:()=>n[a],enumerable:!(o=U(n,a))||o.enumerable});return e};var T=e=>S(f({},"__esModule",{value:!0}),e);var H={};M(H,{captureError:()=>u,config:()=>m,load:()=>R,track:()=>s});module.exports=T(H);var c={DEBUG_FLAG:"cronitor_rum_debug",TRACKING_ENABLED:"cronitor_rum_enable",TRACKING_DISABLED:"cronitor_rum_disable"};var g=e=>window&&window.location.search.indexOf(e)>-1,w=()=>{let e=g(c.TRACKING_ENABLED),n=g(c.TRACKING_DISABLED);if(e||n){if(!window.localStorage){r("Can't disable Cronitor RUM. This browser does not support local storage.",void 0,!0);return}e&&(window.localStorage.removeItem(c.TRACKING_DISABLED),r("Cronitor RUM has been enabled on this device.",void 0,!0)),n&&(window.localStorage.setItem(c.TRACKING_DISABLED,"true"),r("Cronitor RUM has been disabled on this device.",void 0,!0))}},_=()=>{if(window.history.pushState&&!window.cronitor._historyPatched){r("Single page app mode is set to 'history', patching History API");let e=window.history.pushState,n=()=>s("Pageview");window.history.pushState=function(){e.apply(this,arguments),n()},window.addEventListener("popstate",n),window.cronitor._historyPatched=!0,r("Listening for History API changes")}},r=(e,n,t)=>{let o=i.debug||g(c.DEBUG_FLAG);if(!t&&!o)return;let a=`[Cronitor RUM] ${e}`;n?console.log(a,n):console.log(a)};var i={ingestionHost:"https://rum.cronitor.io",honorDNT:!1,filterLocalhost:!1,debug:!1,trackMode:"history",enabled:!0,autoTrackErrors:!0,autoTrackCoreWebVitals:!0},b=e=>(i={...i,...e},r("Updated configuration",i),i);function v(e,n){return{client_key:i.clientKey,environment:i.environment,event_name:e,user_agent:I(),url:P(),referrer:D(),language:A(),connection_type:N(),screen_width:F(),timezone:G(),...x(),...O(e),...n||{}}}var P=()=>{let e=i.includeURLFragment?window.location.hash:"",n=[];if(i.includeURLQueryParams&&i.includeURLQueryParams.length>0){let o=new URLSearchParams(window.location.search);for(let a of i.includeURLQueryParams)if(o.has(a)){let p=o.get(a);p?n.push(`${a}=${p}`):n.push(`${a}`)}}let t="";return n&&n.length>0&&(t=`?${n.join("&")}`),window.location.protocol+"//"+window.location.hostname+window.location.pathname+t+e},I=()=>window.navigator.userAgent,l=e=>{let n=window.location.search.match(e);return n?n[2]:void 0},x=()=>({utm_source:l(/[?&](ref|source|utm_source)=([^?&]+)/),utm_campaign:l(/[?&](utm_campaign)=([^?&]+)/),utm_medium:l(/[?&](utm_medium)=([^?&]+)/),utm_content:l(/[?&](utm_content)=([^?&]+)/),utm_term:l(/[?&](utm_term)=([^?&]+)/)}),A=()=>{let e=window.navigator;return e?e.userLanguage||e.language:void 0},G=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone}catch{return}},N=()=>navigator.connection&&"effectiveType"in navigator.connection?navigator.connection.effectiveType:void 0,D=()=>{let e=document.referrer;if(e){let n=new URL(e);return n.hostname.toLowerCase()===window.location.hostname.toLowerCase()?void 0:n.protocol+"//"+n.hostname+n.pathname}},F=()=>window==null?void 0:window.innerWidth,B=e=>{try{if(e){let n=Math.ceil(e);return isNaN(n)||n<0?void 0:n}else return}catch{return}},O=e=>{let n={};if(e!=="Pageview"||window.cronitor._initialPageLoadSent)return n;try{let t=window.performance||window.mozPerformance||window.msPerformance||window.webkitPerformance||{};if(t.getEntriesByType){let o=t.getEntriesByType("navigation")[0];o&&(n={page_load_dns:o.domainLookupEnd-o.domainLookupStart,page_load_connect:o.connectEnd-o.connectStart,page_load_ssl:o.secureConnectionStart?o.requestStart-o.secureConnectionStart:void 0,page_load_ttfb:o.responseStart-o.requestStart,page_load_download:o.responseEnd-o.responseStart,page_load_dom_content_loaded:o.domContentLoadedEventEnd-o.responseEnd,page_load_render:o.domComplete-o.domContentLoadedEventEnd,page_load_total:o.loadEventStart,page_load_transfer_size:o.transferSize})}}catch(t){r("Error while loading performance metrics",t)}for(let t of Object.keys(n))n[t]=B(n[t]);return window.cronitor._initialPageLoadSent=!0,n};var h=async(e,n)=>{let t=v(e,n),o=V(t);o&&K(o)&&await W(o)},W=async e=>{let n=`${i.ingestionHost}/api/rum/events`,t=JSON.stringify(e);navigator.sendBeacon?navigator.sendBeacon(n,t):await fetch(n,{body:t,method:"POST",credentials:"omit",keepalive:!0}),r("Sent events",e)},K=e=>{if(!i.clientKey)return r("Bad configuration: missing clientKey",void 0,!0),!1;if(!e.event_name||!/^[a-zA-Z][a-zA-Z0-9\_\-\.]{0,63}$/.test(e.event_name)){r("Invalid event name.",void 0,!0);return}if(window.localStorage&&window.localStorage.getItem(c.TRACKING_DISABLED)||!i.enabled)return r("Skipping event collection, Cronitor RUM has been manually disabled on this browser.",void 0,!0),!1;if(!i.debug){if(i.honorDNT&&"doNotTrack"in window.navigator&&window.navigator.doNotTrack==="1")return r("Honoring 'Do Not Track'",void 0,!0),!1;if(i.filterLocalhost&&/^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*\:)*?:?0*1$/.test(window.location.hostname))return r("Skipping event collection, localhost filter enabled",void 0,!0),!1;if(window.location.protocol==="file:")return r("Can't track from file URLs",void 0,!0),!1;if(window.document.visibilityState==="prerender")return r("Skipping event collection, document is pre-rendering",void 0,!0),!1;if(window.navigator.webdriver)return r("Skipping event collection, navigation is automated",void 0,!0),!1}if(e.event_name==="Pageview"){let n=window.cronitor._previousPath,t=e.url;if(window.cronitor._previousPath=t,n&&n===t){r("Skipping event collection, duplicate pageview detected");return}}return!0},V=e=>{let n=e;if(i.beforeSend){let t;try{t=i.beforeSend({...e})}catch(o){console.error(o)}if(!t){r("beforeSend hook returned null or undefined, skipping event collection");return}t.client_key=e.client_key;for(let o of Object.keys(e))n[o]=t[o]}return n};function y(e,n){let t=!1;return(...o)=>{t||(t=!0,setTimeout(()=>{e(...o),t=!1},n))}}var d=require("web-vitals");function C(){var e;(e=window==null?void 0:window.cronitor)!=null&&e._listeningForErrors||(window.addEventListener("error",u),window.cronitor._listeningForErrors=!0,r("Listening for errors"))}function E(){var n;if((n=window==null?void 0:window.cronitor)!=null&&n._listeningForCoreWebVitals)return;let e=(t,o)=>a=>{s(t,{[o]:a.value})};(0,d.onCLS)(e("WebVital","web_vital_cls")),(0,d.onFID)(e("WebVital","web_vital_fid")),(0,d.onLCP)(e("WebVital","web_vital_lcp")),window.cronitor._listeningForCoreWebVitals=!0,r("Listening for Core Web Vitals")}var $=(e,n,t={})=>{switch(e){case"config":if(!n)return r("Passed empty config params");m(n);break;case"track":s(n,t);break;case"captureError":u(n,t);break;default:r("Unknown command",e,!0);return}},u=y((e,n={})=>{var t,o;s("Error",{error_type:((t=e.error)==null?void 0:t.name)||"Error",message:((o=e.error)==null?void 0:o.message)||e.message,lineno:e.lineno,colno:e.colno,filename:e.filename,...n})},1e3),s=(e,n={})=>{let t=()=>h(e,n);document.readyState==="complete"?setTimeout(t,0):(r("Document not ready, adding event listener"),window.addEventListener("load",()=>{setTimeout(t,0)}))},m=e=>{let n={...i},t=b(e);i.trackMode&&["pageload","history"].indexOf(i.trackMode)>-1&&(i.trackMode==="history"&&_(),!n.clientKey&&t.clientKey&&(r("Triggering initial pageview"),s("Pageview"))),r(`Tracking mode: ${i.trackMode}`)},R=(e,n)=>{m({clientKey:e,trackMode:"off",...n}),z()},z=()=>{w();let e=window.cronitor&&window.cronitor.q||[];window.cronitor=$,window.cronitor.q=e;for(let n of e)window.cronitor.apply(void 0,n);i.autoTrackErrors&&C(),i.autoTrackCoreWebVitals&&E()};0&&(module.exports={captureError,config,load,track});
