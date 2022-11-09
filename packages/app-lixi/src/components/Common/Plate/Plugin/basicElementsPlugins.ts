import {
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createHeadingPlugin,
  createParagraphPlugin
} from '@udecode/plate';
import { plateUI } from '../plateUI';
import { createMyPlugins } from '../plateTypes';

export const basicElementsPlugins = createMyPlugins(
  [createBlockquotePlugin(), createCodeBlockPlugin(), createHeadingPlugin(), createParagraphPlugin()],
  {
    components: plateUI
  }
);
