// Versão do aplicativo
// Atualizar este arquivo quando houver uma nova versão
export const APP_VERSION = '1.0.3';
export const APP_NAME = 'Logística Flash';
export const BUILD_DATE = new Date().toISOString().split('T')[0];

export function getVersionInfo() {
  return {
    current: APP_VERSION,
    name: APP_NAME,
    buildDate: BUILD_DATE,
  };
}
