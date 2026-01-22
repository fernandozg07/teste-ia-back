
import React from 'react';
import { 
  BarChart3, 
  Target, 
  TrendingDown, 
  FileText, 
  Users, 
  Briefcase 
} from 'lucide-react';
import { Workflow } from './types';

export const WORKFLOWS: Workflow[] = [
  {
    id: 'monthly-sales',
    name: 'Análise Mensal de Vendas',
    description: 'Relatório detalhado sobre performance do mês corrente vs anterior.',
    icon: 'BarChart3'
  },
  {
    id: 'channel-perf',
    name: 'Performance por Canal',
    description: 'Identifique gargalos e melhores taxas de conversão por parceiro.',
    icon: 'Target'
  },
  {
    id: 'churn-diagnosis',
    name: 'Diagnóstico de Churn',
    description: 'Análise de queda de retenção e hipóteses estratégicas.',
    icon: 'TrendingDown'
  },
  {
    id: 'exec-report',
    name: 'Relatório Executivo',
    description: 'Transforme dados em um resumo para a diretoria.',
    icon: 'FileText'
  }
];

export const APP_THEME = {
  primary: '#1e40af', // Blue-800
  secondary: '#0f172a', // Slate-900
  accent: '#3b82f6', // Blue-500
};
