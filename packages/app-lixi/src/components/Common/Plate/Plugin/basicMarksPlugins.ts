import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createUnderlinePlugin
} from '@udecode/plate';
import { plateUI } from '../plateUI';
import { createMyPlugins } from '../plateTypes';

export const basicMarksPlugins = createMyPlugins(
  [
    createBoldPlugin(),
    createCodePlugin(),
    createItalicPlugin(),
    createStrikethroughPlugin(),
    createSubscriptPlugin(),
    createSuperscriptPlugin(),
    createUnderlinePlugin()
  ],
  {
    components: plateUI
  }
);
