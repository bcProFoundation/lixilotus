import { $getRoot, $getSelection } from 'lexical';

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
const onChange = editorState => {
  editorState.read(() => {
    // Read the contents of the EditorState here.
    const root = $getRoot();
    const selection = $getSelection();

    // console.log(root, selection);
  });
};

export default onChange;
