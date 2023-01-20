import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { Button } from 'antd';
import React, { useEffect } from 'react';
import intl from 'react-intl-universal';

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
      // const editorState = editor.getEditorState();
      // const jsonString = JSON.stringify(editorState);
      // console.log('jsonString', jsonString);

      const stringifiedEditorState = JSON.stringify(editor.getEditorState().toJSON());
      const parsedEditorState = editor.parseEditorState(stringifiedEditorState);

      const editorStateTextString = parsedEditorState.read(() => $getRoot().getTextContent());

      // const htmlString = $generateHtmlFromNodes(editor, null);

      const rootElementString = editor.getRootElement().innerHTML;

      props.onSubmit({ htmlContent: rootElementString, pureContent: editorStateTextString });
    });
  };

  return (
    <Button
      style={{ textTransform: 'uppercase' }}
      className="EditorLexical_submit"
      type="primary"
      onClick={handleClick}
      loading={props.loading}
    >
      {intl.get('general.post')}
    </Button>
  );
};

export default CustomButtonSubmitPlugin;
