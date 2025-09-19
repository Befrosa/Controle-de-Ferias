export interface IVacation {
  Id: number;
  Title: string; // Nome do funcionário
  DataInicio: string; // Data de início das férias (formato ISO string)
  DataFim: string; // Data de término das férias (formato ISO string)
  TipoFerias?: string; // Tipo de férias (férias anuais, licença, etc.)
  Observacoes?: string; // Observações opcionais
}