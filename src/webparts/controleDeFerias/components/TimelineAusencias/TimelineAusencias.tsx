import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import {
  Dropdown,
  IDropdownOption,
  SearchBox,
  Text,
  Icon,
  Stack,
  StackItem,
  DefaultButton,
  MessageBar,
  MessageBarType
} from '@fluentui/react';
import { ITimelineAusenciasProps, IAusencia, TipoAusencia, StatusAusencia, IVacationConflict } from '../interfaces/IAusenciaTypes';
import { IndicadorAusencia } from '../IndicadorAusencia/IndicadorAusencia';
import { CORES_LEGENDA } from '../utils/ColorMapping';
import styles from './TimelineAusencias.module.scss';

/**
 * Estilos inline para componentes
 */
const componentStyles = {
  container: {
    width: '100%',
    minHeight: 'calc(100vh - 48px)',
    backgroundColor: '#ffffff',
    padding: '24px',
    boxSizing: 'border-box' as 'border-box',
    margin: '0',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    overflowX: 'hidden' as 'hidden',
    overflowY: 'auto' as 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '2px solid #8000FF'
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '8px'
  },
  headerTitle: {
    fontWeight: '600',
    color: '#000000',
    margin: '0'
  },
  headerSubtitle: {
    color: '#666666',
    margin: '0'
  },
  refreshButton: {
    width: '36px',
    height: '36px',
    minWidth: '36px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: '1px solid #8000FF',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#8000FF'
  },
  controlsRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap' as 'wrap'
  },
  colaboradorRow: {
    display: 'grid',
    gridTemplateColumns: '200px 1fr',
    gap: '16px',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e1e5e9',
    marginBottom: '12px'
  },
  indicadoresContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as 'wrap',
    alignItems: 'center'
  },
  emptyState: {
    textAlign: 'center' as 'center',
    padding: '40px',
    color: '#666666'
  }
};

/**
 * Componente principal para exibir timeline de ausências
 * Layout moderno, responsivo e funcional com paleta de cores específica
 */
