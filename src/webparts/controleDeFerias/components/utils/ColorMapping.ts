import { TipoAusencia, StatusAusencia } from '../interfaces/IAusenciaTypes';
import { ICorTipo } from '../interfaces/IAusenciaTypes';

/**
 * Cores predefinidas para diferentes tipos de ausência
 * Paleta harmonizada com as cores principais #FF8000 (Laranja) e #8000FF (Roxo)
 */
const CORES_PREDEFINIDAS = [
  { cor: '#2ECC71', corSecundaria: '#82E5AA' }, // Verde para férias
  { cor: '#FF8000', corSecundaria: '#FFB366' }, // Laranja para day off aniversário
  { cor: '#E74C3C', corSecundaria: '#F1948A' }, // Vermelho
  { cor: '#8000FF', corSecundaria: '#B366FF' }, // Roxo principal
  { cor: '#3498DB', corSecundaria: '#85C1E9' }, // Azul
  { cor: '#95A5A6', corSecundaria: '#BDC3C7' }, // Cinza
  { cor: '#F39C12', corSecundaria: '#F8C471' }, // Amarelo/dourado
  { cor: '#9B59B6', corSecundaria: '#D2B4DE' }, // Roxo claro
  { cor: '#1ABC9C', corSecundaria: '#7DCEA0' }, // Turquesa
  { cor: '#E67E22', corSecundaria: '#F8C471' }  // Laranja escuro
];

/**
 * Mapeamento dinâmico de cores baseado nos tipos do SharePoint
 */
let CORES_DINAMICAS: Record<string, ICorTipo> = {};

/**
 * Inicializa o mapeamento de cores com base nos tipos reais do SharePoint
 * @param tiposSharePoint - Array de tipos obtidos do SharePoint
 */
export const inicializarCoresDinamicas = (tiposSharePoint: string[]): void => {
  CORES_DINAMICAS = {};

  tiposSharePoint.forEach((tipo, index) => {
    const coresPredefinida = CORES_PREDEFINIDAS[index % CORES_PREDEFINIDAS.length];

    // Mapeamento específico para os tipos conhecidos
    // Substituímos includes por indexOf >= 0 para compatibilidade ES5
    if (tipo.toLowerCase().indexOf('ferias') >= 0 || tipo.toLowerCase().indexOf('férias') >= 0) {
      CORES_DINAMICAS[tipo] = {
        cor: '#2ECC71', // Verde para férias (associação com relaxamento e descanso)
        corSecundaria: '#82E5AA',
        nome: tipo
      };
    } else if (tipo.toLowerCase().indexOf('day off') >= 0 && tipo.toLowerCase().indexOf('aniversario') >= 0) {
      CORES_DINAMICAS[tipo] = {
        cor: '#FF8000', // Laranja para day off aniversário
        corSecundaria: '#FFB366',
        nome: tipo
      };
    } else {
      // Usa cores predefinidas para outros tipos
      CORES_DINAMICAS[tipo] = {
        cor: coresPredefinida.cor,
        corSecundaria: coresPredefinida.corSecundaria,
        nome: tipo
      };
    }
  });

  console.log('Cores dinâmicas inicializadas:', CORES_DINAMICAS);
};

/**
 * Mapeamento de cores para cada tipo de ausência (compatibilidade com sistema antigo)
 */
export const CORES_TIPO_AUSENCIA: Record<TipoAusencia, ICorTipo> = {
  [TipoAusencia.FERIAS_ANUAIS]: {
    cor: '#2ECC71', // Verde para férias (associação com relaxamento e descanso)
    corSecundaria: '#82E5AA',
    nome: 'Férias'
  },
  [TipoAusencia.LICENCA_MEDICA]: {
    cor: '#E74C3C', // Vermelho para urgência médica
    corSecundaria: '#F1948A',
    nome: 'Licença Médica'
  },
  [TipoAusencia.LICENCA_MATERNIDADE]: {
    cor: '#8000FF', // Roxo principal - cor primária
    corSecundaria: '#B366FF',
    nome: 'Licença Maternidade'
  },
  [TipoAusencia.LICENCA_PATERNIDADE]: {
    cor: '#3498DB', // Azul para paternidade
    corSecundaria: '#85C1E9',
    nome: 'Licença Paternidade'
  },
  [TipoAusencia.FOLGA_COMPENSATORIA]: {
    cor: '#2ECC71', // Verde para compensação
    corSecundaria: '#82E5AA',
    nome: 'Folga Compensatória'
  },
  [TipoAusencia.AUSENCIA_JUSTIFICADA]: {
    cor: '#F39C12', // Amarelo/dourado para justificada
    corSecundaria: '#F8C471',
    nome: 'Ausência Justificada'
  },
  [TipoAusencia.OUTROS]: {
    cor: '#95A5A6', // Cinza neutro para outros
    corSecundaria: '#BDC3C7',
    nome: 'Outros'
  }
};

