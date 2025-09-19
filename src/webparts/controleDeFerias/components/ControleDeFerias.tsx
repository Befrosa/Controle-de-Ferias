import * as React from 'react';
import styles from './ControleDeFerias.module.scss';
import type { IControleDeFeriasProps } from './IControleDeFeriasProps';
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { useState, useEffect } from 'react';
import { PrimaryButton } from '@fluentui/react';
import { VacationService } from './VacationService';
import { ITeamMember, IMonth, IVacationConflict } from './IMapaDeFeriasTypes';
import { VacationForm } from './forms/VacationForm';
import { IVacationFormData } from './forms/IVacationFormTypes';

const ControleDeFeriasComponent: React.FunctionComponent<{ sp: SPFI }> = (props) => {
  // Dados dos membros do time e seus períodos de férias
  const [teamMembers, setTeamMembers] = useState<ITeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para o ano selecionado
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Estado para o formulário de férias
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  // Instância do serviço
  const vacationService = new VacationService(props.sp);

  // Função para formatar datas
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Não definido';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para formatar datas resumidas
  const formatShortDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Função para obter o nome do mês
  const getMonthName = (monthIndex: number): string => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[monthIndex];
  };

  // Função para gerar uma lista de datas entre duas datas
  const getDateRange = (start: string | undefined, end: string | undefined): Date[] => {
    if (!start || !end) return [];
    const dates: Date[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    // Usar um loop for para evitar problemas de modificação de data
    const currentTime = startDate.getTime();
    const endTime = endDate.getTime();
    
    for (let time = currentTime; time <= endTime; time += 86400000) { // 86400000 ms = 1 dia
      dates.push(new Date(time));
    }
    
    return dates;
  };

  // Função para encontrar conflitos de férias
  const findVacationConflicts = (): IVacationConflict[] => {
    const conflicts: IVacationConflict[] = [];
    
    // Para cada membro, verificar se há sobreposição com outros membros
    teamMembers.forEach((member1, index1) => {
      if (!member1.start || !member1.end) return;
      
      const member1Dates = getDateRange(member1.start, member1.end);
      
      teamMembers.forEach((member2, index2) => {
        // Não comparar o membro com ele mesmo
        if (index1 === index2 || !member2.start || !member2.end) return;
        
        const member2Dates = getDateRange(member2.start, member2.end);
        
        // Encontrar datas em comum
        const commonDates = member1Dates.filter(date1 => 
          member2Dates.some(date2 => date1.toDateString() === date2.toDateString())
        );
        
        // Se houver datas em comum, registrar o conflito
        if (commonDates.length > 0) {
          // Verificar se este conflito já foi registrado
          const conflictExists = conflicts.some(conflict => 
            (conflict.member1 === member1.name && conflict.member2 === member2.name) ||
            (conflict.member1 === member2.name && conflict.member2 === member1.name)
          );
          
          if (!conflictExists) {
            conflicts.push({
              member1: member1.name,
              member2: member2.name,
              startDate: commonDates[0],
              endDate: commonDates[commonDates.length - 1],
              days: commonDates.length
            });
          }
        }
      });
    });
    
    return conflicts;
  };

  // Função para navegar para o ano anterior
  const goToPreviousYear = (): void => {
    setSelectedYear(selectedYear - 1);
  };

  // Função para navegar para o próximo ano
  const goToNextYear = (): void => {
    setSelectedYear(selectedYear + 1);
  };

  // Função para abrir o formulário de férias
  const handleAddVacation = (): void => {
    setIsFormOpen(true);
  };

  // Função para fechar o formulário de férias
  const handleCloseForm = (): void => {
    setIsFormOpen(false);
  };

  // Função para salvar os dados do formulário
  const handleSaveVacation = async (formData: IVacationFormData): Promise<void> => {
    try {
      await vacationService.createVacation({
        Title: formData.employeeName,
        DataInicio: formData.startDate,
        DataFim: formData.endDate,
        TipoFerias: formData.vacationType,
        Observacoes: formData.observations
      });

      // Recarregar os dados após salvar
      const vacations = await vacationService.getVacations();
      const members: ITeamMember[] = vacations.map(vacation => ({
        name: vacation.Title,
        start: vacation.DataInicio || undefined,
        end: vacation.DataFim || undefined
      }));
      setTeamMembers(members);
    } catch (error) {
      console.error("Error saving vacation:", error);
      throw error;
    }
  };

  // Gera os 12 meses do ano selecionado
  const getMonthsOfYear = (): IMonth[] => {
    const months: IMonth[] = [];
    for (let i = 0; i < 12; i++) {
      months.push({
        year: selectedYear,
        month: i,
        name: getMonthName(i)
      });
    }
    return months;
  };

  const monthsOfYear = getMonthsOfYear();
  const conflicts = findVacationConflicts();

  // Função para calcular o índice do mês de início e fim
  const getMonthIndices = (start: string | undefined, end: string | undefined, year: number): { startIndex: number; endIndex: number } => {
    if (!start || !end) return { startIndex: -1, endIndex: -1 };
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    // Se o período não está no ano selecionado
    if (startYear > year || endYear < year) return { startIndex: -1, endIndex: -1 };
    
    let startIndex: number, endIndex: number;
    
    // Determinar o índice do mês de início
    if (startYear < year) {
      startIndex = 0; // Começa no início do ano
    } else if (startYear === year) {
      startIndex = startDate.getMonth();
    } else {
      startIndex = -1; // Período começa depois do ano selecionado
    }
    
    // Determinar o índice do mês de fim
    if (endYear > year) {
      endIndex = 11; // Termina no final do ano
    } else if (endYear === year) {
      endIndex = endDate.getMonth();
    } else {
      endIndex = -1; // Período termina antes do ano selecionado
    }
    
    // Se startIndex ou endIndex são inválidos, retornar -1
    if (startIndex === -1 || endIndex === -1) {
      return { startIndex: -1, endIndex: -1 };
    }
    
    return { startIndex, endIndex };
  };

  // Carregar dados do SharePoint
  useEffect(() => {
    const loadVacations = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const vacations = await vacationService.getVacations();
        const members: ITeamMember[] = vacations.map(vacation => ({
          name: vacation.Title,
          start: vacation.DataInicio || undefined,
          end: vacation.DataFim || undefined
        }));
        setTeamMembers(members);
      } catch (err) {
        console.error("Error loading vacations:", err);
        setError("Falha ao carregar os dados de férias. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    loadVacations().catch((err) => console.error('Error loading vacations:', err));
  }, []);

  // Renderização condicional para o estado de carregamento
  if (isLoading) {
    return (
      <div className={styles.app}>
        <h1>Mapa de Férias do Time</h1>
        <div>Carregando dados...</div>
      </div>
    );
  }

  // Renderização condicional para o estado de erro
  if (error) {
    return (
      <div className={styles.app}>
        <h1>Mapa de Férias do Time</h1>
        <div className={styles['no-conflicts']}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <h1>Mapa de Férias do Time</h1>
      
      <div className={styles.instructions}>
        <p><strong>Como ler:</strong> Cada barra verde representa o período de férias de um membro. As datas estão indicadas nas barras.</p>
      </div>

      {/* Botão para adicionar férias */}
      <div className={styles['add-vacation-section']}>
        <PrimaryButton
          text="+ Adicionar Férias"
          onClick={handleAddVacation}
          iconProps={{ iconName: 'Add' }}
          className={styles['add-vacation-button']}
        />
      </div>

      {/* Controles de navegação por ano */}
      <div className={styles['year-navigation']}>
        <button className={styles['nav-button']} onClick={goToPreviousYear}>◀ Ano Anterior</button>
        <h2 className={styles['year-display']}>{selectedYear}</h2>
        <button className={styles['nav-button']} onClick={goToNextYear}>Próximo Ano ▶</button>
      </div>
      
      <div className={styles['vacation-table-monthly']}>
        {/* Cabeçalho com os meses */}
        <div className={styles['table-header-monthly']}>
          <div className={styles['member-name-monthly']}>Membro do Time</div>
          <div className={styles['month-cells']}>
            {monthsOfYear.map((month, index) => (
              <div key={index} className={styles['month-cell']}>
                <div className={styles['month-name']}>{month.name.substring(0, 3)}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Linhas para cada membro do time */}
        {teamMembers.map((member, index) => (
          <div key={index} className={styles['table-row-monthly']}>
            <div className={styles['member-name-monthly']}>{member.name}</div>
            <div className={`${styles['month-cells']} ${styles['vacation-bars-container']}`}>
              {/* Renderizar as barras de férias */}
              {member.start && member.end && (
                (() => {
                  const { startIndex, endIndex } = getMonthIndices(member.start, member.end, selectedYear);
                  if (startIndex !== -1 && endIndex !== -1) {
                    const span = endIndex - startIndex + 1;
                    return (
                      <div 
                        className={`${styles['vacation-bar']} ${styles['vacation-bar-span']}`} 
                        style={{ 
                          gridColumn: `${startIndex + 1} / span ${span}`
                        }}
                      >
                        <div className={styles['vacation-dates']}>
                          {formatShortDate(member.start)} - {formatShortDate(member.end)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles['legend-monthly']}>
        <div className={styles['legend-item-monthly']}>
          <div className={`${styles['vacation-bar']} ${styles['legend-bar']}`}></div>
          <span>Período de férias</span>
        </div>
      </div>
      
      {/* Seção de conflitos */}
      <div className={styles['conflicts-section']}>
        <h2>Conflitos de Férias</h2>
        {conflicts.length > 0 ? (
          <div className={styles['conflicts-table']}>
            <div className={styles['conflicts-header']}>
              <div className={styles['conflict-cell']}>Membro 1</div>
              <div className={styles['conflict-cell']}>Membro 2</div>
              <div className={styles['conflict-cell']}>Período em Conflito</div>
              <div className={styles['conflict-cell']}>Dias em Conflito</div>
            </div>
            {conflicts.map((conflict, index) => (
              <div key={index} className={styles['conflicts-row']}>
                <div className={styles['conflict-cell']}>{conflict.member1}</div>
                <div className={styles['conflict-cell']}>{conflict.member2}</div>
                <div className={styles['conflict-cell']}>
                  {formatDate(conflict.startDate.toISOString().split('T')[0])} - {formatDate(conflict.endDate.toISOString().split('T')[0])}
                </div>
                <div className={styles['conflict-cell']}>{conflict.days} dias</div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles['no-conflicts']}>
            <p>Não há conflitos de férias entre os membros do time.</p>
          </div>
        )}
      </div>
      
      <div className={styles['member-details']}>
        <h2>Detalhes dos Períodos de Férias</h2>
        {teamMembers.map((member, index) => (
          <div key={index} className={styles['member-detail']}>
            <strong>{member.name}:</strong> {formatDate(member.start)} até {formatDate(member.end)}
          </div>
        ))}
      </div>

      {/* Formulário Modal de Férias */}
      <VacationForm
        sp={props.sp}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveVacation}
      />
    </div>
  );
};

export default class ControleDeFerias extends React.Component<IControleDeFeriasProps> {
  private _sp: SPFI;

  constructor(props: IControleDeFeriasProps) {
    super(props);
    this._sp = spfi().using(SPFx(this.props.context));
  }

  public render(): React.ReactElement<IControleDeFeriasProps> {
    return (
      <ControleDeFeriasComponent sp={this._sp} />
    );
  }
}