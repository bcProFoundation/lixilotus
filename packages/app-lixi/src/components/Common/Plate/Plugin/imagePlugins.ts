import {
  createBasicElementsPlugin,
  createExitBreakPlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createResetNodePlugin,
  createSelectOnBackspacePlugin,
  createSoftBreakPlugin,
  createTodoListPlugin
} from '@udecode/plate';
import { basicMarksPlugins } from './basicMarksPlugins';
import { plateUI } from '../plateUI';
import { selectOnBackspacePlugin } from './selectOnBackspacePlugin';
import { createMyPlugins } from '../plateTypes';
import { resetBlockTypePlugin } from './resetBlockTypePlugin';
import { softBreakPlugin } from './softBreakPlugin';
import { exitBreakPlugin } from './exitBreakPlugin';

export const imagePlugins = createMyPlugins(
  [
    createBasicElementsPlugin(),
    ...basicMarksPlugins,
    createImagePlugin(),
    createSelectOnBackspacePlugin(selectOnBackspacePlugin),
    createLinkPlugin(),
    createResetNodePlugin(resetBlockTypePlugin),
    createSoftBreakPlugin(softBreakPlugin),
    createExitBreakPlugin(exitBreakPlugin),
    createListPlugin(),
    createTodoListPlugin()
  ],
  {
    components: plateUI
  }
);
