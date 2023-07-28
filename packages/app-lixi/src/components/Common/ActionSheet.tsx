import { useAppSelector } from '@store/hooks';
import { getActionSheet } from '@store/action-sheet/selectors';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ConfigProvider, Drawer } from 'antd';
import lightTheme from 'src/styles/themes/lightTheme';
import { getCurrentThemes } from '@store/settings';
import darkTheme from 'src/styles/themes/darkTheme';
import styled from 'styled-components';
import { PostActionSheet } from './PostActionSheet';
import _ from 'lodash';

const actionSheetComponentLookupTable = {
  PostActionSheet
};

const ActionSheet = () => {
  const currentActionSheet = useAppSelector(getActionSheet);
  const currentTheme = useAppSelector(getCurrentThemes);

  const renderedActionSheet = currentActionSheet.map((actionSheetDescription, index) => {
    const { actionSheetType, actionSheetProps = {} } = actionSheetDescription;
    const actionSheetPropsClone = _.cloneDeep(actionSheetProps);
    actionSheetPropsClone['classStyle'] = currentTheme === 'dark' ? 'action-sheet-dark' : '';
    let newActionSheetProps = { ...actionSheetPropsClone };
    const DrawerComponent = actionSheetComponentLookupTable[actionSheetType];

    return (
      <ConfigProvider theme={currentTheme === 'dark' ? darkTheme : lightTheme}>
        <DrawerComponent {...newActionSheetProps} key={actionSheetType + index} />
      </ConfigProvider>
    );
  });

  return <>{renderedActionSheet}</>;
};

export default ActionSheet;
