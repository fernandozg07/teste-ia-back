
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2, Sparkles, User, Bot, Globe, X, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { ChatMessage, FileAttachment } from '../types';
import { GeminiService } from '../services/geminiService';

interface ChatInterfaceProps {
  onAnalysisReceived: (analysis: any) => void;
  onMessageStart?: () => void;
  initialMessage?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onAnalysisReceived, onMessageStart, initialMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! Sou seu Copiloto de Estratégia. Envie seus dados de vendas ou peça um diagnóstico de mercado.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState<FileAttachment | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialMessage) {
      handleSend(initialMessage);
    }
  }, [initialMessage]);

  const handleSend = async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text && !pendingFile && !isLoading) return;

    onMessageStart?.();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text || (pendingFile ? `Analise este arquivo: ${pendingFile.name}` : ""),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    const currentFile = pendingFile;
    setPendingFile(null);

    try {
      const { text: responseText, analysis, urls } = await GeminiService.sendMessage([...messages, userMessage], currentFile || undefined);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        analysisResult: analysis,
        groundingUrls: urls
      };

      setMessages(prev => [...prev, assistantMessage]);
      if (analysis) onAnalysisReceived(analysis);
    } catch (error: any) {
      console.error(error);
      const isQuotaError = error.message?.includes('COTA_EXCEDIDA');
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: isQuotaError 
          ? "⚠️ Limite de cota atingido para o modelo Pro. Por favor, clique no botão 'Configurar API Key' no topo da tela e selecione um projeto com faturamento ativo."
          : "Houve uma inconsistência no processamento. Por favor, verifique os dados e tente novamente.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isBinary = file.type.includes('pdf') || file.type.includes('image');

    reader.onload = (event) => {
      const rawData = event.target?.result as string;
      const base64Data = isBinary ? rawData.split(',')[1] : rawData;

      setPendingFile({
        name: file.name,
        type: file.type,
        mimeType: file.type,
        data: base64Data
      });
    };

    if (isBinary) reader.readAsDataURL(file);
    else reader.readAsText(file);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-none text-sm">Strategic Sales Copilot</h3>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Analytics Engine 1.0</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                msg.role === 'user' ? 'bg-slate-100 text-slate-600' : 'bg-blue-600 text-white shadow-md'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : msg.content.includes('⚠️') 
                      ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-none shadow-sm'
                      : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none shadow-sm'
                }`}>
                  <div className="prose prose-sm max-w-none">
                    {msg.content}
                  </div>
                  
                  {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                      {msg.groundingUrls.map((url, i) => (
                        <a key={i} href={url.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                          <Globe className="w-3 h-3" /> {url.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-center gap-3 px-1 animate-pulse">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Processando...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        {pendingFile && (
          <div className="flex items-center justify-between bg-white border border-blue-200 p-2.5 rounded-xl shadow-sm animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                {pendingFile.type.includes('image') ? <ImageIcon className="w-4 h-4 text-blue-600" /> : <FileText className="w-4 h-4 text-blue-600" />}
              </div>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{pendingFile.name}</span>
            </div>
            <button onClick={() => setPendingFile(null)} className="p-1.5 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-2 pl-4 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite ou arraste dados..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-700 placeholder-slate-400 font-medium"
          />
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl">
            <Paperclip className="w-5 h-5" />
          </button>
          <button onClick={() => handleSend()} disabled={isLoading} className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
