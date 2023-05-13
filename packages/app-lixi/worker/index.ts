declare let self: ServiceWorkerGlobalScope

// To disable all workbox logging during development, you can set self.__WB_DISABLE_DEV_LOGS to true
// https://developers.google.com/web/tools/workbox/guides/configure-workbox#disable_logging
//
self.__WB_DISABLE_DEV_LOGS = true

self.addEventListener('pushsubscriptionchange', (event) => {
  // HOW TO TEST THIS?
  // Run this in your browser console: 
  //     window.navigator.serviceWorker.controller.postMessage({command: 'log', message: 'hello world'})
  // OR use next-pwa injected workbox object
  window.workbox.messageSW({ command: 'pushsubscriptionchange', message: 'pushsubscriptionchange' })
});