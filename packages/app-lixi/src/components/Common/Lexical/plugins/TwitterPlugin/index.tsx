/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { Button } from 'antd';
import { COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical';
import { useEffect } from 'react';

import { $createTweetNode, TweetNode } from '../../nodes/TweetNode';

export const INSERT_TWEET_COMMAND: LexicalCommand<string> = createCommand('INSERT_TWEET_COMMAND');

const TwitterPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([TweetNode])) {
      throw new Error('TwitterPlugin: TweetNode not registered on editor');
    }

    return editor.registerCommand<string>(
      INSERT_TWEET_COMMAND,
      payload => {
        const tweetNode = $createTweetNode(payload);
        $insertNodeToNearestRoot(tweetNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  const handleClick = () => {
    // editor.registerCommand<string>(
    //   INSERT_TWEET_COMMAND,
    //   payload => {
    //     const tweetNode = $createTweetNode('1603431188475138048');
    //     $insertNodeToNearestRoot(tweetNode);

    //     return true;
    //   },
    //   COMMAND_PRIORITY_EDITOR
    // );
    editor.dispatchCommand(INSERT_TWEET_COMMAND, '1603473737394884608');
  };

  return (
    <>
      <Button type="primary" onClick={handleClick}>
        Twitter
      </Button>
    </>
  );
};

export default TwitterPlugin;
