import { Building2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';

export function EmpresaHeader() {
  const { empresaNome, empresaStatus, isSuperAdmin } = useAuth();
  
  if (isSuperAdmin || !empresaNome) return null;
  
  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{empresaNome}</span>
      {empresaStatus === 'trial' && (
        <Badge variant="secondary" className="text-xs">
          Trial
        </Badge>
      )}
      {empresaStatus === 'trial_expirado' && (
        <Badge variant="destructive" className="text-xs">
          Trial Expirado
        </Badge>
      )}
    </div>
  );
}
