export type ActionSheetDescription = {
  actionSheetType: string;
  actionSheetProps: any;
};

export interface ActionSheetState {
  actionSheets: Array<ActionSheetDescription>;
}
