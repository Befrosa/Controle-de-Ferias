import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { ComboBox, IComboBoxOption, IComboBox, Spinner, SpinnerSize } from '@fluentui/react';
import { UserService } from '../UserService';
import { IUserInfo } from '../forms/IVacationFormTypes';
import { SPFI } from '@pnp/sp';
import styles from './UserPicker.module.scss';

export interface IUserPickerProps {
  sp: SPFI;
  selectedUserId?: string;
  onUserSelected: (user: IUserInfo | undefined) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  errorMessage?: string;
}

export const UserPicker: React.FunctionComponent<IUserPickerProps> = ({
  sp,
  selectedUserId,
  onUserSelected,
  label = "Funcionário",
  placeholder = "Selecione um funcionário",
  required = false,
  errorMessage
}) => {
  const [users, setUsers] = useState<IUserInfo[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUserInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedKey, setSelectedKey] = useState<string | undefined>(selectedUserId);

  const userService = React.useMemo(() => new UserService(sp), [sp]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersList = await userService.getUsers();
      console.log('Usuários carregados:', usersList);
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userService]);

  useEffect(() => {
    loadUsers().catch((err) => console.error('Error loading users:', err));
  }, [loadUsers]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.displayName.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
        user.email.toLowerCase().indexOf(searchText.toLowerCase()) !== -1 ||
        (user.jobTitle && user.jobTitle.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) ||
        (user.department && user.department.toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
      );
      setFilteredUsers(filtered);
    }
    
    console.log('Texto de busca:', searchText);
    console.log('Usuários filtrados:', filteredUsers);
  }, [searchText, users]);

  const comboBoxOptions: IComboBoxOption[] = filteredUsers.map(user => ({
    key: user.id,
    text: user.displayName,
    data: user
  }));
  
  console.log('Opções do ComboBox:', comboBoxOptions);

  const handleSelectionChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
    if (option) {
      setSelectedKey(option.key as string);
      onUserSelected(option.data as IUserInfo);
      
      // Log das informações do usuário selecionado
      const selectedUser = option.data as IUserInfo;
      console.log('=== INFORMAÇÕES DO USUÁRIO SELECIONADO ===');
      console.log('ID:', selectedUser.id);
      console.log('Nome:', selectedUser.displayName);
      console.log('E-mail:', selectedUser.email);
      console.log('Cargo:', selectedUser.jobTitle || 'Não informado');
      console.log('Departamento:', selectedUser.department || 'Não informado');
      console.log('========================================');
    } else {
      setSelectedKey(undefined);
      onUserSelected(undefined);
    }
  };

  const handleInputValueChange = (inputValue?: string): void => {
    setSearchText(inputValue || '');
  };

  if (isLoading) {
    return (
      <div className={styles.userPicker}>
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
        <div className={styles.loadingContainer}>
          <Spinner size={SpinnerSize.small} />
          <span className={styles.loadingText}>Carregando usuários...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.userPicker}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>

      <ComboBox
        placeholder={placeholder}
        options={comboBoxOptions}
        selectedKey={selectedKey}
        onChange={handleSelectionChange}
        onInputValueChange={handleInputValueChange}
        className={styles.dropdown}
        errorMessage={errorMessage}
        allowFreeform={false}
        autoComplete="on"
      />

      {filteredUsers.length === 0 && searchText.trim() !== '' && (
        <div className={styles.noResults}>
          Nenhum usuário encontrado para &quot;{searchText}&quot;
        </div>
      )}
    </div>
  );
};