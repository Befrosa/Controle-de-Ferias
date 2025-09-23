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
import { ITimelineAusenciasProps, IAusencia, StatusAusencia, IVacationConflict } from '../interfaces/IAusenciaTypes';
import { IndicadorAusencia } from '../IndicadorAusencia/IndicadorAusencia';
import { CORES_LEGENDA } from '../utils/ColorMapping';
import styles from './TimelineAusencias.module.scss';

/**
 * Estilos inline para componentes
 */
const componentStyles = {
  container: {
    width: '100%',
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
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
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
  addButton: {
    width: '36px',
    height: '36px',
    minWidth: '36px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: '1px solid #2ECC71',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#2ECC71'
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
  squadOptionsFromSharePoint,
  onAddAusencia // Adicionando o handler
}) => {

  // Estados locais para filtros e controles
  const [modoVisualizacao, setModoVisualizacao] = useState<'timeline' | 'grafico'>('timeline');
  const [filtroSquad, setFiltroSquad] = useState<string | 'todos'>('todos');
  const [buscaColaborador, setBuscaColaborador] = useState<string>('');
  const [anoAtual, setAnoAtual] = useState<number>(anoSelecionado || new Date().getFullYear());
  const [mesAtual, setMesAtual] = useState<number>(mesSelecionado || new Date().getMonth());

  // Navegação entre meses
  const handleMesAnterior = useCallback(() => {
    console.log('Navegando para o mês anterior');
    setMesAtual(prevMes => {
      if (prevMes === 0) {
        setAnoAtual(prevAno => prevAno - 1);
        return 11;
      }
      return prevMes - 1;
    });
  }, []);

  const handleProximoMes = useCallback(() => {
    console.log('Navegando para o próximo mês');
    setMesAtual(prevMes => {
      if (prevMes === 11) {
        setAnoAtual(prevAno => prevAno + 1);
        return 0;
      }
      return prevMes + 1;
    });
  }, []);

  const handleMesAtual = useCallback(() => {
    console.log('Voltando para o mês atual');
    const hoje = new Date();
    setAnoAtual(hoje.getFullYear());
    setMesAtual(hoje.getMonth());
  }, []);

  // Navegação entre anos para o modo gráfico
  const handleAnoAnterior = useCallback(() => {
    console.log('Navegando para o ano anterior');
    setAnoAtual(prevAno => prevAno - 1);
  }, []);

  const handleProximoAno = useCallback(() => {
    console.log('Navegando para o próximo ano');
    setAnoAtual(prevAno => prevAno + 1);
  }, []);

  const handleAnoAtual = useCallback(() => {
    console.log('Voltando para o ano atual');
    const hoje = new Date();
    setAnoAtual(hoje.getFullYear());
    setMesAtual(hoje.getMonth());
  }, []);

  // Obter nome do mês
  const getNomeMes = useCallback((mesIndex: number): string => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const nomeMes = meses[mesIndex];
    console.log('Obtendo nome do mês para índice:', mesIndex, 'nome:', nomeMes);
    return nomeMes;
  }, []);

  // Dropdown options para squad - usando as opções do SharePoint se disponíveis
  const squadOptions: IDropdownOption[] = useMemo(() => {
    const options: IDropdownOption[] = [{ key: 'todos', text: 'Todos os squads' }];

    if (squadOptionsFromSharePoint && squadOptionsFromSharePoint.length > 0) {
      // Usar as opções carregadas do SharePoint
      console.log('Usando opções de squad do SharePoint:', squadOptionsFromSharePoint);
      squadOptionsFromSharePoint.forEach((option: { key: string, text: string }) => {
        options.push({ key: option.key, text: option.text });
      });
    } else {
      // Fallback para opções padrão
      console.log('Usando opções de squad padrão');
      options.push(
        { key: 'Squad A', text: 'Squad A' },
        { key: 'Squad B', text: 'Squad B' },
        { key: 'Squad C', text: 'Squad C' },
        { key: 'Squad D', text: 'Squad D' }
      );
    }

    console.log('Opções de squad geradas:', options);
    return options;
  }, [squadOptionsFromSharePoint]);

  // Filtrar ausências baseado nos filtros ativos
  const ausenciasFiltradas = useMemo(() => {
    console.log('Filtrando ausências. Ausências originais:', ausencias);
    console.log('Filtros ativos - Ano:', anoAtual, 'Mês:', mesAtual, 'Squad:', filtroSquad, 'Busca:', buscaColaborador);

    let filtered = ausencias.filter(ausencia => {
      // Filtro por ano
      const anoAusencia = ausencia.dataInicio.getFullYear();
      if (anoAusencia !== anoAtual) return false;

      // Filtro por mês - verificar se a ausência está no mês selecionado
      const mesInicio = ausencia.dataInicio.getMonth();
      const mesFim = ausencia.dataFim.getMonth();
      const anoInicio = ausencia.dataInicio.getFullYear();
      const anoFim = ausencia.dataFim.getFullYear();

      // Verificar se a ausência está ativa no mês/ano selecionado
      let ausenciaNoMes = false;

      if (anoAtual === anoInicio && anoAtual === anoFim) {
        // Mesmo ano de início e fim
        ausenciaNoMes = mesInicio <= mesAtual && mesAtual <= mesFim;
      } else if (anoAtual === anoInicio) {
        // Ano selecionado é o ano de início
        ausenciaNoMes = mesInicio <= mesAtual;
      } else if (anoAtual === anoFim) {
        // Ano selecionado é o ano de fim
        ausenciaNoMes = mesAtual <= mesFim;
      } else if (anoInicio < anoAtual && anoAtual < anoFim) {
        // Ano selecionado está entre o início e o fim
        ausenciaNoMes = true;
      }

      if (!ausenciaNoMes) return false;

      // Filtro por squad
      if (filtroSquad !== 'todos') {
        // Verificar se o colaborador tem squad definido e se corresponde ao filtro
        const squadColaborador = ausencia.colaborador.squad;
        if (!squadColaborador || squadColaborador.toLowerCase().trim() !== filtroSquad.toLowerCase().trim()) {
          return false;
        }
      }

      // Filtro por colaborador
      if (buscaColaborador && ausencia.colaborador.nome.toLowerCase().indexOf(buscaColaborador.toLowerCase()) === -1) {
        return false;
      }

      return true;
    });

    console.log('Ausências filtradas:', filtered);
    return filtered;
  }, [ausencias, anoAtual, mesAtual, filtroSquad, buscaColaborador]);

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
    console.log('Detectando conflitos nas ausências filtradas:', ausenciasFiltradas);
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

    console.log('Conflitos detectados:', conflicts);
    return conflicts;
  }, [ausenciasFiltradas]);

  // Dados para gráfico por mês - usa todas as ausências do ano, não apenas as filtradas por mês
  const dadosGraficoPorMes = useMemo(() => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Para o gráfico, usar todas as ausências do ano, aplicando apenas filtros de squad e colaborador
    const ausenciasDoAno = ausencias.filter(ausencia => {
      // Filtro por ano
      const anoAusencia = ausencia.dataInicio.getFullYear();
      if (anoAusencia !== anoAtual) return false;

      // Filtro por squad (mesmo filtro da timeline)
      if (filtroSquad !== 'todos') {
        const squadColaborador = ausencia.colaborador.squad;
        if (!squadColaborador || squadColaborador.toLowerCase().trim() !== filtroSquad.toLowerCase().trim()) {
          return false;
        }
      }

      // Filtro por colaborador (mesmo filtro da timeline)
      if (buscaColaborador && ausencia.colaborador.nome.toLowerCase().indexOf(buscaColaborador.toLowerCase()) === -1) {
        return false;
      }

      return true;
    });

    const dadosMes = meses.map((nome, index) => {
      const ausenciasDoMes = ausenciasDoAno.filter(ausencia => {
        const mesInicio = ausencia.dataInicio.getMonth();
        const mesFim = ausencia.dataFim.getMonth();
        const anoInicio = ausencia.dataInicio.getFullYear();
        const anoFim = ausencia.dataFim.getFullYear();
        
        // Verificar se a ausência está ativa no mês específico do ano
        let ausenciaNoMes = false;
        
        if (anoAtual === anoInicio && anoAtual === anoFim) {
          // Mesmo ano de início e fim
          ausenciaNoMes = mesInicio <= index && index <= mesFim;
        } else if (anoAtual === anoInicio) {
          // Ano selecionado é o ano de início
          ausenciaNoMes = mesInicio <= index;
        } else if (anoAtual === anoFim) {
          // Ano selecionado é o ano de fim
          ausenciaNoMes = index <= mesFim;
        } else if (anoInicio < anoAtual && anoAtual < anoFim) {
          // Ano selecionado está entre o início e o fim
          ausenciaNoMes = true;
        }
        
        return ausenciaNoMes;
      });

      return {
        mes: nome,
        total: ausenciasDoMes.length,
        aprovadas: ausenciasDoMes.filter(a => a.status === StatusAusencia.APROVADO).length,
        pendentes: ausenciasDoMes.filter(a => a.status === StatusAusencia.PENDENTE).length,
        rejeitadas: ausenciasDoMes.filter(a => a.status === StatusAusencia.REJEITADO).length
      };
    });

    console.log('Dados do gráfico por mês (ano completo):', dadosMes);
    return dadosMes;
  }, [ausencias, anoAtual, filtroSquad, buscaColaborador]);

  // Handler para clique em ausência
  const handleAusenciaClick = useCallback((ausencia: IAusencia) => {
    console.log('Clicou na ausência no TimelineAusencias:', ausencia);
    if (onAusenciaClick) {
      onAusenciaClick(ausencia);
    }
  }, [onAusenciaClick]);



  return (
    <div className={styles.timelineContainer} style={componentStyles.container}>
      {/* Header da Web Part com botões de ação integrados */}
      <div style={componentStyles.header}>
        <div style={componentStyles.headerText}>
          <h2 style={componentStyles.headerTitle}>
            {modoVisualizacao === 'timeline' 
              ? `Timeline de Ausências - ${getNomeMes(mesAtual)} ${anoAtual}`
              : `Gráfico de Ausências - ${anoAtual}`
            }
          </h2>
          <p style={componentStyles.headerSubtitle}>
            {modoVisualizacao === 'timeline' 
              ? 'Visualização mensal das ausências da equipe'
              : 'Visualização anual por mês das ausências da equipe'
            }
          </p>
        </div>
        <div style={componentStyles.headerActions}>
          {/* Controles de navegação entre meses - apenas no modo timeline */}
          {modoVisualizacao === 'timeline' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
              <button
                style={{
                  ...componentStyles.refreshButton,
                  width: '32px',
                  height: '32px',
                  minWidth: '32px'
                }}
                onClick={handleMesAnterior}
                title="Mês anterior"
                aria-label="Mês anterior"
              >
                <Icon iconName="ChevronLeft" style={{ fontSize: '14px' }} />
              </button>

              <button
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#8000FF',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.3s ease'
                }}
                onClick={handleMesAtual}
                title="Mês atual"
              >
                Hoje
              </button>

              <button
                style={{
                  ...componentStyles.refreshButton,
                  width: '32px',
                  height: '32px',
                  minWidth: '32px'
                }}
                onClick={handleProximoMes}
                title="Próximo mês"
                aria-label="Próximo mês"
              >
                <Icon iconName="ChevronRight" style={{ fontSize: '14px' }} />
              </button>
            </div>
          )}

          {/* Controles de navegação entre anos - apenas no modo gráfico */}
          {modoVisualizacao === 'grafico' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
              <button
                style={{
                  ...componentStyles.refreshButton,
                  width: '32px',
                  height: '32px',
                  minWidth: '32px'
                }}
                onClick={handleAnoAnterior}
                title="Ano anterior"
                aria-label="Ano anterior"
              >
                <Icon iconName="ChevronLeft" style={{ fontSize: '14px' }} />
              </button>

              <button
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#8000FF',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.3s ease'
                }}
                onClick={handleAnoAtual}
                title="Ano atual"
              >
                {anoAtual}
              </button>

              <button
                style={{
                  ...componentStyles.refreshButton,
                  width: '32px',
                  height: '32px',
                  minWidth: '32px'
                }}
                onClick={handleProximoAno}
                title="Próximo ano"
                aria-label="Próximo ano"
              >
                <Icon iconName="ChevronRight" style={{ fontSize: '14px' }} />
              </button>
            </div>
          )}

          {/* Botão de adicionar ausência */}
          <button
            style={componentStyles.addButton}
            onClick={onAddAusencia}
            title="Adicionar férias"
            aria-label="Adicionar férias"
          >
            <Icon iconName="Add" style={{ fontSize: '16px' }} />
          </button>

          {/* Botão de refresh */}
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
              placeholder="Filtrar por Squad"
              options={squadOptions}
              selectedKey={filtroSquad}
              onChange={(_, option) => setFiltroSquad((option?.key as string | 'todos') || 'todos')}
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
                  {colaborador.squad && (
                    <Text variant="small" style={{ color: '#8000FF', fontWeight: '500' }}>
                      {colaborador.squad}
                    </Text>
                  )}
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