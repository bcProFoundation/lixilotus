export interface LoadingState {
  global: boolean;
  models: {
    [key: string]: boolean;
  };
  effects: {
    [model: string]: {
      [effect: string]: boolean;
    };
  };
}
