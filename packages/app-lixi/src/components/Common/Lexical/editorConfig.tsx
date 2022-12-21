import { EmojiNode } from './nodes/EmojiNode';
import { TweetNode } from './nodes/TweetNode';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { HashtagNode } from '@lexical/hashtag';
import EditorLexicalTheme from './themes/EditorLexicalTheme';

const editorConfig = {
  namespace: 'lixilotus',
  theme: EditorLexicalTheme,
  onError(error) {
    throw error;
  },
  nodes: [EmojiNode, TweetNode, AutoLinkNode, LinkNode, HashtagNode]
};

export default editorConfig;
