import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const hasConfig =
  firebaseConfig.apiKey &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.projectId;

let app;
let messaging;

if (hasConfig) {
  try {
    app = initializeApp(firebaseConfig);
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      messaging = getMessaging(app);
    }
  } catch (error) {
    console.error("Failed to initialize Firebase app client:", error);
  }
} else {
  console.warn(
    "Firebase client configuration is missing. FCM push notifications will run in Mock/Fallback mode."
  );
}

/**
 * Requests notification permissions and registers the service worker.
 * Returns the FCM token if successful.
 */
export const requestForToken = async () => {
  if (!hasConfig) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Build dynamic query parameters for the service worker
      const queryParams = new URLSearchParams(firebaseConfig).toString();
      const swUrl = `/firebase-messaging-sw.js?${queryParams}`;

      // Register service worker
      const registration = await navigator.serviceWorker.register(swUrl);
      console.log("Service Worker registered successfully with config parameters.");

      const currentToken = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (currentToken) {
        return currentToken;
      } else {
        console.warn("FCM token could not be retrieved.");
        return null;
      }
    } else {
      console.warn("Notification permission was not granted.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving FCM token:", err);
    return null;
  }
};

export const onMessageListener = (callback) => {
  if (messaging) {
    return onMessage(messaging, (payload) => {
      callback(payload);
    });
  }
};
