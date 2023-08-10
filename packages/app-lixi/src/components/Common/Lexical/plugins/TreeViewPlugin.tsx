import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TreeView } from '@lexical/react/LexicalTreeView';

const TreeViewPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  return (
    <TreeView
      treeTypeButtonClassName="tree-view-button"
      viewClassName="tree-view-output"
      timeTravelPanelClassName="debug-timetravel-panel"
      timeTravelButtonClassName="debug-timetravel-button"
      timeTravelPanelSliderClassName="debug-timetravel-panel-slider"
      timeTravelPanelButtonClassName="debug-timetravel-panel-button"
      editor={editor}
    />
  );
};

export default TreeViewPlugin;
