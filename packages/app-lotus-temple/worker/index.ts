import iconLixi from '@assets/notification_icon_lixi_192x192_96dpi.png';

// To disable all workbox logging during development, you can set self.__WB_DISABLE_DEV_LOGS to true
// https://developers.google.com/web/tools/workbox/guides/configure-workbox#disable_logging
self.__WB_DISABLE_DEV_LOGS = false;

self.addEventListener('pushsubscriptionchange', (event) => {
    // HOW TO TEST THIS?
    // Run this in your browser console: 
    //     window.navigator.serviceWorker.controller.postMessage({command: 'log', message: 'hello world'})
    // OR use next-pwa injected workbox object
    window.workbox.messageSW({ command: 'pushsubscriptionchange', message: 'pushsubscriptionchange' })
});

const getFocusedWindow = async () => {
    return self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then(windowClients => {
        return windowClients.find(windowClient => windowClient.focused);
    });
}

// Push Notification Event Handling
self.addEventListener('push', (event) => {
    const promiseChain = getFocusedWindow()
        .then(async (focusedWindow) => {
            const notification = event.data.json();
            const { message, url } = notification;
            let options = {
                body: message,
                icon: '/logo192.png',
                tag: "push-notification-tag",
                silent: false,
                data: {
                    url: `${process.env.NEXT_PUBLIC_LIXI_URL}${url}`,
                }
            };

            if (!focusedWindow) {
                registration.showNotification('Notification', options);
            }
        })

    event.waitUntil(promiseChain);
})

self.addEventListener('notificationclick', function (event) {
    const { notification } = event;
    const { data } = notification;
    if (data && data.url) {
        event.notification.close(); // Android needs explicit close.
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(windowClients => {
                // Check if there is already a window/tab open with the target URL
                for (var i = 0; i < windowClients.length; i++) {
                    var client = windowClients[i];
                    // If so, just focus it.
                    if (client.url === data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If not, then open the target URL in a new window/tab.
                if (clients.openWindow) {
                    return clients.openWindow(data.url);
                }
            })
        );
    }
});