/**
 * Configurações de estilo para cada status de ausência
 */
export const ESTILOS_STATUS: Record<StatusAusencia, { opacidade: number; padrão: string; bordaStyle: string }> = {
  [StatusAusencia.APROVADO]: {
    opacidade: 1.0,
    padrão: 'solid', // Preenchimento sólido
    bordaStyle: '2px solid'
  },
  [StatusAusencia.PENDENTE]: {
    opacidade: 0.8,
    padrão: 'striped', // Listras diagonais
    bordaStyle: '2px dashed'
  },
  [StatusAusencia.REJEITADO]: {
    opacidade: 0.4,
    padrão: 'solid',
    bordaStyle: '1px solid #ccc'
  }
};

/**
 * Obtém a configuração de cor para um tipo de ausência (sistema dinâmico)
 * @param tipoString - Nome do tipo como string (do SharePoint)
 * @returns Configuração de cor
 */
export const obterCorDinamica = (tipoString: string): ICorTipo => {
  if (CORES_DINAMICAS[tipoString]) {
    return CORES_DINAMICAS[tipoString];
  }

  // Fallback para tipos não mapeados
  const fallbackColor = CORES_PREDEFINIDAS[0];
  return {
    cor: fallbackColor.cor,
    corSecundaria: fallbackColor.corSecundaria,
    nome: tipoString
  };
};

/**
 * Gera o background CSS para o indicador baseado no tipo e status (versão dinâmica)
 * @param tipoString - Tipo da ausência como string (do SharePoint)
 * @param status - Status da aprovação
 * @returns String CSS para background
 */
export const gerarBackgroundIndicadorDinamico = (tipoString: string, status: StatusAusencia = StatusAusencia.APROVADO): string => {
  const corConfig = obterCorDinamica(tipoString);

  let background = '';

  switch (status) {
    case StatusAusencia.APROVADO:
      // Preenchimento sólido com gradiente sutil
      background = `linear-gradient(135deg, ${corConfig.cor} 0%, ${corConfig.corSecundaria} 100%)`;
      break;

    case StatusAusencia.PENDENTE:
      // Listras diagonais sutis
      background = `repeating-linear-gradient(
        45deg,
        ${corConfig.cor},
        ${corConfig.cor} 8px,
        ${corConfig.corSecundaria} 8px,
        ${corConfig.corSecundaria} 16px
      )`;
      break;

    case StatusAusencia.REJEITADO:
      // Cor acinzentada
      background = '#BDC3C7';
      break;
  }

  return background;
};

/**
 * Gera o background CSS para o indicador baseado no tipo e status (versão original para compatibilidade)
 * @param tipo - Tipo da ausência
 * @param status - Status da aprovação
 * @returns String CSS para background
 */
export const gerarBackgroundIndicador = (tipo: TipoAusencia, status: StatusAusencia): string => {
  const corConfig = CORES_TIPO_AUSENCIA[tipo];

  let background = '';

  switch (status) {
    case StatusAusencia.APROVADO:
      // Preenchimento sólido com gradiente sutil
      background = `linear-gradient(135deg, ${corConfig.cor} 0%, ${corConfig.corSecundaria} 100%)`;
      break;

    case StatusAusencia.PENDENTE:
      // Listras diagonais sutis
      background = `repeating-linear-gradient(
        45deg,
        ${corConfig.cor},
        ${corConfig.cor} 8px,
        ${corConfig.corSecundaria} 8px,
        ${corConfig.corSecundaria} 16px
      )`;
      break;

    case StatusAusencia.REJEITADO:
      // Cor acinzentada
      background = '#BDC3C7';
      break;
  }

  return background;
};

/**
 * Obtém a cor principal para um tipo de ausência
 * @param tipo - Tipo da ausência
 * @returns Cor principal em hexadecimal
 */
export const obterCorTipo = (tipo: TipoAusencia): string => {
  return CORES_TIPO_AUSENCIA[tipo].cor;
};

