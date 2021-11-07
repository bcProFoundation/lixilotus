export type ModalDescription = {
  modalType: string;
  modalProps: any;
}

export interface ModalState {
  modals: Array<ModalDescription>;
}