import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const documentoSchema = {
  type: "object",
  properties: {
    fornecedor: {
      type: "object",
      properties: {
        razao: { type: "string" },
        cnpj: { type: "string" },
        inscricaoEstadual: { type: "string" },
        telefone: { type: "string" },
        email: { type: "string" }
      },
      required: ["razao", "cnpj"]
    },
    documento: {
      type: "object",
      properties: {
        tipo: { type: "string", enum: ["NFE", "DANFE", "FATURA", "OUTRO"] },
        chaveAcesso: { type: "string" },
        numero: { type: "string" },
        serie: { type: "string" },
        emissao: { type: "string" }
      },
      required: ["tipo", "numero"]
    },
    totais: {
      type: "object",
      properties: {
        valorProdutos: { type: "number" },
        frete: { type: "number" },
        descontos: { type: "number" },
        impostos: { type: "number" },
        valorTotal: { type: "number" }
      },
      required: ["valorTotal"]
    },
    itens: {
      type: "array",
      items: {
        type: "object",
        properties: {
          codigoFornecedor: { type: "string" },
          descricao: { type: "string" },
          ncm: { type: "string" },
          unidade: { type: "string" },
          quantidade: { type: "number" },
          valorUnitario: { type: "number" },
          valorTotal: { type: "number" }
        },
        required: ["descricao", "unidade", "quantidade"]
      },
      minItems: 1
    },
    confidences: {
      type: "object",
      additionalProperties: { type: "number" }
    },
    moeda: { type: "string", const: "BRL" },
    origemArquivo: {
      type: "object",
      properties: {
        nome: { type: "string" },
        tipo: { type: "string", enum: ["xml", "pdf"] }
      },
      required: ["tipo"]
    }
  },
  required: ["fornecedor", "documento", "itens", "moeda"],
  additionalProperties: false
};

async function processarXML(xmlContent: string, fileName: string) {
  console.log("Processando XML:", fileName);
  
  try {
    // Parse XML content (Deno não tem DOMParser nativo, precisamos usar regex ou outra lib)
    // Por simplicidade, vamos retornar estrutura mockada para XML
    console.warn("Processamento XML simplificado - em produção use uma lib XML adequada");
    
    // Parse XML básico usando regex (em produção, use uma lib XML adequada)
    const extractTag = (xml: string, tag: string): string => {
      const match = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`, 's'));
      return match ? match[1].trim() : '';
    };

    const fornecedor = {
      razao: extractTag(xmlContent, 'xNome') || extractTag(xmlContent, 'xFant'),
      cnpj: extractTag(xmlContent, 'CNPJ'),
      inscricaoEstadual: extractTag(xmlContent, 'IE'),
      telefone: extractTag(xmlContent, 'fone'),
      email: extractTag(xmlContent, 'email')
    };

    const documento = {
      tipo: "NFE" as const,
      chaveAcesso: extractTag(xmlContent, 'chNFe'),
      numero: extractTag(xmlContent, 'nNF'),
      serie: extractTag(xmlContent, 'serie'),
      emissao: extractTag(xmlContent, 'dhEmi').split('T')[0]
    };

    // Extrair primeiro item como exemplo
    const detMatch = xmlContent.match(/<det[^>]*>(.*?)<\/det>/s);
    const itens = [];
    
    if (detMatch) {
      const detContent = detMatch[1];
      itens.push({
        codigoFornecedor: extractTag(detContent, 'cProd'),
        descricao: extractTag(detContent, 'xProd'),
        ncm: extractTag(detContent, 'NCM'),
        unidade: extractTag(detContent, 'uCom'),
        quantidade: parseFloat(extractTag(detContent, 'qCom') || "0"),
        valorUnitario: parseFloat(extractTag(detContent, 'vUnCom') || "0"),
        valorTotal: parseFloat(extractTag(detContent, 'vProd') || "0")
      });
    }

    const totais = {
      valorProdutos: parseFloat(extractTag(xmlContent, 'vProd') || "0"),
      frete: parseFloat(extractTag(xmlContent, 'vFrete') || "0"),
      descontos: parseFloat(extractTag(xmlContent, 'vDesc') || "0"),
      impostos: parseFloat(extractTag(xmlContent, 'vTotTrib') || "0"),
      valorTotal: parseFloat(extractTag(xmlContent, 'vNF') || "0")
    };

    return {
      fornecedor,
      documento,
      itens,
      totais,
      moeda: "BRL" as const,
      origemArquivo: {
        nome: fileName,
        tipo: "xml" as const
      },
      confidences: {
        fornecedor: 1.0,
        documento: 1.0,
        itens: 1.0,
        totais: 1.0
      }
    };
  } catch (error: any) {
    console.error("Erro ao processar XML:", error);
    throw new Error(`Erro ao processar XML: ${error?.message || 'Erro desconhecido'}`);
  }
}

async function processarPDF(base64Content: string, fileName: string) {
  console.log("Processando PDF com IA:", fileName);

  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é um assistente especializado em extrair dados de documentos fiscais (NF-e, DANFE, faturas).
Extraia todas as informações seguindo EXATAMENTE o schema fornecido.
Para campos que não conseguir identificar, use valores vazios ou zero conforme o tipo.
Sempre forneça um objeto "confidences" com scores de 0 a 1 para cada seção extraída, indicando sua confiança na extração.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extraia os dados deste documento fiscal seguindo o schema fornecido. Inclua todos os itens encontrados."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64Content}`
                }
              }
            ]
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "documento_fiscal",
            strict: true,
            schema: documentoSchema
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da API OpenAI:", response.status, errorText);
      throw new Error(`Erro da API OpenAI: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Resposta da OpenAI:", JSON.stringify(data, null, 2));

    const extractedData = JSON.parse(data.choices[0].message.content);
    
    return {
      ...extractedData,
      origemArquivo: {
        nome: fileName,
        tipo: "pdf"
      }
    };
  } catch (error: any) {
    console.error("Erro ao processar PDF:", error);
    throw new Error(`Erro ao processar PDF: ${error?.message || 'Erro desconhecido'}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file, fileName, fileType } = await req.json();

    console.log("Processando arquivo:", fileName, "Tipo:", fileType);

    let resultado;

    if (fileType === "application/xml" || fileType === "text/xml" || fileName.toLowerCase().endsWith('.xml')) {
      // Processar XML
      const xmlContent = atob(file.split(',')[1] || file);
      resultado = await processarXML(xmlContent, fileName);
    } else if (fileType === "application/pdf" || fileName.toLowerCase().endsWith('.pdf')) {
      // Processar PDF com IA
      const base64Content = file.split(',')[1] || file;
      resultado = await processarPDF(base64Content, fileName);
    } else {
      throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
    }

    console.log("Processamento concluído com sucesso");

    return new Response(
      JSON.stringify({
        success: true,
        data: resultado
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Erro no processamento:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
