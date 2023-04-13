import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import React, { useEffect } from 'react';
import { $getRoot, $insertNodes } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
const MyCustomAutoFocusPlugin: React.FC<any> = props => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      // In the browser you can use the native DOMParser API to parse the HTML string.
      const parser = new DOMParser();
      const dom = parser.parseFromString(props.initialContent, 'text/html');

      // Once you have the DOM instance it's easy to generate LexicalNodes.
      const nodes = $generateNodesFromDOM(editor, dom);

      // Select the root
      $getRoot().select();

      // Insert them at a selection.
      $insertNodes(nodes);
    });
  }, []);

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
};

export default MyCustomAutoFocusPlugin;
