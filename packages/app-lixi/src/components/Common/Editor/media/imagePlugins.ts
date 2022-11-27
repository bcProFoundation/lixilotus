import {
  createBasicElementsPlugin,
  createComboboxPlugin,
  createImagePlugin,
  createSelectOnBackspacePlugin,
  createMediaEmbedPlugin
} from '@udecode/plate';
import { basicMarksPlugins } from '../basic-marks/basicMarksPlugins';
import { plateUI } from '../common/plateUI';
import { selectOnBackspacePlugin } from '../select-on-backspace/selectOnBackspacePlugin';
import { createMyPlugins } from '../typescript/plateTypes';

export const imagePlugins = createMyPlugins(
  [
    createImagePlugin(),
    createSelectOnBackspacePlugin(selectOnBackspacePlugin),
    createComboboxPlugin(),
    createMediaEmbedPlugin()
  ],
  {
    components: plateUI
  }
);
