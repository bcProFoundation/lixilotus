import { createContext, useContext } from 'react';
import _ from 'lodash';

export const FeatureToggleContext = createContext({
  enabledFeatures: [] as string[]
});

type FeatureProviderProps = {
  children: any;
  enabledFeatures: string[];
};

export const getAllFeatures = () => {
  const { enabledFeatures } = useContext(FeatureToggleContext);
  return enabledFeatures;
};

export const isFeatureEnabled = (featureName: string): boolean => {
  if (!featureName || featureName === '') {
    return false;
  }

  const { enabledFeatures } = useContext(FeatureToggleContext);

  const feature: any = _.find(enabledFeatures, ['name', featureName]);

  if (!feature) {
    return false;
  }

  return feature.enabled;
};

export const FeatureToggleProvider = ({ children, enabledFeatures }: FeatureProviderProps) => {
  return <FeatureToggleContext.Provider value={{ enabledFeatures }}>{children}</FeatureToggleContext.Provider>;
};
