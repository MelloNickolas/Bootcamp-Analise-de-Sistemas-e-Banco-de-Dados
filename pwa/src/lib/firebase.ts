import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const firebaseConfigurado = Boolean(config.apiKey && config.projectId && config.messagingSenderId && config.appId && vapidKey);

const CHAVE_TOKEN = 'tomodachi:token-push';

export function tokenSalvo(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function guardarToken(token: string) {
  try {
    localStorage.setItem(CHAVE_TOKEN, token);
  } catch {
    // sem armazenamento: o app continua funcionando, só não lembra o estado
  }
}

export function nomeDoAparelho(): string {
  return /iPhone/i.test(navigator.userAgent) ? 'iPhone' : /iPad/i.test(navigator.userAgent) ? 'iPad' : 'Navegador';
}

// Pede a permissão e devolve o token que identifica este aparelho no Firebase.
export async function obterTokenDePush(): Promise<string> {
  if (!firebaseConfigurado) throw new Error('O Firebase ainda não foi configurado neste app.');
  if (typeof Notification === 'undefined' || !(await isSupported())) {
    throw new Error('Este navegador não recebe notificações. No iPhone, instale o app na Tela de Início e abra por lá.');
  }

  const permissao = await Notification.requestPermission();
  if (permissao !== 'granted') {
    throw new Error('A permissão foi negada. Libere as notificações do Tomodachi nos ajustes do aparelho.');
  }

  const registro = await navigator.serviceWorker.ready;
  const messaging = getMessaging(initializeApp(config));
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registro });
  if (!token) throw new Error('Não consegui gerar o código deste aparelho. Tente de novo.');
  return token;
}
