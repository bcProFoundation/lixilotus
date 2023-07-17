import { createAction } from '@reduxjs/toolkit';

export const openActionSheet = createAction(
  'actionSheet/openActionSheet',
  (actionSheetType: string, actionSheetProps: any) => {
    return {
      payload: {
        actionSheetType,
        actionSheetProps
      }
    };
  }
);

export const closeActionSheet = createAction('actionSheet/closeActionSheet');
