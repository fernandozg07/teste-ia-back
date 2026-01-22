import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ChatMessage, FileAttachment } from "../types";

const SYSTEM_INSTRUCTION = `Você é o "Strategic Sales Copilot" Sênior do PortoBank. Sua autoridade vem da PRECISÃO matemática e profundidade estratégica.

REGRAS DE OURO PARA 100% DE ACURÁCIA:
1. CONCORDÂNCIA TOTAL: Os números citados no seu texto (Ex: "Crescemos 15%") DEVEM ser idênticos aos valores no JSON.
2. ANÁLISE DE ARQUIVOS: Ao ler CSV/Excel, identifique colunas de DATA, VALOR e CATEGORIA. Use-as para montar os gráficos.
3. TOM DE VOZ: Consultoria de Elite (McKinsey style). Foco em ROI e Eficiência.

FORMATO DO JSON (NÃO ALTERE AS CHAVES):
\`\`\`json
{
  "summary": "Resumo ultra-executivo (max 140 chars).",
  "metrics": [
    {"label": "KPI", "value": "R$ ou %", "change": number, "isPositive": boolean}
  ],
  "charts": [
    {
      "type": "bar|line|pie",
      "title": "Título Contextual",
      "data": [{"name": "Label", "valor": number}],
      "keys": ["valor"]
    }
  ],
  "insights": [
    {"type": "critical|positive|neutral", "text": "Insight focado em decisão."}
  ],
  "recommendations": ["Ação concreta com meta"]
}
\`\`\``;

export class GeminiService {
  static async sendMessage(
    messages: ChatMessage[],
    attachment?: FileAttachment,
    useSearch: boolean = true
  ): Promise<{ text: string; analysis?: AnalysisResult; urls?: { uri: string; title: string }[] }> {
    
    // Inicialização dinâmica para capturar a chave de API atualizada do processo/seletor
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const lastMsg = messages[messages.length - 1];
    const lastMsgParts: any[] = [{ text: lastMsg.content }];

    if (attachment) {
      if (attachment.mimeType.includes('pdf') || attachment.mimeType.includes('image')) {
        lastMsgParts.push({
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.data
          }
        });
      } else {
        lastMsgParts[0].text += `\n\n[DADOS BRUTOS DO ARQUIVO]:\n${attachment.data}\n\nAnalise rigorosamente estes dados.`;
      }
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          ...history,
          { role: 'user', parts: lastMsgParts }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: useSearch ? [{ googleSearch: {} }] : undefined,
          temperature: 0.1,
          topP: 0.8,
        },
      });

      const fullText = response.text || "";
      let analysis: AnalysisResult | undefined;
      let cleanText = fullText;

      try {
        const jsonBlocks = [...fullText.matchAll(/```json\s*([\s\S]*?)\s*```/g)];
        if (jsonBlocks.length > 0) {
          const lastBlock = jsonBlocks[jsonBlocks.length - 1];
          analysis = JSON.parse(lastBlock[1].trim());
          cleanText = fullText.replace(lastBlock[0], "").trim();
        }
      } catch (e) {
        console.error("Erro de Parsing Analítico:", e);
      }

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const urls = groundingChunks?.map((chunk: any) => ({
        uri: chunk.web?.uri || "",
        title: chunk.web?.title || "Fonte de Mercado"
      })).filter((u: any) => u.uri !== "");

      return { text: cleanText, analysis, urls };
    } catch (error: any) {
      if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED') {
        throw new Error("COTA_EXCEDIDA: Você atingiu o limite do Gemini 3 Pro. Por favor, configure uma chave de API com faturamento ativo no topo da tela.");
      }
      throw error;
    }
  }
}
