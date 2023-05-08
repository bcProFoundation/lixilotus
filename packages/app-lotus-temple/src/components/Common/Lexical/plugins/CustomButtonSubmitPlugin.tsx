import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { Button } from 'antd';
import React, { useEffect } from 'react';
import intl from 'react-intl-universal';
import { useAppDispatch } from '@store/hooks';
import { saveEditorTextToCache } from '@store/account/actions';

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
const CustomButtonSubmitPlugin = props => {
  const [editor] = useLexicalComposerContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  const getEditorStateTextString = () => {
    const stringifiedEditorState = JSON.stringify(editor.getEditorState().toJSON());
    const parsedEditorState = editor.parseEditorState(stringifiedEditorState);

    const editorStateTextString = parsedEditorState.read(() => $getRoot().getTextContent());

    return editorStateTextString;
  };

  // useEffect(() => {
  //   if (props.isEditMode) return;

  //   const myInterval = setInterval(() => {
  //     dispatch(saveEditorTextToCache(editor.getRootElement().innerHTML));
  //   }, 5000);
  //   // clear out the interval using the id when unmounting the component
  //   return () => clearInterval(myInterval);
  // }, []);

  const handleClick = () => {
    editor.update(() => {
      // const editorState = editor.getEditorState();
      // const jsonString = JSON.stringify(editorState);
      // console.log('jsonString', jsonString);

      // const htmlString = $generateHtmlFromNodes(editor, null);

      const rootElementString = editor.getRootElement().innerHTML;

      props.onSubmit({ htmlContent: rootElementString, pureContent: getEditorStateTextString() });
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
