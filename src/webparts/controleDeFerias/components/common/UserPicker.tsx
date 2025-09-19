import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Dropdown, IDropdownOption, SearchBox, Spinner, SpinnerSize } from '@fluentui/react';
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
        user.email.toLowerCase().indexOf(searchText.toLowerCase()) !== -1
      );
      setFilteredUsers(filtered);
    }
  }, [searchText, users]);

  const dropdownOptions: IDropdownOption[] = filteredUsers.map(user => ({
    key: user.id,
    text: user.displayName,
    data: user
  }));

  const handleSelectionChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
    if (option) {
      setSelectedKey(option.key as string);
      onUserSelected(option.data as IUserInfo);
    } else {
      setSelectedKey(undefined);
      onUserSelected(undefined);
    }
  };

  const handleSearch = (event?: React.ChangeEvent<HTMLInputElement>, newValue?: string): void => {
    setSearchText(newValue || '');
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

      <div className={styles.searchContainer}>
        <SearchBox
          placeholder="Pesquisar por nome ou email..."
          value={searchText}
          onChange={handleSearch}
          className={styles.searchBox}
        />
      </div>

      <Dropdown
        placeholder={placeholder}
        options={dropdownOptions}
        selectedKey={selectedKey}
        onChange={handleSelectionChange}
        className={styles.dropdown}
        errorMessage={errorMessage}
      />

      {filteredUsers.length === 0 && searchText.trim() !== '' && (
        <div className={styles.noResults}>
          Nenhum usuário encontrado para &quot;{searchText}&quot;
        </div>
      )}
    </div>
  );
};