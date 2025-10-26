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
      acertos: {
        Row: {
          base_comissao: number | null
          codigo: string
          created_at: string
          data_pagamento: string | null
          forma_pagamento: string | null
          id: string
          motorista_id: string
          observacoes: string | null
          percentual_comissao: number | null
          periodo_fim: string
          periodo_inicio: string
          recibo_url: string | null
          status: Database["public"]["Enums"]["status_acerto"] | null
          total_adiantamentos: number | null
          total_descontos: number | null
          total_pagar: number | null
          total_reembolsos: number | null
          updated_at: string
          valor_comissao: number | null
        }
        Insert: {
          base_comissao?: number | null
          codigo: string
          created_at?: string
          data_pagamento?: string | null
          forma_pagamento?: string | null
          id?: string
          motorista_id: string
          observacoes?: string | null
          percentual_comissao?: number | null
          periodo_fim: string
          periodo_inicio: string
          recibo_url?: string | null
          status?: Database["public"]["Enums"]["status_acerto"] | null
          total_adiantamentos?: number | null
          total_descontos?: number | null
          total_pagar?: number | null
          total_reembolsos?: number | null
          updated_at?: string
          valor_comissao?: number | null
        }
        Update: {
          base_comissao?: number | null
          codigo?: string
          created_at?: string
          data_pagamento?: string | null
          forma_pagamento?: string | null
          id?: string
          motorista_id?: string
          observacoes?: string | null
          percentual_comissao?: number | null
          periodo_fim?: string
          periodo_inicio?: string
          recibo_url?: string | null
          status?: Database["public"]["Enums"]["status_acerto"] | null
          total_adiantamentos?: number | null
          total_descontos?: number | null
          total_pagar?: number | null
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
          id: string
          tipo: string
          valor: number
          viagem_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          tipo: string
          valor: number
          viagem_id: string
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
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
          status: Database["public"]["Enums"]["status_viagem"] | null
          ultimo_acesso_em: string | null
          updated_at: string
          veiculo_id: string
        }
        Insert: {
          acerto_id?: string | null
          chegada_foto_url?: string | null
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
          status?: Database["public"]["Enums"]["status_viagem"] | null
          ultimo_acesso_em?: string | null
          updated_at?: string
          veiculo_id: string
        }
        Update: {
          acerto_id?: string | null
          chegada_foto_url?: string | null
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
