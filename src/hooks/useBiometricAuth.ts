import { useState, useEffect } from 'react';

const BIOMETRIC_STORAGE_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

interface BiometricCredentials {
  email: string;
  encryptedPassword: string;
  credentialId?: string;
}

export function useBiometricAuth() {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    checkBiometricEnabled();
  }, []);

  const checkBiometricAvailability = async () => {
    // Verifica se o navegador suporta WebAuthn
    if (window.PublicKeyCredential) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsBiometricAvailable(available);
      } catch (error) {
        console.error('Erro ao verificar biometria:', error);
        setIsBiometricAvailable(false);
      }
    }
  };

  const checkBiometricEnabled = () => {
    const enabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true';
    setIsBiometricEnabled(enabled);
  };

  const enableBiometric = async (email: string, password: string): Promise<boolean> => {
    if (!isBiometricAvailable) {
      return false;
    }

    try {
      // Cria credencial WebAuthn
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'Logística Flash',
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(email),
            name: email,
            displayName: email,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (credential) {
        // Encripta a senha de forma simples (em produção, usar criptografia mais robusta)
        const encryptedPassword = btoa(password);
        
        const credentialData: BiometricCredentials = {
          email,
          encryptedPassword,
          credentialId: credential.id,
        };

        localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(credentialData));
        localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
        setIsBiometricEnabled(true);
        
        return true;
      }
    } catch (error) {
      console.error('Erro ao configurar biometria:', error);
    }

    return false;
  };

  const authenticateWithBiometric = async (): Promise<{ email: string; password: string } | null> => {
    if (!isBiometricEnabled || !isBiometricAvailable) {
      return null;
    }

    try {
      const storedData = localStorage.getItem(BIOMETRIC_STORAGE_KEY);
      if (!storedData) {
        return null;
      }

      const credentials: BiometricCredentials = JSON.parse(storedData);
      
      // Solicita autenticação biométrica
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          allowCredentials: credentials.credentialId ? [{
            id: Uint8Array.from(atob(credentials.credentialId), c => c.charCodeAt(0)),
            type: 'public-key',
          }] : [],
          userVerification: 'required',
          timeout: 60000,
        },
      });

      if (assertion) {
        // Descriptografa a senha
        const password = atob(credentials.encryptedPassword);
        
        return {
          email: credentials.email,
          password,
        };
      }
    } catch (error) {
      console.error('Erro na autenticação biométrica:', error);
    }

    return null;
  };

  const disableBiometric = () => {
    localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
    localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    setIsBiometricEnabled(false);
  };

  const getSavedEmail = (): string | null => {
    try {
      const storedData = localStorage.getItem(BIOMETRIC_STORAGE_KEY);
      if (!storedData) return null;
      
      const credentials: BiometricCredentials = JSON.parse(storedData);
      return credentials.email;
    } catch {
      return null;
    }
  };

  return {
    isBiometricAvailable,
    isBiometricEnabled,
    enableBiometric,
    authenticateWithBiometric,
    disableBiometric,
    getSavedEmail,
  };
}
