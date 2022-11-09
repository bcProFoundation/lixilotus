import { basicElementsPlugins } from './basicElementsPlugins';
import { basicMarksPlugins } from './basicMarksPlugins';
import { plateUI } from '../plateUI';
import { createMyPlugins } from '../plateTypes';

export const basicNodesPlugins = createMyPlugins([...basicElementsPlugins, ...basicMarksPlugins], {
  components: plateUI
});
