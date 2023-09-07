import { useMemo } from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';

const useDetectMobileView = () => {
  const { width } = useWindowDimensions();

  const isMobileView = useMemo(() => {
    return width < 968 ? true : false;
  }, [width]);
  return isMobileView;
};

export default useDetectMobileView;
