/**
 * Dados de exemplo para demonstrar o componente TimelineAusencias
 * Inclui diferentes tipos de ausências, status e colaboradores
 */

import { IAusencia, IColaborador, TipoAusencia, StatusAusencia } from '../interfaces/IAusenciaTypes';

/**
 * Colaboradores de exemplo
 */
export const COLABORADORES_MOCK: IColaborador[] = [
  {
    id: '1',
    nome: 'Ana Silva',
    email: 'ana.silva@empresa.com',
    departamento: 'Desenvolvimento',
    avatar: 'https://via.placeholder.com/40/FF8000/FFFFFF?text=AS'
  },
  {
    id: '2',
    nome: 'Bruno Santos',
    email: 'bruno.santos@empresa.com',
    departamento: 'Design',
    avatar: 'https://via.placeholder.com/40/8000FF/FFFFFF?text=BS'
  },
  {
    id: '3',
    nome: 'Carla Oliveira',
    email: 'carla.oliveira@empresa.com',
    departamento: 'Marketing',
    avatar: 'https://via.placeholder.com/40/2ECC71/FFFFFF?text=CO'
  },
  {
    id: '4',
    nome: 'Diego Ferreira',
    email: 'diego.ferreira@empresa.com',
    departamento: 'Desenvolvimento',
    avatar: 'https://via.placeholder.com/40/E74C3C/FFFFFF?text=DF'
  },
  {
    id: '5',
    nome: 'Elena Costa',
    email: 'elena.costa@empresa.com',
    departamento: 'RH',
    avatar: 'https://via.placeholder.com/40/3498DB/FFFFFF?text=EC'
  },
  {
    id: '6',
    nome: 'Felipe Lima',
    email: 'felipe.lima@empresa.com',
    departamento: 'Vendas',
    avatar: 'https://via.placeholder.com/40/F39C12/FFFFFF?text=FL'
  }
];

/**
 * Função auxiliar para calcular dias úteis entre duas datas
 */
const calcularDiasUteis = (dataInicio: Date, dataFim: Date): number => {
  let dias = 0;
  const atual = new Date(dataInicio.getTime());

  while (atual <= dataFim) {
    const diaSemana = atual.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) { // Não conta sábado (6) e domingo (0)
      dias++;
    }
    atual.setDate(atual.getDate() + 1);
  }

  return dias;
};

/**
 * Função para gerar ausências de exemplo
 */
export const gerarAusenciasMock = (ano: number = 2024): IAusencia[] => {
  const ausencias: IAusencia[] = [];
  let idCounter = 1;

  // Gerar ausências para cada colaborador
  COLABORADORES_MOCK.forEach(colaborador => {
    // Férias anuais (1-2 períodos por pessoa)
    const numFeriasAnuais = Math.random() > 0.3 ? 2 : 1;

    for (let i = 0; i < numFeriasAnuais; i++) {
      const mesInicio = Math.floor(Math.random() * 12);
      const diaInicio = Math.floor(Math.random() * 28) + 1;
      const dataInicio = new Date(ano, mesInicio, diaInicio);
      const duracaoFerias = Math.floor(Math.random() * 15) + 5; // 5-20 dias
      const dataFim = new Date(dataInicio.getTime());
      dataFim.setDate(dataFim.getDate() + duracaoFerias);

      ausencias.push({
        id: `ausencia-${idCounter++}`,
        colaborador,
        tipo: TipoAusencia.FERIAS_ANUAIS,
        status: StatusAusencia.APROVADO,
        dataInicio,
        dataFim,
        observacoes: i === 0 ? 'Férias de verão' : 'Férias de fim de ano',
        aprovadoPor: 'Maria Gerente',
        dataSolicitacao: new Date(dataInicio.getTime() - (30 * 24 * 60 * 60 * 1000)),
        diasTotais: calcularDiasUteis(dataInicio, dataFim)
      });
    }

    // Outras ausências aleatórias
    const tiposOutrasAusencias = [
      TipoAusencia.LICENCA_MEDICA,
      TipoAusencia.FOLGA_COMPENSATORIA,
      TipoAusencia.AUSENCIA_JUSTIFICADA,
      TipoAusencia.OUTROS
    ];

    const numOutrasAusencias = Math.floor(Math.random() * 4) + 1; // 1-4 outras ausências

    for (let i = 0; i < numOutrasAusencias; i++) {
      const tipo = tiposOutrasAusencias[Math.floor(Math.random() * tiposOutrasAusencias.length)];
      const mesInicio = Math.floor(Math.random() * 12);
      const diaInicio = Math.floor(Math.random() * 28) + 1;
      const dataInicio = new Date(ano, mesInicio, diaInicio);

      let duracao: number;
      let status: StatusAusencia;
      let observacoes: string;

      switch (tipo) {
        case TipoAusencia.LICENCA_MEDICA:
          duracao = Math.floor(Math.random() * 7) + 1; // 1-7 dias
          status = Math.random() > 0.2 ? StatusAusencia.APROVADO : StatusAusencia.PENDENTE;
          observacoes = 'Atestado médico apresentado';
          break;

        case TipoAusencia.FOLGA_COMPENSATORIA:
          duracao = Math.random() > 0.5 ? 1 : 2; // 1-2 dias
          status = Math.random() > 0.1 ? StatusAusencia.APROVADO : StatusAusencia.PENDENTE;
          observacoes = 'Compensação de horas extras';
          break;

        case TipoAusencia.AUSENCIA_JUSTIFICADA:
          duracao = 1; // Geralmente 1 dia
          status = Math.random() > 0.8 ? StatusAusencia.REJEITADO : StatusAusencia.APROVADO;
          observacoes = 'Questões pessoais urgentes';
          break;

        default:
          duracao = Math.floor(Math.random() * 3) + 1; // 1-3 dias
          status = Math.random() > 0.7 ? StatusAusencia.PENDENTE : StatusAusencia.APROVADO;
          observacoes = 'Diversos motivos';
      }

      const dataFim = new Date(dataInicio.getTime());
      dataFim.setDate(dataFim.getDate() + duracao - 1);

      ausencias.push({
        id: `ausencia-${idCounter++}`,
        colaborador,
        tipo,
        status,
        dataInicio,
        dataFim,
        observacoes,
        aprovadoPor: status === StatusAusencia.APROVADO ? 'Maria Gerente' : undefined,
        dataSolicitacao: new Date(dataInicio.getTime() - (7 * 24 * 60 * 60 * 1000)),
        diasTotais: calcularDiasUteis(dataInicio, dataFim)
      });
    }
  });

  // Adicionar alguns casos especiais para demonstrar funcionalidades

  // Licença maternidade
  const colaboradoraMaternidade = COLABORADORES_MOCK[2]; // Carla
  const inicioMaternidade = new Date(ano, 8, 15); // 15 de setembro
  const fimMaternidade = new Date(inicioMaternidade.getTime());
  fimMaternidade.setDate(fimMaternidade.getDate() + 120); // 120 dias

  ausencias.push({
    id: `ausencia-${idCounter++}`,
    colaborador: colaboradoraMaternidade,
    tipo: TipoAusencia.LICENCA_MATERNIDADE,
    status: StatusAusencia.APROVADO,
    dataInicio: inicioMaternidade,
    dataFim: fimMaternidade,
    observacoes: 'Licença maternidade - nascimento do primeiro filho',
    aprovadoPor: 'RH - Elena Costa',
    dataSolicitacao: new Date(inicioMaternidade.getTime() - (60 * 24 * 60 * 60 * 1000)),
    diasTotais: calcularDiasUteis(inicioMaternidade, fimMaternidade)
  });

  // Licença paternidade
  const colaboradorPaternidade = COLABORADORES_MOCK[1]; // Bruno
  const inicioPaternidade = new Date(ano, 8, 20); // 20 de setembro
  const fimPaternidade = new Date(inicioPaternidade.getTime());
  fimPaternidade.setDate(fimPaternidade.getDate() + 5); // 5 dias

  ausencias.push({
    id: `ausencia-${idCounter++}`,
    colaborador: colaboradorPaternidade,
    tipo: TipoAusencia.LICENCA_PATERNIDADE,
    status: StatusAusencia.APROVADO,
    dataInicio: inicioPaternidade,
    dataFim: fimPaternidade,
    observacoes: 'Licença paternidade',
    aprovadoPor: 'RH - Elena Costa',
    dataSolicitacao: new Date(inicioPaternidade.getTime() - (15 * 24 * 60 * 60 * 1000)),
    diasTotais: calcularDiasUteis(inicioPaternidade, fimPaternidade)
  });

  // Ordenar por data de início
  return ausencias.sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime());
};

