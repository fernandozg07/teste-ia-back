
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ChatMessage, FileAttachment } from "../types";

const SYSTEM_INSTRUCTION = `Você é o "Strategic Sales Copilot" Sênior. Sua autoridade vem da PRECISÃO matemática.

REGRAS PARA COTA GRATUITA:
1. Respostas concisas e diretas.
2. Formato JSON estrito para os dados.
3. Se houver erro de cota, peça ao usuário para aguardar 10 segundos.

FORMATO DO JSON:
\`\`\`json
{
  "summary": "Resumo executivo curto.",
  "metrics": [
    {"label": "KPI", "value": "R$ ou %", "change": number, "isPositive": boolean}
  ],
  "charts": [
    {
      "type": "bar|line|pie",
      "title": "Título",
      "data": [{"name": "Label", "valor": number}],
      "keys": ["valor"]
    }
  ],
  "insights": [
    {"type": "critical|positive|neutral", "text": "Insight."}
  ],
  "recommendations": ["Ação"]
}
\`\`\``;

export class GeminiService {
  static async sendMessage(
    messages: ChatMessage[],
    attachment?: FileAttachment,
    useSearch: boolean = false
  ): Promise<{ text: string; analysis?: AnalysisResult; urls?: { uri: string; title: string }[] }> {
    
    // Inicializa o SDK usando a chave injetada pelo Vercel ou pelo seletor
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
        lastMsgParts[0].text += `\n\nDados do arquivo (${attachment.name}):\n${attachment.data.substring(0, 10000)}`; // Limita tamanho para evitar estouro de cota
      }
    }

    try {
      const response = await ai.models.generateContent({
        // Lite é o modelo mais estável para uso 100% gratuito sem travas de cota Pro
        model: 'gemini-flash-lite-latest',
        contents: [
          ...history,
          { role: 'user', parts: lastMsgParts }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          // Search pode ser pesado para cota gratuita, habilitamos apenas se necessário
          tools: useSearch ? [{ googleSearch: {} }] : undefined,
          temperature: 0.2,
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
        console.warn("Aviso: Resposta sem bloco de análise estruturada.");
      }

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const urls = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        uri: chunk.web?.uri || "",
        title: chunk.web?.title || "Fonte externa"
      })).filter((u: any) => u.uri !== "");

      return { text: cleanText, analysis, urls };
    } catch (error: any) {
      console.error("Erro API:", error);
      if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED') {
        throw new Error("COTA_EXCEDIDA: O servidor está processando muitas requisições. Por favor, aguarde 15 segundos e tente novamente.");
      }
      throw new Error("Erro de conexão com a inteligência. Verifique sua chave ou conexão.");
    }
  }
}
