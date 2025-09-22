/**
 * Enumeração dos tipos de ausência disponíveis
 */
export enum TipoAusencia {
  FERIAS_ANUAIS = 'Férias anuais',
  LICENCA_MEDICA = 'Licença médica',
  LICENCA_MATERNIDADE = 'Licença maternidade',
  LICENCA_PATERNIDADE = 'Licença paternidade',
  FOLGA_COMPENSATORIA = 'Folga compensatória',
  AUSENCIA_JUSTIFICADA = 'Ausência justificada',
  OUTROS = 'Outros'
}

/**
 * Enumeração dos status de aprovação
 */
export enum StatusAusencia {
  PENDENTE = 'Pendente',
  APROVADO = 'Aprovado',
  REJEITADO = 'Rejeitado'
}

/**
 * Interface para dados de colaborador
 */
export interface IColaborador {
  id: string;
  nome: string;
  email: string;
  departamento?: string;
  avatar?: string;
}

/**
 * Interface principal para dados de ausência
 */
export interface IAusencia {
  id: string;
  colaborador: IColaborador;
  tipo: TipoAusencia;
  status: StatusAusencia;
  dataInicio: Date;
  dataFim: Date;
  observacoes?: string;
  aprovadoPor?: string;
  dataSolicitacao: Date;
  diasTotais: number;
  sharePointId?: number; // Adicionando o ID do item do SharePoint
}

/**
 * Interface para propriedades do indicador visual
 */
export interface IIndicadorProps {
  ausencia: IAusencia;
  largura?: string;
  altura?: string;
  showTooltip?: boolean;
  onClick?: (ausencia: IAusencia) => void;
}

/**
 * Interface para configuração de cores por tipo
 */
export interface ICorTipo {
  cor: string;
  corSecundaria?: string;
  nome: string;
}

/**
 * Interface para conflitos de férias
 */
export interface IVacationConflict {
  member1: string;
  member2: string;
  conflictStart: string;
  conflictEnd: string;
  overlapDays: number;
}

/**
 * Interface para propriedades do tooltip
 */
export interface ITooltipData {
  titulo: string;
  colaborador: string;
  tipo: string;
  periodo: string;
  status: string;
  dias: number;
  observacoes?: string;
}

/**
 * Interface para propriedades do componente principal
 */
export interface ITimelineAusenciasProps {
  ausencias: IAusencia[];
  visualizacao: 'mensal' | 'anual';
  anoSelecionado: number;
  mesSelecionado?: number;
  onAusenciaClick?: (ausencia: IAusencia) => void;
  showLegenda?: boolean;
  showFiltros?: boolean;
  legendaCustomizada?: Array<{tipo: string; cor: string; nome: string}>;
  onRefresh?: () => void;
  isLoading?: boolean;
  tipoOptionsFromSharePoint?: Array<{key: string, text: string}>;
  onAddAusencia?: () => void; // Adicionando o handler para adicionar ausência
}