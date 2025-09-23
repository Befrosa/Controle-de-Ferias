/**
 * Conversor de dados do SharePoint para o formato da aplicação
 */

import { IAusencia, IColaborador, TipoAusencia, StatusAusencia } from '../interfaces/IAusenciaTypes';
import { calcularDiasCorridos } from './DataUtils';

/**
 * Função para converter dados existentes do SharePoint para o novo formato
 */
export const converterDadosSharePoint = (dadosSharePoint: any[]): IAusencia[] => {
    return dadosSharePoint.map((item, index) => {
        console.log("DADOS SHAREPOINT", item.Colaborador);

        // Utilizar dados reais do campo Colaborador (People Picker)
        const colaborador: IColaborador = {
            id: item.Colaborador?.Id ? `sp-user-${item.Colaborador.Id}` : `sp-item-${item.Id || index}`,
            nome: item.Colaborador?.Title || 'Usuário Desconhecido',
            email: item.Colaborador?.EMail || 'email.nao.informado@empresa.com',
            // departamento: 'Não informado'
            squad: item.Squad || ''
        };

        // Registrar informações do colaborador no console
        console.log('=== DADOS DO COLABORADOR REAL ===');
        console.log('Nome:', colaborador.nome);
        console.log('Email:', colaborador.email);
        console.log('Departamento:', colaborador.departamento);
        console.log('Squad:', colaborador.squad);
        console.log('ID:', colaborador.id);
        console.log('============================');

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
            diasTotais: calcularDiasCorridos(dataInicio, dataFim),
            sharePointId: item.Id // Adicionando o ID do SharePoint
        };
    });
};