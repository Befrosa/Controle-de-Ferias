import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  PrimaryButton,
  DefaultButton,
  DatePicker,
  TextField,
  Dropdown,
  IDropdownOption,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Text
} from '@fluentui/react';
import { BaseModal } from '../modals/BaseModal';
import { UserPicker } from '../common/UserPicker';
import {
  IVacationFormProps,
  IVacationFormData,
  IUserInfo
} from './IVacationFormTypes';
import { SPFI } from '@pnp/sp';
import { VacationService } from '../VacationService'; // Adicionando import do serviço
import styles from './VacationForm.module.scss';

export interface IVacationFormComponentProps extends IVacationFormProps {
  sp: SPFI;
}

export const VacationForm: React.FunctionComponent<IVacationFormComponentProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
  sp
}) => {
  const [formData, setFormData] = useState<IVacationFormData>({
    employeeName: '',
    startDate: '',
    endDate: '',
    vacationType: '',
    observations: '',
    squad: ''
  });

  const [selectedUser, setSelectedUser] = useState<IUserInfo | undefined>(undefined);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [submitMessageType, setSubmitMessageType] = useState<MessageBarType>(MessageBarType.success);
  const [vacationTypes, setVacationTypes] = useState<IDropdownOption[]>([]); // Novo estado para tipos de férias
  const [isLoadingTypes, setIsLoadingTypes] = useState<boolean>(true); // Estado para carregamento dos tipos
  const [squadOptions, setSquadOptions] = useState<IDropdownOption[]>([]); // Novo estado para opções de squad
  const [isLoadingSquads, setIsLoadingSquads] = useState<boolean>(true); // Estado para carregamento dos squads

  // Serviço para comunicação com SharePoint
  const vacationService = React.useMemo(() => new VacationService(sp), [sp]);

  // Carregar tipos de férias e squads do SharePoint
  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingTypes(true);
      setIsLoadingSquads(true);
      
      try {
        // Carregar tipos de férias
        const types = await vacationService.getVacationTypeOptions();
        console.log('Tipos de férias carregados:', types);
        const vacationDropdownOptions: IDropdownOption[] = types.map(type => ({
          key: type.key,
          text: type.text
        }));
        setVacationTypes(vacationDropdownOptions);
      } catch (error) {
        console.error('Error loading vacation types:', error);
        // Fallback para tipos padrão
        setVacationTypes([
          { key: 'Férias anuais', text: 'Férias anuais' },
          { key: 'Licença médica', text: 'Licença médica' },
          { key: 'Licença maternidade', text: 'Licença maternidade' },
          { key: 'Licença paternidade', text: 'Licença paternidade' },
          { key: 'Folga compensatória', text: 'Folga compensatória' },
          { key: 'Ausência justificada', text: 'Ausência justificada' },
          { key: 'Outros', text: 'Outros' }
        ]);
      } finally {
        setIsLoadingTypes(false);
      }

      try {
        // Carregar opções de squad
        const squads = await vacationService.getSquadOptions();
        console.log('Opções de squad carregadas:', squads);
        const squadDropdownOptions: IDropdownOption[] = squads.map(squad => ({
          key: squad.key,
          text: squad.text
        }));
        setSquadOptions(squadDropdownOptions);
      } catch (error) {
        console.error('Error loading squad options:', error);
        // Fallback para opções padrão
        setSquadOptions([
          { key: 'Squad A', text: 'Squad A' },
          { key: 'Squad B', text: 'Squad B' },
          { key: 'Squad C', text: 'Squad C' },
          { key: 'Squad D', text: 'Squad D' }
        ]);
      } finally {
        setIsLoadingSquads(false);
      }
    };

    if (isOpen) {
      loadOptions();
    }
  }, [isOpen, vacationService]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        employeeName: '',
        startDate: '',
        endDate: '',
        vacationType: '',
        observations: '',
        squad: ''
      });
    }
    setSelectedUser(undefined);
    setErrors({});
    setSubmitMessage('');
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedUser) {
      newErrors.employeeName = 'Selecione um funcionário';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Data de início é obrigatória';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Data de fim é obrigatória';
    }

    if (!formData.vacationType) {
      newErrors.vacationType = 'Tipo de férias é obrigatório';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (endDate <= startDate) {
        newErrors.endDate = 'Data de fim deve ser posterior à data de início';
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);

      if (startDate < today && !isEditing) {
        newErrors.startDate = 'Data de início não pode ser anterior à data atual';
      }
    }

    setErrors(newErrors);
    console.log('Erros de validação:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      setSubmitMessage('Por favor, corrija os erros no formulário');
      setSubmitMessageType(MessageBarType.error);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const dataToSave: any = {
        ...formData,
        employeeName: selectedUser!.displayName,
        employeeId: selectedUser!.id // Adicionar o ID do colaborador
      };
      
      console.log('Dados a serem salvos:', dataToSave);

      await onSave(dataToSave);

      setSubmitMessage(isEditing ? 'Férias atualizadas com sucesso!' : 'Férias cadastradas com sucesso!');
      setSubmitMessageType(MessageBarType.success);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving vacation:', error);
      setSubmitMessage('Erro ao salvar. Tente novamente.');
      setSubmitMessageType(MessageBarType.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    console.log('Cancelando formulário');
    setFormData({
      employeeName: '',
      startDate: '',
      endDate: '',
      vacationType: '',
      observations: '',
      squad: ''
    });
    setSelectedUser(undefined);
    setErrors({});
    setSubmitMessage('');
    onClose();
  };

  const handleUserSelected = (user: IUserInfo | undefined): void => {
    setSelectedUser(user);
    if (user) {
      setFormData(prev => ({ ...prev, employeeName: user.displayName }));
      if (errors.employeeName) {
        setErrors(prev => ({ ...prev, employeeName: '' }));
      }
    }
  };

  const handleStartDateChange = (date: Date | null | undefined): void => {
    const dateString = date ? date.toISOString().split('T')[0] : '';
    setFormData(prev => ({ ...prev, startDate: dateString }));
    if (errors.startDate) {
      setErrors(prev => ({ ...prev, startDate: '' }));
    }
  };

  const handleEndDateChange = (date: Date | null | undefined): void => {
    const dateString = date ? date.toISOString().split('T')[0] : '';
    setFormData(prev => ({ ...prev, endDate: dateString }));
    if (errors.endDate) {
      setErrors(prev => ({ ...prev, endDate: '' }));
    }
  };

  const handleVacationTypeChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    const value = option ? option.key as string : '';
    setFormData(prev => ({ ...prev, vacationType: value }));
    if (errors.vacationType) {
      setErrors(prev => ({ ...prev, vacationType: '' }));
    }
  };

  const handleObservationsChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
    setFormData(prev => ({ ...prev, observations: newValue || '' }));
  };

  const handleSquadChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    const value = option ? option.key as string : '';
    setFormData(prev => ({ ...prev, squad: value }));
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title={isEditing ? 'Editar Férias' : 'Cadastrar Férias'}
      width="700px"
    >
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        {submitMessage && (
          <MessageBar
            messageBarType={submitMessageType}
            className={styles.messageBar}
            onDismiss={() => setSubmitMessage('')}
          >
            {submitMessage}
          </MessageBar>
        )}

        <div className={styles.formSection}>
          <UserPicker
            sp={sp}
            selectedUserId={selectedUser?.id}
            onUserSelected={handleUserSelected}
            label="Funcionário"
            placeholder="Selecione um funcionário"
            required={true}
            errorMessage={errors.employeeName}
          />
          
          {/* Mostrar informações adicionais do usuário selecionado */}
          {selectedUser && (
            <div style={{ marginTop: '4px' }}>
              <Text variant="small" styles={{ root: { color: '#666666' } }}>
                {selectedUser.email}
                {selectedUser.jobTitle && (
                  <span> • {selectedUser.jobTitle}</span>
                )}
                {selectedUser.department && (
                  <span> • {selectedUser.department}</span>
                )}
              </Text>
            </div>
          )}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <DatePicker
              label="Data de Início"
              value={formData.startDate ? new Date(formData.startDate) : undefined}
              onSelectDate={handleStartDateChange}
              placeholder="Selecione a data de início"
              isRequired={true}
              className={styles.datePicker}
              formatDate={(date) => date ? date.toLocaleDateString('pt-BR') : ''}
              strings={{
                months: [
                  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                ],
                shortMonths: [
                  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
                ],
                days: [
                  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
                ],
                shortDays: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
                goToToday: 'Ir para hoje',
                weekNumberFormatString: 'Semana {0}',
                prevMonthAriaLabel: 'Mês anterior',
                nextMonthAriaLabel: 'Próximo mês',
                prevYearAriaLabel: 'Ano anterior',
                nextYearAriaLabel: 'Próximo ano'
              }}
            />
            {errors.startDate && <div className={styles.errorMessage}>{errors.startDate}</div>}
          </div>

          <div className={styles.formField}>
            <DatePicker
              label="Data de Fim"
              value={formData.endDate ? new Date(formData.endDate) : undefined}
              onSelectDate={handleEndDateChange}
              placeholder="Selecione a data de fim"
              isRequired={true}
              className={styles.datePicker}
              formatDate={(date) => date ? date.toLocaleDateString('pt-BR') : ''}
              strings={{
                months: [
                  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                ],
                shortMonths: [
                  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
                ],
                days: [
                  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
                ],
                shortDays: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
                goToToday: 'Ir para hoje',
                weekNumberFormatString: 'Semana {0}',
                prevMonthAriaLabel: 'Mês anterior',
                nextMonthAriaLabel: 'Próximo mês',
                prevYearAriaLabel: 'Ano anterior',
                nextYearAriaLabel: 'Próximo ano'
              }}
            />
            {errors.endDate && <div className={styles.errorMessage}>{errors.endDate}</div>}
          </div>
        </div>

        <div className={styles.formSection}>
          <Dropdown
            label="Tipo de Férias"
            placeholder={isLoadingTypes ? "Carregando tipos..." : "Selecione o tipo de férias"}
            options={vacationTypes}
            selectedKey={formData.vacationType}
            onChange={handleVacationTypeChange}
            required={true}
            errorMessage={errors.vacationType}
            disabled={isLoadingTypes}
          />
          {isLoadingTypes && (
            <div style={{ marginTop: '8px', color: '#666666' }}>
              Carregando opções do SharePoint...
            </div>
          )}
        </div>

        <div className={styles.formSection}>
          <Dropdown
            label="Squad"
            placeholder={isLoadingSquads ? "Carregando squads..." : "Selecione o squad"}
            options={squadOptions}
            selectedKey={formData.squad}
            onChange={handleSquadChange}
            disabled={isLoadingSquads}
          />
          {isLoadingSquads && (
            <div style={{ marginTop: '8px', color: '#666666' }}>
              Carregando opções de squad do SharePoint...
            </div>
          )}
        </div>

        <div className={styles.formSection}>
          <TextField
            label="Observações"
            placeholder="Observações opcionais..."
            value={formData.observations}
            onChange={handleObservationsChange}
            multiline
            rows={3}
            resizable={false}
          />
        </div>

        <div className={styles.formActions}>
          <PrimaryButton
            text={isEditing ? 'Salvar Alterações' : 'Cadastrar'}
            onClick={handleSubmit}
            disabled={isSubmitting || isLoadingTypes || isLoadingSquads}
            className={styles.saveButton}
          />
          {isSubmitting && (
            <Spinner size={SpinnerSize.small} className={styles.spinner} />
          )}
          <DefaultButton
            text="Cancelar"
            onClick={handleCancel}
            disabled={isSubmitting || isLoadingTypes || isLoadingSquads}
            className={styles.cancelButton}
          />
        </div>
      </form>
    </BaseModal>
  );
};