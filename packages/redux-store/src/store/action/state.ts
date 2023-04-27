export interface ActionState {
  type: Nullable<string>;
  payload: Nullable<any>;
  meta: Nullable<any>;
  error: Nullable<boolean>;
  count: Nullable<number>;
}
