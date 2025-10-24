import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMotoristasAtivos, useVeiculosAtivos } from '@/hooks/useViagens';

interface FiltrosRelatorioProps {
  filtros: {
    dataInicio: string;
    dataFim: string;
    motoristaId: string;
    veiculoId: string;
    clienteNome: string;
    status: string;
  };
  onChange: (filtros: any) => void;
}

export function FiltrosRelatorio({ filtros, onChange }: FiltrosRelatorioProps) {
  const { data: motoristas = [] } = useMotoristasAtivos();
  const { data: veiculos = [] } = useVeiculosAtivos();

  const handleChange = (key: string, value: string) => {
    onChange({ ...filtros, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="dataInicio">Data Início</Label>
        <Input
          id="dataInicio"
          type="date"
          value={filtros.dataInicio}
          onChange={(e) => handleChange('dataInicio', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dataFim">Data Fim</Label>
        <Input
          id="dataFim"
          type="date"
          value={filtros.dataFim}
          onChange={(e) => handleChange('dataFim', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motorista">Motorista</Label>
        <Select value={filtros.motoristaId} onValueChange={(value) => handleChange('motoristaId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {motoristas.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="veiculo">Veículo</Label>
        <Select value={filtros.veiculoId} onValueChange={(value) => handleChange('veiculoId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {veiculos.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.placa} - {v.modelo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cliente">Cliente</Label>
        <Input
          id="cliente"
          placeholder="Nome do cliente"
          value={filtros.clienteNome}
          onChange={(e) => handleChange('clienteNome', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={filtros.status} onValueChange={(value) => handleChange('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="planejada">Planejada</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
