export interface ActionState {
  type: string | null;
  payload: any;
  meta: any;
  error: boolean;
  count: number;
}