export const TimelineAusencias: React.FunctionComponent<ITimelineAusenciasProps> = ({
  ausencias,
  visualizacao = 'mensal',
  anoSelecionado,
  mesSelecionado,
  onAusenciaClick,
  showLegenda = true,
  showFiltros = true,
  legendaCustomizada,
  onRefresh,
  isLoading,
  tipoOptionsFromSharePoint
}) => {

  // Estados locais para filtros e controles
  const [modoVisualizacao, setModoVisualizacao] = useState<'timeline' | 'grafico'>('timeline');
  const [filtroTipo, setFiltroTipo] = useState<string | 'todos'>('todos');
  const [filtroStatus, setFiltroStatus] = useState<StatusAusencia | 'todos'>('todos');
  const [buscaColaborador, setBuscaColaborador] = useState<string>('');
  const [periodoAtual] = useState({ ano: anoSelecionado, mes: mesSelecionado });

  // Dropdown options para tipos - usando os tipos do SharePoint se disponíveis
  const tipoOptions: IDropdownOption[] = useMemo(() => {
    const options: IDropdownOption[] = [{ key: 'todos', text: 'Todos os tipos' }];
    
    if (tipoOptionsFromSharePoint && tipoOptionsFromSharePoint.length > 0) {
      // Usar os tipos carregados do SharePoint
      tipoOptionsFromSharePoint.forEach((option: {key: string, text: string}) => {
        options.push({ key: option.key, text: option.text });
      });
    } else {
      // Fallback para os tipos padrão
      options.push(
        { key: TipoAusencia.FERIAS_ANUAIS, text: TipoAusencia.FERIAS_ANUAIS },
        { key: TipoAusencia.LICENCA_MEDICA, text: TipoAusencia.LICENCA_MEDICA },
        { key: TipoAusencia.LICENCA_MATERNIDADE, text: TipoAusencia.LICENCA_MATERNIDADE },
        { key: TipoAusencia.LICENCA_PATERNIDADE, text: TipoAusencia.LICENCA_PATERNIDADE },
        { key: TipoAusencia.FOLGA_COMPENSATORIA, text: TipoAusencia.FOLGA_COMPENSATORIA },
        { key: TipoAusencia.AUSENCIA_JUSTIFICADA, text: TipoAusencia.AUSENCIA_JUSTIFICADA },
        { key: TipoAusencia.OUTROS, text: TipoAusencia.OUTROS }
      );
    }
    
    return options;
  }, [tipoOptionsFromSharePoint]);

  // Filtrar ausências baseado nos filtros ativos
  const ausenciasFiltradas = useMemo(() => {
    let filtered = ausencias.filter(ausencia => {
      // Filtro por período
      const dataAusencia = ausencia.dataInicio;
      const anoAusencia = dataAusencia.getFullYear();

      if (anoAusencia !== periodoAtual.ano) return false;

      // Filtro por tipo
      if (filtroTipo !== 'todos' && ausencia.tipo !== filtroTipo) return false;

      // Filtro por status
      if (filtroStatus !== 'todos' && ausencia.status !== filtroStatus) return false;

      // Filtro por colaborador
      if (buscaColaborador && ausencia.colaborador.nome.toLowerCase().indexOf(buscaColaborador.toLowerCase()) === -1) {
        return false;
      }

      return true;
    });

    return filtered;
  }, [ausencias, filtroTipo, filtroStatus, buscaColaborador, periodoAtual]);

  // Agrupar ausências por colaborador (versão simplificada)
  const ausenciasPorColaborador = useMemo(() => {
    const grupos: { [key: string]: { colaborador: IAusencia['colaborador']; ausencias: IAusencia[] } } = {};

    ausenciasFiltradas.forEach(ausencia => {
      const colaboradorId = ausencia.colaborador.id;
      if (!grupos[colaboradorId]) {
        grupos[colaboradorId] = {
          colaborador: ausencia.colaborador,
          ausencias: []
        };
      }
      grupos[colaboradorId].ausencias.push(ausencia);
    });

    // Converter para array e ordenar
    const result = [];
    for (const key in grupos) {
      if (grupos.hasOwnProperty(key)) {
        result.push(grupos[key]);
      }
    }

    return result.sort((a, b) => a.colaborador.nome.localeCompare(b.colaborador.nome));
  }, [ausenciasFiltradas]);

  // Função para detectar conflitos de férias
  const detectarConflitos = useMemo(() => {
    const conflicts: IVacationConflict[] = [];

    for (let i = 0; i < ausenciasFiltradas.length; i++) {
      const ausencia1 = ausenciasFiltradas[i];
      if (ausencia1.status !== StatusAusencia.APROVADO) continue;

      for (let j = i + 1; j < ausenciasFiltradas.length; j++) {
        const ausencia2 = ausenciasFiltradas[j];
        if (ausencia2.status !== StatusAusencia.APROVADO) continue;

        // Verificar sobreposição de datas
        const inicio1 = ausencia1.dataInicio.getTime();
        const fim1 = ausencia1.dataFim.getTime();
        const inicio2 = ausencia2.dataInicio.getTime();
        const fim2 = ausencia2.dataFim.getTime();

        const inicioConflito = Math.max(inicio1, inicio2);
        const fimConflito = Math.min(fim1, fim2);

        if (inicioConflito <= fimConflito) {
          const diasConflito = Math.ceil((fimConflito - inicioConflito) / (1000 * 60 * 60 * 24)) + 1;

          conflicts.push({
            member1: ausencia1.colaborador.nome,
            member2: ausencia2.colaborador.nome,
            conflictStart: new Date(inicioConflito).toISOString(),
            conflictEnd: new Date(fimConflito).toISOString(),
            overlapDays: diasConflito
          });
        }
      }
    }

    return conflicts;
  }, [ausenciasFiltradas]);

  // Dados para gráfico por mês
  const dadosGraficoPorMes = useMemo(() => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const dadosMes = meses.map((nome, index) => {
      const ausenciasDoMes = ausenciasFiltradas.filter(ausencia => {
        const mesInicio = ausencia.dataInicio.getMonth();
        const mesFim = ausencia.dataFim.getMonth();
        return mesInicio <= index && index <= mesFim;
      });

      return {
        mes: nome,
        total: ausenciasDoMes.length,
        aprovadas: ausenciasDoMes.filter(a => a.status === StatusAusencia.APROVADO).length,
        pendentes: ausenciasDoMes.filter(a => a.status === StatusAusencia.PENDENTE).length,
        rejeitadas: ausenciasDoMes.filter(a => a.status === StatusAusencia.REJEITADO).length
      };
    });

    return dadosMes;
  }, [ausenciasFiltradas]);

  // Handler para clique em ausência
  const handleAusenciaClick = useCallback((ausencia: IAusencia) => {
    if (onAusenciaClick) {
      onAusenciaClick(ausencia);
    }
  }, [onAusenciaClick]);

  // Dropdown options para status
  const statusOptions: IDropdownOption[] = [
    { key: 'todos', text: 'Todos os status' },
    { key: StatusAusencia.PENDENTE, text: StatusAusencia.PENDENTE },
    { key: StatusAusencia.APROVADO, text: StatusAusencia.APROVADO },
    { key: StatusAusencia.REJEITADO, text: StatusAusencia.REJEITADO }
  ];

  return (
    <div className={styles.timelineContainer} style={componentStyles.container}>
      {/* Header da Web Part com botão de refresh integrado */}
      <div style={componentStyles.header}>
        <div style={componentStyles.headerText}>
          <h2 style={componentStyles.headerTitle}>
            Timeline de Ausências
          </h2>
          <p style={componentStyles.headerSubtitle}>
            Visualização moderna das ausências da equipe
          </p>
        </div>
        <button 
          style={componentStyles.refreshButton}
          onClick={onRefresh}
          disabled={isLoading}
          title="Atualizar dados"
          aria-label="Atualizar dados"
        >
          <Icon iconName={isLoading ? "ProgressLoopInner" : "Refresh"} style={{ fontSize: '16px' }} />
        </button>
      </div>

      {/* Controles de filtros */}
      {showFiltros && (
        <Stack horizontal tokens={{ childrenGap: 16 }} style={componentStyles.controlsRow}>
          <StackItem>
            <DefaultButton
              text={modoVisualizacao === 'timeline' ? 'Timeline' : 'Gráfico por Mês'}
              iconProps={{ iconName: modoVisualizacao === 'timeline' ? 'Timeline' : 'BarChart4' }}
              onClick={() => setModoVisualizacao(modoVisualizacao === 'timeline' ? 'grafico' : 'timeline')}
              style={{ backgroundColor: '#8000FF', color: '#ffffff', border: 'none' }}
            />
          </StackItem>
          <StackItem>
            <SearchBox
              placeholder="Buscar colaborador..."
              value={buscaColaborador}
              onChange={(_, value) => setBuscaColaborador(value || '')}
            />
          </StackItem>
          <StackItem>
            <Dropdown
              placeholder="Tipo de ausência"
              options={tipoOptions}
              selectedKey={filtroTipo}
              onChange={(_, option) => setFiltroTipo((option?.key as TipoAusencia | 'todos') || 'todos')}
            />
          </StackItem>
          <StackItem>
            <Dropdown
              placeholder="Status"
              options={statusOptions}
              selectedKey={filtroStatus}
              onChange={(_, option) => setFiltroStatus((option?.key as StatusAusencia | 'todos') || 'todos')}
            />
          </StackItem>
        </Stack>
      )}

      {/* Alertas de conflitos */}
      {detectarConflitos.length > 0 && (
        <MessageBar messageBarType={MessageBarType.warning} style={{ marginTop: '16px' }}>
          <strong>⚠️ {detectarConflitos.length} conflito(s) de férias detectado(s)</strong>
          <div style={{ marginTop: '8px', fontSize: '14px' }}>
            {detectarConflitos.map((conflito, index) => (
              <div key={index}>
                • {conflito.member1} e {conflito.member2}: {conflito.overlapDays} dia(s) em conflito
              </div>
            ))}
          </div>
        </MessageBar>
      )}

      {/* Conteúdo principal baseado no modo de visualização */}
      <div style={{ marginTop: '20px' }}>
        {modoVisualizacao === 'timeline' ? (
          // Visualização Timeline
          ausenciasPorColaborador.length === 0 ? (
            <div style={componentStyles.emptyState}>
              <Icon iconName="Calendar" style={{ fontSize: '48px', color: '#cccccc' }} />
              <Text variant="large" style={{ display: 'block', marginTop: '16px' }}>
                Nenhuma ausência encontrada
              </Text>
            </div>
          ) : (
            ausenciasPorColaborador.map(({ colaborador, ausencias: ausenciasColaborador }) => (
              <div key={colaborador.id} style={componentStyles.colaboradorRow}>
                <div>
                  <Text variant="medium" style={{ fontWeight: '600', color: '#000000' }}>
                    {colaborador.nome}
                  </Text>
                  <Text variant="small" style={{ color: '#666666', display: 'block' }}>
                    {colaborador.email}
                  </Text>
                  {colaborador.departamento && (
                    <Text variant="small" style={{ color: '#666666' }}>
                      {colaborador.departamento}
                    </Text>
                  )}
                </div>

                <div style={componentStyles.indicadoresContainer}>
                  {ausenciasColaborador
                    .sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime())
                    .map(ausencia => (
                      <IndicadorAusencia
                        key={ausencia.id}
                        ausencia={ausencia}
                        onClick={handleAusenciaClick}
                        largura="60px"
                        altura="28px"
                      />
                    ))}
                </div>
              </div>
            ))
          )
        ) : (
          // Visualização Gráfico por Mês
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {dadosGraficoPorMes.map((dadosMes, index) => (
              <div key={index} style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #e1e5e9'
              }}>
                <Text variant="medium" style={{ fontWeight: '600', marginBottom: '12px', display: 'block' }}>
                  {dadosMes.mes}
                </Text>

                <div style={{ marginBottom: '8px' }}>
                  <Text variant="small" style={{ color: '#666666' }}>Total: {dadosMes.total}</Text>
                </div>

                {/* Barra visual simples */}
                <div style={{ height: '100px', position: 'relative', backgroundColor: '#e1e5e9', borderRadius: '4px', overflow: 'hidden' }}>
                  {dadosMes.total > 0 && (
                    <>
                      <div style={{
                        height: `${(dadosMes.aprovadas / dadosMes.total) * 100}%`,
                        backgroundColor: '#2ECC71',
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        width: '30%'
                      }} />
                      <div style={{
                        height: `${(dadosMes.pendentes / dadosMes.total) * 100}%`,
                        backgroundColor: '#F39C12',
                        position: 'absolute',
                        bottom: '0',
                        left: '35%',
                        width: '30%'
                      }} />
                      <div style={{
                        height: `${(dadosMes.rejeitadas / dadosMes.total) * 100}%`,
                        backgroundColor: '#E74C3C',
                        position: 'absolute',
                        bottom: '0',
                        left: '70%',
                        width: '30%'
                      }} />
                    </>
                  )}
                </div>

                {/* Legenda do gráfico */}
                <div style={{ marginTop: '8px', fontSize: '12px' }}>
                  <div style={{ color: '#2ECC71' }}>✓ Aprovadas: {dadosMes.aprovadas}</div>
                  <div style={{ color: '#F39C12' }}>⏳ Pendentes: {dadosMes.pendentes}</div>
                  <div style={{ color: '#E74C3C' }}>✗ Rejeitadas: {dadosMes.rejeitadas}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legenda */}
      {showLegenda && (
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
          <Text variant="medium" style={{ fontWeight: '600', marginBottom: '12px', display: 'block' }}>
            Legenda - Tipos de Ausência
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {(legendaCustomizada && legendaCustomizada.length > 0 ? legendaCustomizada : CORES_LEGENDA).map(({ tipo, cor, nome }) => (
              <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', backgroundColor: cor, borderRadius: '4px' }} />
                <Text variant="small">{nome}</Text>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};