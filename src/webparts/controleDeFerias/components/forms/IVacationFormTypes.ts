export interface IVacationFormData {
  employeeName: string;
  startDate: string;
  endDate: string;
  vacationType: string;
  observations?: string;
}

export interface IVacationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: IVacationFormData) => Promise<void>;
  initialData?: IVacationFormData;
  isEditing?: boolean;
}

export interface IUserInfo {
  id: string;
  displayName: string;
  email: string;
}

export interface IVacationTypeOption {
  key: string;
  text: string;
}

export const VACATION_TYPES: IVacationTypeOption[] = [
  { key: 'ferias-anuais', text: 'Férias anuais' },
  { key: 'licenca-medica', text: 'Licença médica' },
  { key: 'licenca-maternidade', text: 'Licença maternidade' },
  { key: 'licenca-paternidade', text: 'Licença paternidade' },
  { key: 'folga-compensatoria', text: 'Folga compensatória' },
  { key: 'ausencia-justificada', text: 'Ausência justificada' },
  { key: 'outros', text: 'Outros' }
];