/**
 * Dados de exemplo para testes
 */
export const AUSENCIAS_MOCK = gerarAusenciasMock(2024);

/**
 * Função para converter dados existentes do SharePoint para o novo formato
 */
export const converterDadosSharePoint = (dadosSharePoint: any[]): IAusencia[] => {
  return dadosSharePoint.map((item, index) => {
    // Encontrar colaborador ou criar um novo
    let colaborador: IColaborador | undefined;
    for (let i = 0; i < COLABORADORES_MOCK.length; i++) {
      if (COLABORADORES_MOCK[i].nome === item.Title) {
        colaborador = COLABORADORES_MOCK[i];
        break;
      }
    }

    if (!colaborador) {
      colaborador = {
        id: `sp-user-${index}`,
        nome: item.Title || 'Usuário Desconhecido',
        email: `${(item.Title || 'usuario').toLowerCase().replace(' ', '.')}@empresa.com`,
        departamento: 'Não informado'
      };
    }

    // Mapear tipo de férias
    let tipo: TipoAusencia;
    switch (item.TipoFerias?.toLowerCase()) {
      case 'férias anuais':
      case 'ferias anuais':
      case 'ferias-anuais':
        tipo = TipoAusencia.FERIAS_ANUAIS;
        break;
      case 'licença médica':
      case 'licenca médica':
      case 'licenca-medica':
        tipo = TipoAusencia.LICENCA_MEDICA;
        break;
      case 'licença maternidade':
      case 'licenca maternidade':
      case 'licenca-maternidade':
        tipo = TipoAusencia.LICENCA_MATERNIDADE;
        break;
      case 'licença paternidade':
      case 'licenca paternidade':
      case 'licenca-paternidade':
        tipo = TipoAusencia.LICENCA_PATERNIDADE;
        break;
      case 'folga compensatória':
      case 'folga compensatoria':
      case 'folga-compensatoria':
        tipo = TipoAusencia.FOLGA_COMPENSATORIA;
        break;
      case 'ausência justificada':
      case 'ausencia justificada':
      case 'ausencia-justificada':
        tipo = TipoAusencia.AUSENCIA_JUSTIFICADA;
        break;
      default:
        tipo = TipoAusencia.OUTROS;
    }

    const dataInicio = new Date(item.DataInicio);
    const dataFim = new Date(item.DataFim);

    return {
      id: item.Id?.toString() || `converted-${index}`,
      colaborador,
      tipo,
      status: StatusAusencia.APROVADO, // Assumir aprovado para dados existentes
      dataInicio,
      dataFim,
      observacoes: item.Observacoes || '',
      dataSolicitacao: dataInicio, // Usar data de início como fallback
      diasTotais: calcularDiasUteis(dataInicio, dataFim)
    };
  });
};