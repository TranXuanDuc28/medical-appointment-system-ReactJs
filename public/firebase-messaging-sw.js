importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Parse credentials passed as query parameters during service worker registration
const urlParams = new URLSearchParams(location.search);
const apiKey = urlParams.get('apiKey');
const authDomain = urlParams.get('authDomain');
const projectId = urlParams.get('projectId');
const storageBucket = urlParams.get('storageBucket');
const messagingSenderId = urlParams.get('messagingSenderId');
const appId = urlParams.get('appId');

if (apiKey && messagingSenderId && projectId) {
  firebase.initializeApp({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  });

  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title || 'Thông báo từ Hệ thống';
    const notificationOptions = {
      body: payload.notification.body || 'Bạn có một thông báo mới.',
      icon: '/favicon.ico',
      data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} else {
  console.warn('[firebase-messaging-sw.js] Missing Firebase credentials in query parameters. Background messaging not initialized.');
}
