import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  DefaultButton
} from '@fluentui/react';
import { SPFI } from '@pnp/sp';
import { TimelineAusencias } from '../TimelineAusencias/TimelineAusencias';
import { VacationForm } from '../forms/VacationForm';
import { IAusencia } from '../interfaces/IAusenciaTypes';
import { VacationService } from '../VacationService';
import { converterDadosSharePoint, AUSENCIAS_MOCK } from '../utils/MockData';
import { inicializarCoresDinamicas, gerarLegendaDinamica } from '../utils/ColorMapping';
import styles from './ModernVacationTimeline.module.scss';

/**
 * Props do componente integrador
 */
export interface IModernVacationTimelineProps {
  sp: SPFI;
  useMockData?: boolean; // Para desenvolvimento/demonstração
  anoInicial?: number;
  mesInicial?: number;
}

/**
 * Estilos inline para compatibilidade
 */
const inlineStyles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    position: 'relative' as 'relative',
    margin: '0',
    padding: '0',
    boxSizing: 'border-box' as 'border-box',
    backgroundColor: '#8000FF',
    overflow: 'hidden'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    gap: '16px'
  },
  errorContainer: {
    padding: '24px'
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    justifyContent: 'flex-end' as 'flex-end'
  }
};

/**
 * Componente integrador que conecta o novo TimelineAusencias
 * com o sistema de dados existente do SharePoint
 */
