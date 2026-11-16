/// <reference lib="webworker" />
// Service worker do app: guarda os arquivos para abrir rápido e recebe as notificações do Firebase.
// Este arquivo é compilado pelo vite-plugin-pwa e fica de fora da checagem do tsconfig principal.
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging/sw';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<string | { url: string; revision: string | null }> };

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

self.skipWaiting();
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()));

// O Firebase mostra a notificação quando o app está fechado (mensagens com título e texto).
if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
  const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  });
  getMessaging(app);
}

// Ao tocar na notificação, abre o app (ou volta para ele se já estiver aberto).
self.addEventListener('notificationclick', (evento) => {
  evento.notification.close();
  evento.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
      const aberta = janelas[0];
      return aberta ? aberta.focus() : self.clients.openWindow('/');
    })
  );
});
