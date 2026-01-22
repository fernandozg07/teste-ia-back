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

    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY não configurada");

    const formattedMessages: any[] = [
      {
        role: "system",
        content: SYSTEM_INSTRUCTION
      },
      ...messages.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }))
    ];

    if (attachment) {
      if (attachment.mimeType.includes("pdf") || attachment.mimeType.includes("image")) {
        formattedMessages.push({
          role: "user",
          content: [
            { type: "text", text: messages[messages.length - 1].content },
            {
              type: "image_url",
              image_url: {
                url: `data:${attachment.mimeType};base64,${attachment.data}`
              }
            }
          ]
        });
      } else {
        formattedMessages[formattedMessages.length - 1].content +=
          `\n\n[DADOS BRUTOS DO ARQUIVO]:\n${attachment.data}\n\nAnalise rigorosamente estes dados.`;
      }
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://seu-dominio.com", // obrigatório no OpenRouter
          "X-Title": "PortoBank Strategic Copilot"
        },
        body: JSON.stringify({
          model: "google/gemini-1.5-pro",
          messages: formattedMessages,
          temperature: 0.1,
          top_p: 0.8
        })
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const data = await response.json();
      const fullText: string = data.choices?.[0]?.message?.content || "";

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

      return { text: cleanText, analysis };
    } catch (error: any) {
      if (error.message?.includes("429")) {
        throw new Error(
          "COTA_EXCEDIDA: Limite atingido no OpenRouter. Verifique saldo ou modelo."
        );
      }
      throw error;
    }
  }
}
