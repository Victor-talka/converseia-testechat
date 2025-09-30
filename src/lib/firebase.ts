import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Verificar se as configurações do Firebase estão disponíveis
const hasFirebaseConfig = () => {
  const required = [
    import.meta.env.VITE_FIREBASE_API_KEY,
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
  ];
  
  return required.every(value => value && value !== "demo-key" && value !== "your-api-key-here");
};

// Configuração do Firebase - só inicializa se estiver configurado
let app = null;
let db = null;

if (hasFirebaseConfig()) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    // Inicializar Firebase
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    console.log("✅ Firebase conectado com sucesso");
  } catch (error) {
    console.warn("⚠️ Erro ao conectar Firebase, usando localStorage:", error);
    app = null;
    db = null;
  }
} else {
  console.log("ℹ️ Firebase não configurado, usando localStorage");
}

// Função para verificar se Firebase está disponível
export const isFirebaseAvailable = () => {
  return db !== null;
};

export { db, app };
export default app;