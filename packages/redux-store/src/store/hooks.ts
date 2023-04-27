import { DependencyList, useEffect, useRef } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux';
import { AnyAction } from 'redux';

import type { AppDispatch, RootState } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type ReduxEffect = (action: AnyAction) => void;

export function useReduxEffect(effect: ReduxEffect, type: string | string[], deps: DependencyList = []): void {
  const currentValue = useRef(null);
  const store = useStore();

  const handleChange = (): void => {
    const state = store.getState();
    const action = (state as any).action;
    const previousValue = currentValue.current;
    currentValue.current = action.count;

    const types = Array.isArray(type) ? type : [type];
    if (previousValue !== action.count && types.includes(action.type)) {
      effect(action);
    }
  };

  useEffect(() => {
    const unsubscribe = store.subscribe(handleChange);
    return (): void => unsubscribe();
  }, deps);
}
