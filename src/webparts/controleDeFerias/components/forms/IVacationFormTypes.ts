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

// Removendo a constante VACATION_TYPES fixa e usando uma função para obter os tipos