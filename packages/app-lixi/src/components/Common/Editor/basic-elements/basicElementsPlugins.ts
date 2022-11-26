import {
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createHeadingPlugin,
  createParagraphPlugin,
  createBasicMarksPlugin,
  createHighlightPlugin
} from '@udecode/plate';
import { plateUI } from '../common/plateUI';
import { createMyPlugins } from '../typescript/plateTypes';

export const basicElementsPlugins = createMyPlugins(
  [
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHeadingPlugin(),
    createParagraphPlugin(),
    createBasicMarksPlugin(),
    createHighlightPlugin()
  ],
  {
    components: plateUI
  }
);
