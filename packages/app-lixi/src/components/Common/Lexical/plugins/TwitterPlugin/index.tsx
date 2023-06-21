/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { TwitterOutlined } from '@ant-design/icons';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { Button, Input, Modal } from 'antd';
import { COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from 'lexical';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { $createTweetNode, TweetNode } from '../../nodes/TweetNode';

const TwitterButton = styled(Button)`
  span {
    color: #4e444b;
  }
`;

const TwitterEmbedConfig = {
  // e.g. Tweet or Google Map.
  contentName: 'Tweet',

  exampleUrl: 'https://twitter.com/jack/status/20',

  // Icon for display.
  icon: <i className="icon tweet" />,

  // For extra searching.
  keywords: ['tweet', 'twitter'],

  // Determine if a given URL is a match and return url data.
  parseUrl: (text: string) => {
    const match = /^https:\/\/twitter\.com\/(#!\/)?(\w+)\/status(es)*\/(\d+)$/.exec(text);

    if (match != null) {
      return {
        id: match[4],
        url: match[0]
      };
    }

    return null;
  },

  type: 'tweet'
};

export const INSERT_TWEET_COMMAND: LexicalCommand<string> = createCommand('INSERT_TWEET_COMMAND');

const TwitterPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valueInput, setValueInput] = useState('');
  const [errorTweet, setErrorTweet] = useState(false);

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

  const handleClick = async (urlText: string) => {
    let trimmedUrl = urlText.includes('status') ? getStatusLink(urlText) : urlText;
    let tweetObj = await TwitterEmbedConfig.parseUrl(trimmedUrl);
    let tweetId = tweetObj && tweetObj?.id ? tweetObj?.id.toString() : '';
    if (tweetId && tweetId.length === 19) {
      editor.registerCommand<string>(
        INSERT_TWEET_COMMAND,
        payload => {
          const tweetNode = $createTweetNode(tweetId);
          $insertNodeToNearestRoot(tweetNode);

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      );
      editor.dispatchCommand(INSERT_TWEET_COMMAND, tweetId);
      setErrorTweet(false);
      setIsModalOpen(false);
      setValueInput('');
    } else {
      setErrorTweet(true);
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setValueInput(value);
  };

  const getStatusLink = (url: string) => {
    const urlText = url.toLowerCase();
    let id;
    const afterStatus = urlText.slice(urlText.indexOf('status/') + 7);
    const beforeStatus = urlText.slice(0, urlText.indexOf('status/'));
    if (afterStatus.includes('/')) {
      id = afterStatus.slice(0, afterStatus.indexOf('/'));
    } else if (afterStatus.includes('?')) {
      id = afterStatus.slice(0, afterStatus.indexOf('?'));
    }
    const result = `${beforeStatus}status/${id}`;
    return result;
  };

  return (
    <>
      <TwitterButton type="text" icon={<TwitterOutlined />} onClick={() => setIsModalOpen(true)}></TwitterButton>
      <Modal
        className="embed-tweet"
        title="Embed Tweet"
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
      >
        <Input
          type="text"
          placeholder="https://twitter.com/jack/status/20"
          value={valueInput}
          onChange={e => handleValueChange(e)}
          status={errorTweet ? 'error' : ''}
        />
        {errorTweet && <p className="error-msg">Tweet url not correct</p>}
        <Button disabled={!valueInput} type="primary" onClick={() => handleClick(valueInput)}>
          Embed
        </Button>
      </Modal>
    </>
  );
};

export default TwitterPlugin;
