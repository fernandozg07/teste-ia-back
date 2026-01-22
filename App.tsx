
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import AnalysisDashboard from './components/AnalysisDashboard';
import { AnalysisResult } from './types';
import { Search, Bell, User, Briefcase, ChevronRight, TrendingUp, Target, Loader2, Key } from 'lucide-react';

const App: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<string | undefined>();
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    }
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
      // Recarrega a página ou estado para garantir que o processo capture a nova chave
      window.location.reload();
    }
  };

  const handleWorkflowSelect = (id: string) => {
    setActiveWorkflow(id);
    setAnalysisData(null);
    
    let prompt = "";
    switch(id) {
      case 'monthly-sales': prompt = "Inicie a Análise Mensal de Vendas. Compare este mês com o anterior."; break;
      case 'channel-perf': prompt = "Execute a Análise de Performance por Canal."; break;
      case 'churn-diagnosis': prompt = "Inicie Diagnóstico de Churn."; break;
      case 'exec-report': prompt = "Gere um Relatório Executivo consolidado."; break;
    }
    setPendingPrompt(prompt);
  };

  const handleAnalysisReceived = (data: AnalysisResult) => {
    setAnalysisData(data);
    setIsProcessing(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        onWorkflowSelect={handleWorkflowSelect} 
        activeWorkflow={activeWorkflow}
      />

      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Briefcase className="w-4 h-4" />
            <ChevronRight className="w-3 h-3" />
            <span className="font-medium text-slate-600">
              {activeWorkflow ? `Workflow: ${activeWorkflow}` : 'Strategic Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleOpenKeySelector}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold ${
                hasApiKey 
                  ? 'bg-blue-50 border-blue-200 text-blue-600' 
                  : 'bg-amber-50 border-amber-200 text-amber-600 animate-pulse'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              {hasApiKey ? 'API Key Ativa' : 'Configurar API Key'}
            </button>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            
            <button className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <User className="w-5 h-5 text-slate-600 group-hover:text-blue-600" />
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-slate-800 leading-none">Analista Sênior</p>
                <p className="text-[10px] text-slate-500">PortoBank Estratégia</p>
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {isProcessing && (
              <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="font-bold text-slate-700">Processando Inteligência...</p>
                </div>
              </div>
            )}

            {analysisData ? (
              <AnalysisDashboard data={analysisData} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <Briefcase className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Pronto para Analisar</h2>
                <p className="text-slate-500 max-w-md mb-8">
                  Selecione um workflow ou envie um arquivo para começar.
                </p>
              </div>
            )}
          </div>

          <div id="chat-container" className="w-[450px] flex-shrink-0 h-full">
            <ChatInterface 
              onAnalysisReceived={handleAnalysisReceived} 
              initialMessage={pendingPrompt}
              onMessageStart={() => setIsProcessing(true)}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
