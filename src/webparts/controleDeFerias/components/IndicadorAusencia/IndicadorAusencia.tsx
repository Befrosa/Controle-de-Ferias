import * as React from 'react';
import {
  TooltipHost,
  ITooltipHostStyles,
  DirectionalHint
} from '@fluentui/react';
import { IIndicadorProps, StatusAusencia, TipoAusencia } from '../interfaces/IAusenciaTypes';
import {
  gerarBackgroundIndicadorDinamico,
  obterCorDinamica,
  clarearCor,
  ESTILOS_STATUS
} from '../utils/ColorMapping';
import styles from './IndicadorAusencia.module.scss';

/**
 * Estilos para o tooltip (Fluent UI v8)
 */
const tooltipStyles: Partial<ITooltipHostStyles> = {
  root: {
    display: 'inline-block',
    cursor: 'pointer'
  }
};

/**
 * Componente reutilizável para exibir indicadores visuais de ausências
 * Inclui cores dinâmicas, padrões por status e tooltips informativos
 */
export const IndicadorAusencia: React.FunctionComponent<IIndicadorProps> = ({
  ausencia,
  largura = '100%',
  altura = '24px',
  showTooltip = true,
  onClick
}) => {

  // Gera o estilo do indicador baseado no tipo e status
  // Usa sistema dinâmico baseado no string do tipo
  const tipoString = typeof ausencia.tipo === 'string' ? ausencia.tipo : TipoAusencia[ausencia.tipo as unknown as keyof typeof TipoAusencia];
  const backgroundStyle = gerarBackgroundIndicadorDinamico(tipoString, ausencia.status);
  const corConfig = obterCorDinamica(tipoString);
  const corPrincipal = corConfig.cor;
  const corHover = clarearCor(corPrincipal, 0.3);
  const configStatus = ESTILOS_STATUS[ausencia.status];

  // Formata as datas para exibição
  const formatarData = (data: Date): string => {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formata o período completo
  const formatarPeriodo = (): string => {
    const inicio = formatarData(ausencia.dataInicio);
    const fim = formatarData(ausencia.dataFim);
    return `${inicio} - ${fim}`;
  };


  // Handler para clique no indicador
  const handleClick = (event: React.MouseEvent): void => {
    event.stopPropagation();
    if (onClick) {
      onClick(ausencia);
    }
  };

  // Handler para teclas (acessibilidade)
  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onClick) {
        onClick(ausencia);
      }
    }
  };

  // Estilos dinâmicos do indicador
  const indicadorStyle: React.CSSProperties = {
    width: largura,
    height: altura,
    background: backgroundStyle,
    opacity: configStatus.opacidade,
    border: `${configStatus.bordaStyle} ${corPrincipal}`,
    '--hover-bg': corHover
  } as React.CSSProperties & { '--hover-bg': string };

  // Conteúdo do tooltip como string (Fluent UI v8)
  const tooltipContent = `
    ${ausencia.colaborador.nome}

    Tipo: ${ausencia.tipo}
    Período: ${formatarPeriodo()}
    Duração: ${ausencia.diasTotais} ${ausencia.diasTotais === 1 ? 'dia' : 'dias'}
    Status: ${ausencia.status}
    ${ausencia.observacoes ? `Observações: ${ausencia.observacoes}` : ''}
    ${ausencia.aprovadoPor && ausencia.status === StatusAusencia.APROVADO ? `Aprovado por: ${ausencia.aprovadoPor}` : ''}
  `.trim();

  // Componente do indicador
  const indicadorElement = (
    <div
      className={styles.indicador}
      style={indicadorStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${ausencia.tipo} - ${ausencia.colaborador.nome} - ${formatarPeriodo()}`}
      data-testid="indicador-ausencia"
      data-status={ausencia.status.toLowerCase()}
    >
      {/* Overlay para melhor interação visual */}
      <div className={styles.indicadorOverlay} />

      {/* Conteúdo opcional do indicador */}
      <div className={styles.indicadorContent}>
        <span className={styles.diasCount}>
          {ausencia.diasTotais}d
        </span>
      </div>
    </div>
  );

  // Retorna com ou sem tooltip
  if (!showTooltip) {
    return indicadorElement;
  }

  return (
    <TooltipHost
      content={tooltipContent}
      directionalHint={DirectionalHint.topCenter}
      styles={tooltipStyles}
    >
      {indicadorElement}
    </TooltipHost>
  );
};