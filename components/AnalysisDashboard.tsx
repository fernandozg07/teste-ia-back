
import React, { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Info, FileDown, Share2, LayoutDashboard, Check
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface DashboardProps {
  data: AnalysisResult;
}

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#4f46e5'];

const AnalysisDashboard: React.FC<DashboardProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
      <LayoutDashboard className="w-12 h-12 mb-4" />
      <p>Aguardando processamento de dados...</p>
    </div>
  );

  const handleExportPDF = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareText = `*Relatório Estratégico - PortoBank*\n\n` +
      `📌 *Resumo:* ${data.summary}\n\n` +
      `📊 *Principais Métricas:*\n` +
      data.metrics.map(m => `- ${m.label}: ${m.value}`).join('\n') +
      `\n\nGerado via Strategic Sales Copilot.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Análise Estratégica de Vendas',
          text: shareText,
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="dashboard-content" className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header & Export */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Análise Estratégica</h2>
          <p className="text-slate-500 text-sm">Dashboard atualizado em tempo real pelo Copiloto.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto no-print">
          <button 
            onClick={handleShare}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Compartilhar'}
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <FileDown className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg shadow-blue-100 text-white">
        <div className="flex gap-4">
          <div className="bg-white/20 p-2 rounded-lg h-fit backdrop-blur-sm">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">Resumo Executivo</h3>
            <p className="text-blue-50 leading-relaxed text-sm font-medium">{data.summary || "Processando síntese..."}</p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.metrics?.map((metric, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{metric.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{metric.value}</span>
              {metric.change !== undefined && (
                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
                  metric.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {metric.isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(metric.change)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data.charts?.map((chart, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[380px] break-inside-avoid">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                {chart.title}
              </h4>
              <div className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase">{chart.type}</div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                {chart.type === 'bar' ? (
                  <BarChart data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    {chart.keys?.map((key, kIdx) => (
                      <Bar key={key} dataKey={key} fill={COLORS[kIdx % COLORS.length]} radius={[4, 4, 0, 0]} barSize={32} />
                    ))}
                  </BarChart>
                ) : chart.type === 'line' ? (
                  <LineChart data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    {chart.keys?.map((key, kIdx) => (
                      <Line key={key} type="monotone" dataKey={key} stroke={COLORS[kIdx % COLORS.length]} strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
                    ))}
                  </LineChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={chart.data}
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chart.data?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm break-inside-avoid">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Insights Estratégicos
          </h4>
          <div className="space-y-3">
            {data.insights?.map((insight, idx) => (
              <div key={idx} className={`p-4 rounded-xl border-l-4 shadow-sm ${
                insight.type === 'critical' ? 'bg-red-50 border-red-500 text-red-900' :
                insight.type === 'positive' ? 'bg-green-50 border-green-500 text-green-900' :
                'bg-slate-50 border-slate-400 text-slate-900'
              }`}>
                <p className="text-sm font-semibold">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl shadow-xl text-white break-inside-avoid">
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            Plano de Ação Recomendado
          </h4>
          <div className="space-y-3">
            {data.recommendations?.map((rec, idx) => (
              <div key={idx} className="flex gap-4 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <span className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {idx + 1}
                </span>
                <p className="text-sm text-slate-300 leading-snug">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
