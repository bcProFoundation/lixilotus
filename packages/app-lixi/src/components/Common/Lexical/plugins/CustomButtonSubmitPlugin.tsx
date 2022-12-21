import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { Button } from 'antd';
import React, { useEffect } from 'react';

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
const CustomButtonSubmitPlugin = props => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  const handleClick = () => {
    editor.update(() => {
      //   const editorState = editor.getEditorState();
      //   const jsonString = JSON.stringify(editorState);
      //   console.log('jsonString', jsonString);

      const htmlString = $generateHtmlFromNodes(editor, null);
      props.onSubmit(htmlString);
    });
  };

  return (
    <>
      <Button className="EditorLexical_submit" type="primary" onClick={handleClick}>
        POST
      </Button>
    </>
  );
};

export default CustomButtonSubmitPlugin;