/**
 * Obtém a configuração completa de cor para um tipo
 * @param tipo - Tipo da ausência
 * @returns Objeto com configuração de cor
 */
export const obterConfigCorTipo = (tipo: TipoAusencia): ICorTipo => {
  return CORES_TIPO_AUSENCIA[tipo];
};

/**
 * Gera uma cor mais clara para hover/focus
 * @param cor - Cor base em hexadecimal
 * @param fator - Fator de clareamento (0-1)
 * @returns Cor mais clara
 */
export const clarearCor = (cor: string, fator: number = 0.2): string => {
  // Remove o # se presente
  const hex = cor.replace('#', '');

  // Converte para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Aplica o clareamento
  const newR = Math.min(255, Math.floor(r + (255 - r) * fator));
  const newG = Math.min(255, Math.floor(g + (255 - g) * fator));
  const newB = Math.min(255, Math.floor(b + (255 - b) * fator));

  // Converte de volta para hex
  const rHex = newR.toString(16).length === 1 ? '0' + newR.toString(16) : newR.toString(16);
  const gHex = newG.toString(16).length === 1 ? '0' + newG.toString(16) : newG.toString(16);
  const bHex = newB.toString(16).length === 1 ? '0' + newB.toString(16) : newB.toString(16);

  return `#${rHex}${gHex}${bHex}`;
};

/**
 * Gera array com todas as cores dinâmicas para criar a legenda
 * @returns Array de itens da legenda baseado nos tipos do SharePoint
 */
export const gerarLegendaDinamica = (): Array<{tipo: string; cor: string; nome: string}> => {
  const legendaItems: Array<{tipo: string; cor: string; nome: string}> = [];

  // Usa Object.keys para compatibilidade ES5
  const tiposDinamicos = Object.keys(CORES_DINAMICAS);
  for (let i = 0; i < tiposDinamicos.length; i++) {
    const tipo = tiposDinamicos[i];
    const corConfig = CORES_DINAMICAS[tipo];
    legendaItems.push({
      tipo: tipo,
      cor: corConfig.cor,
      nome: corConfig.nome
    });
  }

  return legendaItems;
};

/**
 * Array com todas as cores para criar a legenda (compatibilidade)
 */
export const CORES_LEGENDA = [
  {
    tipo: TipoAusencia.FERIAS_ANUAIS,
    cor: CORES_TIPO_AUSENCIA[TipoAusencia.FERIAS_ANUAIS].cor,
    nome: CORES_TIPO_AUSENCIA[TipoAusencia.FERIAS_ANUAIS].nome
  },
  {
    tipo: TipoAusencia.LICENCA_MEDICA,
    cor: CORES_TIPO_AUSENCIA[TipoAusencia.LICENCA_MEDICA].cor,
    nome: CORES_TIPO_AUSENCIA[TipoAusencia.LICENCA_MEDICA].nome
  },
  {
    tipo: TipoAusencia.LICENCA_MATERNIDADE,
    cor: CORES_TIPO_AUSENCIA[TipoAusencia.LICENCA_MATERNIDADE].cor,
    nome: CORES_TIPO_AUSENCIA[TipoAusencia.LICENCA_MATERNIDADE].nome
  },
  {
    tipo: TipoAusencia.LICENCA_PATERNIDADE,
    cor: CORES_TIPO_AUSENCIA[TipoAusencia.LICENCA_PATERNIDADE].cor,
    nome: CORES_TIPO_AUSENCIA[TipoAusencia.LICENCA_PATERNIDADE].nome
  },
  {
    tipo: TipoAusencia.FOLGA_COMPENSATORIA,
    cor: CORES_TIPO_AUSENCIA[TipoAusencia.FOLGA_COMPENSATORIA].cor,
    nome: CORES_TIPO_AUSENCIA[TipoAusencia.FOLGA_COMPENSATORIA].nome
  },
  {
    tipo: TipoAusencia.AUSENCIA_JUSTIFICADA,
    cor: CORES_TIPO_AUSENCIA[TipoAusencia.AUSENCIA_JUSTIFICADA].cor,
    nome: CORES_TIPO_AUSENCIA[TipoAusencia.AUSENCIA_JUSTIFICADA].nome
  },
  {
    tipo: TipoAusencia.OUTROS,
    cor: CORES_TIPO_AUSENCIA[TipoAusencia.OUTROS].cor,
    nome: CORES_TIPO_AUSENCIA[TipoAusencia.OUTROS].nome
  }
];