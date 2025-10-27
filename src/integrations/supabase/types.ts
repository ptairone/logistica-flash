export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      acerto_ajustes: {
        Row: {
          acerto_id: string
          categoria: string
          comprovante_url: string | null
          created_at: string
          created_by: string | null
          descricao: string
          id: string
          justificativa: string | null
          tipo: string
          valor: number
        }
        Insert: {
          acerto_id: string
          categoria: string
          comprovante_url?: string | null
          created_at?: string
          created_by?: string | null
          descricao: string
          id?: string
          justificativa?: string | null
          tipo: string
          valor: number
        }
        Update: {
          acerto_id?: string
          categoria?: string
          comprovante_url?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string
          id?: string
          justificativa?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "acerto_ajustes_acerto_id_fkey"
            columns: ["acerto_id"]
            isOneToOne: false
            referencedRelation: "acertos"
            referencedColumns: ["id"]
          },
        ]
      }
      acerto_debitos: {
        Row: {
          acerto_id: string | null
          created_at: string
          data_vencimento: string | null
          descricao: string
          id: string
          motorista_id: string
          observacoes: string | null
          parcelas: number | null
          saldo: number
          status: string
          tipo: string
          updated_at: string
          valor_original: number
          valor_pago: number
        }
        Insert: {
          acerto_id?: string | null
          created_at?: string
          data_vencimento?: string | null
          descricao: string
          id?: string
          motorista_id: string
          observacoes?: string | null
          parcelas?: number | null
          saldo: number
          status?: string
          tipo: string
          updated_at?: string
          valor_original: number
          valor_pago?: number
        }
        Update: {
          acerto_id?: string | null
          created_at?: string
          data_vencimento?: string | null
          descricao?: string
          id?: string
          motorista_id?: string
          observacoes?: string | null
          parcelas?: number | null
          saldo?: number
          status?: string
          tipo?: string
          updated_at?: string
          valor_original?: number
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "acerto_debitos_acerto_id_fkey"
            columns: ["acerto_id"]
            isOneToOne: false
            referencedRelation: "acertos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acerto_debitos_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
        ]
      }
      acertos: {
        Row: {
          base_comissao: number | null
          codigo: string
          comprovantes_validados: boolean | null
          created_at: string
          data_criacao: string
          data_pagamento: string | null
          data_revisao: string | null
          etapa_atual: string | null
          forma_pagamento: string | null
          historico_alteracoes: Json | null
          id: string
          motorista_id: string
          observacoes: string | null
          percentual_comissao: number | null
          periodo_fim: string
          periodo_inicio: string
          recibo_url: string | null
          revisado_por: string | null
          status: Database["public"]["Enums"]["status_acerto"] | null
          total_adiantamentos: number | null
          total_ajustes_admin: number | null
          total_bonificacoes: number | null
          total_debitos_descontados: number | null
          total_descontos: number | null
          total_pagar: number | null
          total_penalidades: number | null
          total_reembolsos: number | null
          updated_at: string
          valor_comissao: number | null
        }
        Insert: {
          base_comissao?: number | null
          codigo: string
          comprovantes_validados?: boolean | null
          created_at?: string
          data_criacao?: string
          data_pagamento?: string | null
          data_revisao?: string | null
          etapa_atual?: string | null
          forma_pagamento?: string | null
          historico_alteracoes?: Json | null
          id?: string
          motorista_id: string
          observacoes?: string | null
          percentual_comissao?: number | null
          periodo_fim: string
          periodo_inicio: string
          recibo_url?: string | null
          revisado_por?: string | null
          status?: Database["public"]["Enums"]["status_acerto"] | null
          total_adiantamentos?: number | null
          total_ajustes_admin?: number | null
          total_bonificacoes?: number | null
          total_debitos_descontados?: number | null
          total_descontos?: number | null
          total_pagar?: number | null
          total_penalidades?: number | null
          total_reembolsos?: number | null
          updated_at?: string
          valor_comissao?: number | null
        }
        Update: {
          base_comissao?: number | null
          codigo?: string
          comprovantes_validados?: boolean | null
          created_at?: string
          data_criacao?: string
          data_pagamento?: string | null
          data_revisao?: string | null
          etapa_atual?: string | null
          forma_pagamento?: string | null
          historico_alteracoes?: Json | null
          id?: string
          motorista_id?: string
          observacoes?: string | null
          percentual_comissao?: number | null
          periodo_fim?: string
          periodo_inicio?: string
          recibo_url?: string | null
          revisado_por?: string | null
          status?: Database["public"]["Enums"]["status_acerto"] | null
          total_adiantamentos?: number | null
          total_ajustes_admin?: number | null
          total_bonificacoes?: number | null
          total_debitos_descontados?: number | null
          total_descontos?: number | null
          total_pagar?: number | null
          total_penalidades?: number | null
          total_reembolsos?: number | null
          updated_at?: string
          valor_comissao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "acertos_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
        ]
      }
      acertos_clt: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          codigo: string
          created_at: string
          created_by: string | null
          dias_trabalhados: number
          id: string
          motorista_id: string
          observacoes: string | null
          periodo_fim: string
          periodo_inicio: string
          salario_base: number
          status: string
          tipo_entrada: string
          total_bruto: number
          total_descontos: number
          total_diarias: number
          total_horas_extras: number
          total_horas_fds: number
          total_horas_feriados: number
          total_liquido: number
          updated_at: string
          valor_horas_extras: number
          valor_horas_fds: number
          valor_horas_feriados: number
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          codigo: string
          created_at?: string
          created_by?: string | null
          dias_trabalhados?: number
          id?: string
          motorista_id: string
          observacoes?: string | null
          periodo_fim: string
          periodo_inicio: string
          salario_base?: number
          status?: string
          tipo_entrada?: string
          total_bruto?: number
          total_descontos?: number
          total_diarias?: number
          total_horas_extras?: number
          total_horas_fds?: number
          total_horas_feriados?: number
          total_liquido?: number
          updated_at?: string
          valor_horas_extras?: number
          valor_horas_fds?: number
          valor_horas_feriados?: number
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          codigo?: string
          created_at?: string
          created_by?: string | null
          dias_trabalhados?: number
          id?: string
          motorista_id?: string
          observacoes?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          salario_base?: number
          status?: string
          tipo_entrada?: string
          total_bruto?: number
          total_descontos?: number
          total_diarias?: number
          total_horas_extras?: number
          total_horas_fds?: number
          total_horas_feriados?: number
          total_liquido?: number
          updated_at?: string
          valor_horas_extras?: number
          valor_horas_fds?: number
          valor_horas_feriados?: number
        }
        Relationships: [
          {
            foreignKeyName: "acertos_clt_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
        ]
      }
      acertos_clt_dias: {
        Row: {
          acerto_clt_id: string
          created_at: string
          dados_rastreador: Json | null
          data: string
          dia_semana: number
          eh_feriado: boolean
          horas_em_movimento: number
          horas_extras: number
          horas_normais: number
          horas_parado_ligado: number
          horas_totais: number
          id: string
          nome_feriado: string | null
          origem: string
          updated_at: string
          valor_adicional_fds: number
          valor_adicional_feriado: number
          valor_diaria: number
          valor_horas_extras: number
          valor_total_dia: number
        }
        Insert: {
          acerto_clt_id: string
          created_at?: string
          dados_rastreador?: Json | null
          data: string
          dia_semana: number
          eh_feriado?: boolean
          horas_em_movimento?: number
          horas_extras?: number
          horas_normais?: number
          horas_parado_ligado?: number
          horas_totais?: number
          id?: string
          nome_feriado?: string | null
          origem?: string
          updated_at?: string
          valor_adicional_fds?: number
          valor_adicional_feriado?: number
          valor_diaria?: number
          valor_horas_extras?: number
          valor_total_dia?: number
        }
        Update: {
          acerto_clt_id?: string
          created_at?: string
          dados_rastreador?: Json | null
          data?: string
          dia_semana?: number
          eh_feriado?: boolean
          horas_em_movimento?: number
          horas_extras?: number
          horas_normais?: number
          horas_parado_ligado?: number
          horas_totais?: number
          id?: string
          nome_feriado?: string | null
          origem?: string
          updated_at?: string
          valor_adicional_fds?: number
          valor_adicional_feriado?: number
          valor_diaria?: number
          valor_horas_extras?: number
          valor_total_dia?: number
        }
        Relationships: [
          {
            foreignKeyName: "acertos_clt_dias_acerto_clt_id_fkey"
            columns: ["acerto_clt_id"]
            isOneToOne: false
            referencedRelation: "acertos_clt"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_estoque: {
        Row: {
          cor: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      despesas: {
        Row: {
          anexo_url: string | null
          created_at: string
          data: string
          descricao: string | null
          id: string
          latitude: number | null
          localizacao_timestamp: string | null
          longitude: number | null
          origem: string | null
          reembolsavel: boolean | null
          tipo: Database["public"]["Enums"]["tipo_despesa"]
          valor: number
          viagem_id: string
        }
        Insert: {
          anexo_url?: string | null
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          latitude?: number | null
          localizacao_timestamp?: string | null
          longitude?: number | null
          origem?: string | null
          reembolsavel?: boolean | null
          tipo: Database["public"]["Enums"]["tipo_despesa"]
          valor: number
          viagem_id: string
        }
        Update: {
          anexo_url?: string | null
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          latitude?: number | null
          localizacao_timestamp?: string | null
          longitude?: number | null
          origem?: string | null
          reembolsavel?: boolean | null
          tipo?: Database["public"]["Enums"]["tipo_despesa"]
          valor?: number
          viagem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "despesas_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas_validacao: {
        Row: {
          acerto_id: string
          created_at: string
          despesa_id: string
          id: string
          justificativa: string | null
          observacoes: string | null
          status: string
          validado_em: string | null
          validado_por: string | null
          valor_aprovado: number | null
          valor_original: number
        }
        Insert: {
          acerto_id: string
          created_at?: string
          despesa_id: string
          id?: string
          justificativa?: string | null
          observacoes?: string | null
          status?: string
          validado_em?: string | null
          validado_por?: string | null
          valor_aprovado?: number | null
          valor_original: number
        }
        Update: {
          acerto_id?: string
          created_at?: string
          despesa_id?: string
          id?: string
          justificativa?: string | null
          observacoes?: string | null
          status?: string
          validado_em?: string | null
          validado_por?: string | null
          valor_aprovado?: number | null
          valor_original?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_validacao_acerto_id_fkey"
            columns: ["acerto_id"]
            isOneToOne: false
            referencedRelation: "acertos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_validacao_despesa_id_fkey"
            columns: ["despesa_id"]
            isOneToOne: false
            referencedRelation: "despesas"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          created_at: string
          created_by: string | null
          entidade_id: string
          id: string
          mime_type: string | null
          nome: string
          tamanho: number | null
          tipo_documento: string | null
          tipo_entidade: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entidade_id: string
          id?: string
          mime_type?: string | null
          nome: string
          tamanho?: number | null
          tipo_documento?: string | null
          tipo_entidade: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entidade_id?: string
          id?: string
          mime_type?: string | null
          nome?: string
          tamanho?: number | null
          tipo_documento?: string | null
          tipo_entidade?: string
          url?: string
        }
        Relationships: []
      }
      fretes: {
        Row: {
          cliente_cnpj_cpf: string
          cliente_contato: string | null
          cliente_nome: string
          codigo: string
          condicao_pagamento: string | null
          created_at: string
          data_coleta: string | null
          data_entrega: string | null
          destino: string
          destino_cep: string | null
          destino_cidade: string | null
          destino_logradouro: string | null
          destino_numero: string | null
          destino_ponto_referencia: string | null
          destino_uf: string | null
          id: string
          numero_fatura: string | null
          observacoes: string | null
          origem: string
          origem_cep: string | null
          origem_cidade: string | null
          origem_logradouro: string | null
          origem_numero: string | null
          origem_ponto_referencia: string | null
          origem_uf: string | null
          peso: number | null
          produto: string | null
          status: Database["public"]["Enums"]["status_frete"] | null
          tipo_carga: string | null
          updated_at: string
          valor_frete: number
          volume: number | null
        }
        Insert: {
          cliente_cnpj_cpf: string
          cliente_contato?: string | null
          cliente_nome: string
          codigo: string
          condicao_pagamento?: string | null
          created_at?: string
          data_coleta?: string | null
          data_entrega?: string | null
          destino: string
          destino_cep?: string | null
          destino_cidade?: string | null
          destino_logradouro?: string | null
          destino_numero?: string | null
          destino_ponto_referencia?: string | null
          destino_uf?: string | null
          id?: string
          numero_fatura?: string | null
          observacoes?: string | null
          origem: string
          origem_cep?: string | null
          origem_cidade?: string | null
          origem_logradouro?: string | null
          origem_numero?: string | null
          origem_ponto_referencia?: string | null
          origem_uf?: string | null
          peso?: number | null
          produto?: string | null
          status?: Database["public"]["Enums"]["status_frete"] | null
          tipo_carga?: string | null
          updated_at?: string
          valor_frete: number
          volume?: number | null
        }
        Update: {
          cliente_cnpj_cpf?: string
          cliente_contato?: string | null
          cliente_nome?: string
          codigo?: string
          condicao_pagamento?: string | null
          created_at?: string
          data_coleta?: string | null
          data_entrega?: string | null
          destino?: string
          destino_cep?: string | null
          destino_cidade?: string | null
          destino_logradouro?: string | null
          destino_numero?: string | null
          destino_ponto_referencia?: string | null
          destino_uf?: string | null
          id?: string
          numero_fatura?: string | null
          observacoes?: string | null
          origem?: string
          origem_cep?: string | null
          origem_cidade?: string | null
          origem_logradouro?: string | null
          origem_numero?: string | null
          origem_ponto_referencia?: string | null
          origem_uf?: string | null
          peso?: number | null
          produto?: string | null
          status?: Database["public"]["Enums"]["status_frete"] | null
          tipo_carga?: string | null
          updated_at?: string
          valor_frete?: number
          volume?: number | null
        }
        Relationships: []
      }
      itens_estoque: {
        Row: {
          categoria: string | null
          codigo: string
          created_at: string
          custo_medio: number | null
          descricao: string
          estoque_atual: number | null
          estoque_minimo: number | null
          fornecedor: string | null
          id: string
          local: string | null
          observacoes: string | null
          unidade: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          codigo: string
          created_at?: string
          custo_medio?: number | null
          descricao: string
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fornecedor?: string | null
          id?: string
          local?: string | null
          observacoes?: string | null
          unidade: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          codigo?: string
          created_at?: string
          custo_medio?: number | null
          descricao?: string
          estoque_atual?: number | null
          estoque_minimo?: number | null
          fornecedor?: string | null
          id?: string
          local?: string | null
          observacoes?: string | null
          unidade?: string
          updated_at?: string
        }
        Relationships: []
      }
      logs_auditoria: {
        Row: {
          acao: string
          created_at: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          registro_id: string
          tabela: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          registro_id: string
          tabela: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          registro_id?: string
          tabela?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      manutencoes: {
        Row: {
          created_at: string
          custo: number | null
          data: string
          descricao: string | null
          fornecedor: string | null
          id: string
          km_veiculo: number | null
          observacoes: string | null
          tipo: string
          veiculo_id: string
        }
        Insert: {
          created_at?: string
          custo?: number | null
          data: string
          descricao?: string | null
          fornecedor?: string | null
          id?: string
          km_veiculo?: number | null
          observacoes?: string | null
          tipo: string
          veiculo_id: string
        }
        Update: {
          created_at?: string
          custo?: number | null
          data?: string
          descricao?: string | null
          fornecedor?: string | null
          id?: string
          km_veiculo?: number | null
          observacoes?: string | null
          tipo?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manutencoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      motoristas: {
        Row: {
          cnh: string
          comissao_padrao: number | null
          cpf: string
          created_at: string
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          status: Database["public"]["Enums"]["status_veiculo"] | null
          telefone: string | null
          updated_at: string
          user_id: string | null
          validade_cnh: string
        }
        Insert: {
          cnh: string
          comissao_padrao?: number | null
          cpf: string
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_veiculo"] | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
          validade_cnh: string
        }
        Update: {
          cnh?: string
          comissao_padrao?: number | null
          cpf?: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["status_veiculo"] | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
          validade_cnh?: string
        }
        Relationships: []
      }
      motoristas_config_clt: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          motorista_id: string
          salario_base: number
          updated_at: string
          valor_diaria: number
          valor_hora_extra: number
          valor_hora_fds: number
          valor_hora_feriado: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          motorista_id: string
          salario_base?: number
          updated_at?: string
          valor_diaria?: number
          valor_hora_extra?: number
          valor_hora_fds?: number
          valor_hora_feriado?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          motorista_id?: string
          salario_base?: number
          updated_at?: string
          valor_diaria?: number
          valor_hora_extra?: number
          valor_hora_fds?: number
          valor_hora_feriado?: number
        }
        Relationships: [
          {
            foreignKeyName: "motoristas_config_clt_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: true
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_estoque: {
        Row: {
          created_at: string
          custo_unitario: number | null
          data: string
          id: string
          item_id: string
          motivo: string | null
          quantidade: number
          referencia_viagem_id: string | null
          tipo: Database["public"]["Enums"]["tipo_movimentacao"]
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          custo_unitario?: number | null
          data?: string
          id?: string
          item_id: string
          motivo?: string | null
          quantidade: number
          referencia_viagem_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_movimentacao"]
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          custo_unitario?: number | null
          data?: string
          id?: string
          item_id?: string
          motivo?: string | null
          quantidade?: number
          referencia_viagem_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_movimentacao"]
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "itens_estoque"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_referencia_viagem_id_fkey"
            columns: ["referencia_viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transacoes_viagem: {
        Row: {
          created_at: string
          data: string
          descricao: string | null
          forma_pagamento: string | null
          id: string
          latitude: number | null
          localizacao_timestamp: string | null
          longitude: number | null
          tipo: string
          valor: number
          viagem_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          latitude?: number | null
          localizacao_timestamp?: string | null
          longitude?: number | null
          tipo: string
          valor: number
          viagem_id: string
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          latitude?: number | null
          localizacao_timestamp?: string | null
          longitude?: number | null
          tipo?: string
          valor?: number
          viagem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_viagem_viagem_id_fkey"
            columns: ["viagem_id"]
            isOneToOne: false
            referencedRelation: "viagens"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      veiculos: {
        Row: {
          ano: number | null
          capacidade_kg: number | null
          capacidade_m3: number | null
          codigo_interno: string
          created_at: string
          em_viagem: boolean | null
          id: string
          km_atual: number | null
          marca: string
          modelo: string
          observacoes: string | null
          placa: string
          proxima_manutencao_data: string | null
          proxima_manutencao_km: number | null
          renavam: string | null
          status: Database["public"]["Enums"]["status_veiculo"] | null
          tipo: Database["public"]["Enums"]["tipo_veiculo"]
          updated_at: string
          vencimento_ipva: string | null
          vencimento_licenciamento: string | null
          vencimento_seguro: string | null
        }
        Insert: {
          ano?: number | null
          capacidade_kg?: number | null
          capacidade_m3?: number | null
          codigo_interno: string
          created_at?: string
          em_viagem?: boolean | null
          id?: string
          km_atual?: number | null
          marca: string
          modelo: string
          observacoes?: string | null
          placa: string
          proxima_manutencao_data?: string | null
          proxima_manutencao_km?: number | null
          renavam?: string | null
          status?: Database["public"]["Enums"]["status_veiculo"] | null
          tipo: Database["public"]["Enums"]["tipo_veiculo"]
          updated_at?: string
          vencimento_ipva?: string | null
          vencimento_licenciamento?: string | null
          vencimento_seguro?: string | null
        }
        Update: {
          ano?: number | null
          capacidade_kg?: number | null
          capacidade_m3?: number | null
          codigo_interno?: string
          created_at?: string
          em_viagem?: boolean | null
          id?: string
          km_atual?: number | null
          marca?: string
          modelo?: string
          observacoes?: string | null
          placa?: string
          proxima_manutencao_data?: string | null
          proxima_manutencao_km?: number | null
          renavam?: string | null
          status?: Database["public"]["Enums"]["status_veiculo"] | null
          tipo?: Database["public"]["Enums"]["tipo_veiculo"]
          updated_at?: string
          vencimento_ipva?: string | null
          vencimento_licenciamento?: string | null
          vencimento_seguro?: string | null
        }
        Relationships: []
      }
      viagens: {
        Row: {
          acerto_id: string | null
          chegada_foto_url: string | null
          chegada_latitude: number | null
          chegada_localizacao_timestamp: string | null
          chegada_longitude: number | null
          codigo: string
          created_at: string
          data_chegada: string | null
          data_saida: string | null
          destino: string
          destino_cep: string | null
          driver_form_token: string | null
          driver_form_url: string | null
          frete_id: string | null
          id: string
          km_estimado: number | null
          km_final: number | null
          km_inicial: number | null
          km_percorrido: number | null
          link_expires_at: string | null
          link_status: string | null
          motorista_id: string
          notas: string | null
          origem: string
          origem_cep: string | null
          partida_foto_url: string | null
          partida_latitude: number | null
          partida_localizacao_timestamp: string | null
          partida_longitude: number | null
          status: Database["public"]["Enums"]["status_viagem"] | null
          ultimo_acesso_em: string | null
          updated_at: string
          veiculo_id: string
        }
        Insert: {
          acerto_id?: string | null
          chegada_foto_url?: string | null
          chegada_latitude?: number | null
          chegada_localizacao_timestamp?: string | null
          chegada_longitude?: number | null
          codigo: string
          created_at?: string
          data_chegada?: string | null
          data_saida?: string | null
          destino: string
          destino_cep?: string | null
          driver_form_token?: string | null
          driver_form_url?: string | null
          frete_id?: string | null
          id?: string
          km_estimado?: number | null
          km_final?: number | null
          km_inicial?: number | null
          km_percorrido?: number | null
          link_expires_at?: string | null
          link_status?: string | null
          motorista_id: string
          notas?: string | null
          origem: string
          origem_cep?: string | null
          partida_foto_url?: string | null
          partida_latitude?: number | null
          partida_localizacao_timestamp?: string | null
          partida_longitude?: number | null
          status?: Database["public"]["Enums"]["status_viagem"] | null
          ultimo_acesso_em?: string | null
          updated_at?: string
          veiculo_id: string
        }
        Update: {
          acerto_id?: string | null
          chegada_foto_url?: string | null
          chegada_latitude?: number | null
          chegada_localizacao_timestamp?: string | null
          chegada_longitude?: number | null
          codigo?: string
          created_at?: string
          data_chegada?: string | null
          data_saida?: string | null
          destino?: string
          destino_cep?: string | null
          driver_form_token?: string | null
          driver_form_url?: string | null
          frete_id?: string | null
          id?: string
          km_estimado?: number | null
          km_final?: number | null
          km_inicial?: number | null
          km_percorrido?: number | null
          link_expires_at?: string | null
          link_status?: string | null
          motorista_id?: string
          notas?: string | null
          origem?: string
          origem_cep?: string | null
          partida_foto_url?: string | null
          partida_latitude?: number | null
          partida_localizacao_timestamp?: string | null
          partida_longitude?: number | null
          status?: Database["public"]["Enums"]["status_viagem"] | null
          ultimo_acesso_em?: string | null
          updated_at?: string
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_viagens_acerto"
            columns: ["acerto_id"]
            isOneToOne: false
            referencedRelation: "acertos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viagens_frete_id_fkey"
            columns: ["frete_id"]
            isOneToOne: false
            referencedRelation: "fretes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viagens_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viagens_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "operacional" | "motorista" | "financeiro"
      status_acerto: "aberto" | "fechado" | "pago"
      status_frete:
        | "aberto"
        | "em_transito"
        | "entregue"
        | "faturado"
        | "cancelado"
      status_veiculo: "ativo" | "inativo" | "manutencao"
      status_viagem: "planejada" | "em_andamento" | "concluida" | "cancelada"
      tipo_despesa:
        | "combustivel"
        | "pedagio"
        | "diaria"
        | "manutencao"
        | "alimentacao"
        | "outros"
      tipo_movimentacao: "entrada" | "saida" | "ajuste"
      tipo_veiculo: "caminhao" | "carreta" | "utilitario" | "van" | "outros"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "operacional", "motorista", "financeiro"],
      status_acerto: ["aberto", "fechado", "pago"],
      status_frete: [
        "aberto",
        "em_transito",
        "entregue",
        "faturado",
        "cancelado",
      ],
      status_veiculo: ["ativo", "inativo", "manutencao"],
      status_viagem: ["planejada", "em_andamento", "concluida", "cancelada"],
      tipo_despesa: [
        "combustivel",
        "pedagio",
        "diaria",
        "manutencao",
        "alimentacao",
        "outros",
      ],
      tipo_movimentacao: ["entrada", "saida", "ajuste"],
      tipo_veiculo: ["caminhao", "carreta", "utilitario", "van", "outros"],
    },
  },
} as const
