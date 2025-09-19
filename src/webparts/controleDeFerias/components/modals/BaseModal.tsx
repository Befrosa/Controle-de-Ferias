import * as React from 'react';
import { Modal, IconButton } from '@fluentui/react';
import styles from './BaseModal.module.scss';

export interface IBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  height?: string;
}

export const BaseModal: React.FunctionComponent<IBaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = '600px',
  height = 'auto'
}) => {
  const modalStyles = React.useMemo(() => ({
    main: {
      width,
      height,
      minHeight: '400px',
      maxHeight: '90vh'
    }
  }), [width, height]);

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onClose}
      isBlocking={true}
      styles={modalStyles}
      className={styles.modal}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <IconButton
            iconProps={{ iconName: 'Cancel' }}
            ariaLabel="Fechar"
            onClick={onClose}
            className={styles.closeButton}
          />
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </Modal>
  );
};