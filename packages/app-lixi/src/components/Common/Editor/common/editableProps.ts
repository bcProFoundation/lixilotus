import { TEditableProps } from '@udecode/plate';
import { MyValue } from '../typescript/plateTypes';

export const editableProps: TEditableProps<MyValue> = {
  spellCheck: false,
  autoFocus: true,
  readOnly: false,
  placeholder: "What's on your mind?"
};
