import { TEditableProps } from '@udecode/plate';
import { MyValue } from './plateTypes';

export const editableProps: TEditableProps<MyValue> = {
  spellCheck: false,
  autoFocus: true,
  readOnly: false,
  placeholder: 'Write your post…'
};
