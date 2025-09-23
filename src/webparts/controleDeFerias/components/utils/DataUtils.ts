/**
 * Utilitários para manipulação de dados e cálculos
 */

/**
 * Função auxiliar para calcular todos os dias corridos entre duas datas (incluindo finais de semana)
 */
export const calcularDiasCorridos = (dataInicio: Date, dataFim: Date): number => {
  // Normalizar as datas para evitar problemas de horário
  const inicio = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), dataInicio.getDate());
  const fim = new Date(dataFim.getFullYear(), dataFim.getMonth(), dataFim.getDate());
  
  let dias = 0;
  const atual = new Date(inicio.getTime());

  while (atual <= fim) {
    dias++;
    atual.setDate(atual.getDate() + 1);
  }

  return dias;
};

/**
 * Função para formatar data no padrão brasileiro
 */
export const formatarData = (data: Date): string => {
  return data.toLocaleDateString('pt-BR');
};

/**
 * Função para formatar período de datas
 */
export const formatarPeriodo = (dataInicio: Date, dataFim: Date): string => {
  return `${formatarData(dataInicio)} - ${formatarData(dataFim)}`;
};