export const ModernVacationTimeline: React.FunctionComponent<IModernVacationTimelineProps> = ({
  sp,
  useMockData = false,
  anoInicial = new Date().getFullYear(),
  mesInicial = new Date().getMonth()
}) => {

  // Estados do componente
  const [ausencias, setAusencias] = useState<IAusencia[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedAusencia, setSelectedAusencia] = useState<IAusencia | undefined>(undefined);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [legendaItems, setLegendaItems] = useState<Array<{tipo: string; cor: string; nome: string}>>([]);
  const [tipoOptions, setTipoOptions] = useState<Array<{key: string, text: string}>>([]); // Novo estado para opções de tipo

  // Serviço para comunicação com SharePoint
  const vacationService = React.useMemo(() => new VacationService(sp), [sp]);

  /**
   * Carrega dados de ausências do SharePoint ou usa dados mock
   */
  const carregarAusencias = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      if (useMockData) {
        // Usar dados mock para demonstração
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
        setAusencias(AUSENCIAS_MOCK);
      } else {
        // Carregar dados reais do SharePoint
        const dadosSharePoint = await vacationService.getVacations();
        const ausenciasConvertidas = converterDadosSharePoint(dadosSharePoint);
        setAusencias(ausenciasConvertidas);

        // Carregar opções de legenda do SharePoint e inicializar cores dinâmicas
        try {
          const opcoesTipo = await vacationService.getVacationTypeOptions();

          // Inicializar sistema de cores dinâmicas com tipos do SharePoint
          const tiposString = opcoesTipo.map((opcao: {key: string, text: string}) => opcao.text);
          inicializarCoresDinamicas(tiposString);

          // Gerar legenda com cores dinâmicas
          const legendaDinamica = gerarLegendaDinamica();
          setLegendaItems(legendaDinamica);
          
          // Armazenar opções de tipo para passar ao componente de filtro
          setTipoOptions(opcoesTipo);
        } catch (legendaErr) {
          console.warn('Erro ao carregar legenda do SharePoint, usando padrão:', legendaErr);
          // Usar tipos padrão se falhar
          inicializarCoresDinamicas(['Ferias', 'Day off aniversario']);
          setLegendaItems(gerarLegendaDinamica());
        }
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Erro ao carregar ausências:', err);
      setError('Erro ao carregar dados de ausências. Tente novamente.');

      // Fallback para dados mock em caso de erro
      if (!useMockData) {
        console.warn('Usando dados mock como fallback...');
        setAusencias(AUSENCIAS_MOCK);
      }
    } finally {
      setIsLoading(false);
    }
  }, [vacationService, useMockData]);

  /**
   * Effect para carregar dados iniciais
   */
  useEffect(() => {
    carregarAusencias().catch(err => {
      console.error('Erro no carregamento inicial:', err);
    });
  }, [carregarAusencias]);

  /**
   * Handler para clique em ausência
   */
  const handleAusenciaClick = useCallback((ausencia: IAusencia) => {
    setSelectedAusencia(ausencia);
    setShowForm(true);
  }, []);

  /**
   * Handler para salvar nova ausência
   */
  const handleSaveAusencia = useCallback(async (formData: any) => {
    try {
      if (!useMockData) {
        // Salvar no SharePoint
        await vacationService.createVacation({
          Title: formData.employeeName,
          DataInicio: formData.startDate,
          DataFim: formData.endDate,
          TipoFerias: formData.vacationType,
          Observacoes: formData.observations || ''
        });
      }

      // Recarregar dados após salvar
      await carregarAusencias();
      setShowForm(false);
      setSelectedAusencia(undefined);

    } catch (err) {
      console.error('Erro ao salvar ausência:', err);
      throw new Error('Erro ao salvar ausência. Tente novamente.');
    }
  }, [vacationService, useMockData, carregarAusencias]);

  /**
   * Handler para fechar formulário
   */
  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setSelectedAusencia(undefined);
  }, []);

  /**
   * Handler para refresh manual
   */
  const handleRefresh = useCallback(() => {
    carregarAusencias().catch(err => {
      console.error('Erro no refresh:', err);
    });
  }, [carregarAusencias]);

  /**
   * Renderização condicional baseada no estado
   */
  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={inlineStyles.loadingContainer}>
          <Spinner size={SpinnerSize.large} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>
              Carregando timeline de ausências...
            </div>
            <div style={{ color: '#666666', fontSize: '14px' }}>
              {useMockData ? 'Preparando dados de demonstração' : 'Obtendo dados do SharePoint'}
            </div>
          </div>
        </div>
      );
    }

    if (error && ausencias.length === 0) {
      return (
        <div style={inlineStyles.errorContainer}>
          <MessageBar messageBarType={MessageBarType.error}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div>
                <strong>Erro ao carregar dados</strong>
                <div style={{ marginTop: '4px', fontSize: '14px' }}>
                  {error}
                </div>
              </div>
              <DefaultButton
                onClick={handleRefresh}
                iconProps={{ iconName: 'Refresh' }}
              >
                Tentar Novamente
              </DefaultButton>
            </div>
          </MessageBar>
        </div>
      );
    }

    return (
      <>
        {/* Ações do header - removido o botão de atualizar dados daqui */}
        <div style={inlineStyles.headerActions}>
          {useMockData && (
            <MessageBar messageBarType={MessageBarType.info} style={{ marginRight: 'auto', maxWidth: '400px' }}>
              <strong>Modo Demonstração:</strong> Exibindo dados de exemplo
            </MessageBar>
          )}
        </div>

        {/* Componente principal Timeline - passando o handler de refresh */}
        <TimelineAusencias
          ausencias={ausencias}
          visualizacao="mensal"
          anoSelecionado={anoInicial}
          mesSelecionado={mesInicial}
          onAusenciaClick={handleAusenciaClick}
          showLegenda={true}
          showFiltros={true}
          legendaCustomizada={legendaItems}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          tipoOptionsFromSharePoint={tipoOptions}
        />

        {/* Informações de debug/status */}
        {error && (
          <MessageBar messageBarType={MessageBarType.warning} style={{ marginTop: '16px' }}>
            <strong>Atenção:</strong> {error}
            {ausencias.length > 0 && ' Exibindo dados em cache.'}
          </MessageBar>
        )}

        <div style={{
          marginTop: '16px',
          textAlign: 'center',
          color: '#666666',
          fontSize: '12px'
        }}>
          {ausencias.length} ausência(s) carregada(s) •
          Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
        </div>
      </>
    );
  };

  return (
    <div className={styles.modernTimelineContainer} style={inlineStyles.container}>
      {renderContent()}

      {/* Formulário modal para detalhes/edição */}
      {showForm && (
        <VacationForm
          sp={sp}
          isOpen={showForm}
          onClose={handleCloseForm}
          onSave={handleSaveAusencia}
          initialData={selectedAusencia ? {
            employeeName: selectedAusencia.colaborador.nome,
            startDate: selectedAusencia.dataInicio.toISOString().split('T')[0],
            endDate: selectedAusencia.dataFim.toISOString().split('T')[0],
            vacationType: selectedAusencia.tipo,
            observations: selectedAusencia.observacoes || ''
          } : undefined}
          isEditing={!!selectedAusencia}
        />
      )}
    </div>
  );
};