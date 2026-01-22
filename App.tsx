
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import AnalysisDashboard from './components/AnalysisDashboard';
import { AnalysisResult } from './types';
import { Search, Bell, HelpCircle, User, Briefcase, ChevronRight, TrendingUp, Target, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [activeWorkflow, setActiveWorkflow] = useState<string | undefined>();
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleWorkflowSelect = (id: string) => {
    setActiveWorkflow(id);
    setAnalysisData(null); // Clear previous analysis for new focus
    
    let prompt = "";
    switch(id) {
      case 'monthly-sales': 
        prompt = "Inicie a Análise Mensal de Vendas. Compare este mês com o anterior. (Aguardando dados ou perguntando sobre performance geral)"; 
        break;
      case 'channel-perf': 
        prompt = "Execute a Análise de Performance por Canal. Onde estão as melhores conversões?"; 
        break;
      case 'churn-diagnosis':
        prompt = "Inicie Diagnóstico de Churn. Identifique os pontos de fricção no funil.";
        break;
      case 'exec-report':
        prompt = "Gere um Relatório Executivo consolidado com os principais KPIs estratégicos.";
        break;
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
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Briefcase className="w-4 h-4" />
            <ChevronRight className="w-3 h-3" />
            <span className="font-medium text-slate-600">
              {activeWorkflow ? `Workflow: ${activeWorkflow}` : 'Strategic Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500" />
              <input 
                type="text" 
                placeholder="Pesquisar relatórios..."
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 border-2 border-white rounded-full"></span>
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
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Dashboard Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {isProcessing && (
              <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  <p className="font-bold text-slate-700">Motor de Análise Sincronizando...</p>
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
                  Carregue um arquivo ou selecione um workflow lateral para transformar dados em decisões estratégicas.
                </p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                     <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3">
                       <TrendingUp className="w-4 h-4 text-green-500" />
                     </div>
                     <p className="text-xs font-bold text-slate-800 uppercase mb-1">Cenário Global</p>
                     <p className="text-xs text-slate-500">Analise tendências de mercado e concorrentes com busca em tempo real.</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                     <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3">
                       <Target className="w-4 h-4 text-blue-500" />
                     </div>
                     <p className="text-xs font-bold text-slate-800 uppercase mb-1">Análise de Funil</p>
                     <p className="text-xs text-slate-500">Mapeie taxas de conversão e identifique perdas de receita.</p>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Interface */}
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
