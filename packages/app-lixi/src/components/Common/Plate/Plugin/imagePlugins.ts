import { createBasicElementsPlugin, createImagePlugin, createSelectOnBackspacePlugin } from '@udecode/plate';
import { basicMarksPlugins } from './basicMarksPlugins';
import { plateUI } from '../plateUI';
import { selectOnBackspacePlugin } from './selectOnBackspacePlugin';
import { createMyPlugins } from '../plateTypes';

export const imagePlugins = createMyPlugins(
  [
    createBasicElementsPlugin(),
    ...basicMarksPlugins,
    createImagePlugin(),
    createSelectOnBackspacePlugin(selectOnBackspacePlugin)
  ],
  {
    components: plateUI
  }
);
