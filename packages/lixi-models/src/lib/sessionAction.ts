export enum SessionActionEnum {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE'
}

export interface SessionAction {
  type: SessionActionEnum;
  payload: any;
}
