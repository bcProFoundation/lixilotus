import { $getRoot, $getSelection } from 'lexical';

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
const onChange = (editorState, setContent) => {
  editorState.read(() => {
    // Read the contents of the EditorState here.
    const root = $getRoot();
    const selection = $getSelection();

    const content = root.__cachedText;
    setContent(content);
  });
};

export default onChange;
