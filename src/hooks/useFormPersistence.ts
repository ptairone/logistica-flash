import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

/**
 * Hook para persistir dados do formulário no sessionStorage
 * Restaura automaticamente ao reabrir e limpa após submit bem-sucedido
 */
export function useFormPersistence<T extends Record<string, any>>(
  formKey: string,
  form: UseFormReturn<T>,
  isOpen: boolean
) {
  const { watch, reset } = form;
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const initialLoadRef = useRef(false);

  // Restaurar dados do sessionStorage quando o dialog abre
  useEffect(() => {
    if (isOpen && !initialLoadRef.current) {
      const savedData = sessionStorage.getItem(formKey);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          reset(parsedData);
          console.log(`[Form Persistence] Dados restaurados: ${formKey}`);
        } catch (error) {
          console.error('[Form Persistence] Erro ao restaurar dados:', error);
          sessionStorage.removeItem(formKey);
        }
      }
      initialLoadRef.current = true;
    }

    // Reset quando fecha
    if (!isOpen) {
      initialLoadRef.current = false;
    }
  }, [isOpen, formKey, reset]);

  // Salvar dados automaticamente com debounce
  useEffect(() => {
    if (!isOpen) return;

    const subscription = watch((formData) => {
      // Limpar timer anterior
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Salvar após 1 segundo de inatividade
      debounceTimerRef.current = setTimeout(() => {
        try {
          sessionStorage.setItem(formKey, JSON.stringify(formData));
          console.log(`[Form Persistence] Dados salvos: ${formKey}`);
        } catch (error) {
          console.error('[Form Persistence] Erro ao salvar dados:', error);
        }
      }, 1000);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [watch, formKey, isOpen]);

  // Função para limpar dados salvos (chamar após submit bem-sucedido)
  const clearPersistedData = () => {
    sessionStorage.removeItem(formKey);
    console.log(`[Form Persistence] Dados limpos: ${formKey}`);
  };

  return { clearPersistedData };
}
