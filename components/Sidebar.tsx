
import React from 'react';
import { WORKFLOWS } from '../constants';
import { 
  BarChart3, 
  Target, 
  TrendingDown, 
  FileText, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  onWorkflowSelect: (id: string) => void;
  activeWorkflow?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onWorkflowSelect, activeWorkflow }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'BarChart3': return <BarChart3 className="w-5 h-5" />;
      case 'Target': return <Target className="w-5 h-5" />;
      case 'TrendingDown': return <TrendingDown className="w-5 h-5" />;
      case 'FileText': return <FileText className="w-5 h-5" />;
      default: return <LayoutDashboard className="w-5 h-5" />;
    }
  };

  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Sales Copilot</h1>
        </div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">PortoBank Strategic</p>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 space-y-6">
        <div>
          <h2 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Análise & Dashboards</h2>
          <div className="space-y-1">
            <button className="flex items-center w-full gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-medium">Visão Geral</span>
            </button>
          </div>
        </div>

        <div>
          <h2 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Workflows Sugeridos</h2>
          <div className="space-y-1">
            {WORKFLOWS.map((wf) => (
              <button
                key={wf.id}
                onClick={() => onWorkflowSelect(wf.id)}
                className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-md transition-all group ${
                  activeWorkflow === wf.id 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className={`${activeWorkflow === wf.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {getIcon(wf.icon)}
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-medium truncate">{wf.name}</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button className="flex items-center w-full gap-3 px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-slate-400">
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Configurações</span>
        </button>
        <button className="flex items-center w-full gap-3 px-3 py-2 rounded-md hover:bg-red-500/10 transition-colors text-slate-400 hover:text-red-400">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
