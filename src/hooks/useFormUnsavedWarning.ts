import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

/**
 * Hook para avisar usuário sobre dados não salvos ao sair da página
 */
export function useFormUnsavedWarning<T>(
  form: UseFormReturn<T>,
  isOpen: boolean
) {
  const { formState } = form;

  useEffect(() => {
    if (!isOpen || !formState.isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isOpen, formState.isDirty]);
}
