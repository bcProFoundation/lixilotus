/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { $isAutoLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND, LinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  GridSelection,
  KEY_ESCAPE_COMMAND,
  LexicalEditor,
  NodeSelection,
  RangeSelection,
  SELECTION_CHANGE_COMMAND
} from 'lexical';
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { getSelectedNode } from '../../utils/getSelectedNode';
import { setFloatingElemPosition } from '../../utils/setFloatingElemPosition';
import { sanitizeUrl } from '../../utils/url';
import styled from 'styled-components';
import { Button } from 'antd';
import { CheckOutlined, EditOutlined } from '@ant-design/icons';

import { useAppSelector } from '@store/hooks';
import { getCurrentThemes } from '@store/settings/selectors';
import { get } from 'lodash';
import { current } from '@reduxjs/toolkit';

const StyledFloating = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  max-width: 400px;
  width: 100%;
  opacity: 0;
  background-color: #fff;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  transition: opacity 0.5s;
  will-change: transform;
  padding: 8px;

  .link-input {
    display: flex;
    justify-content: space-between;
    background: var(--bg-color-light-theme);
    align-items: center;
    border-radius: 8px;
    padding: 4px 8px;
    font-size: 15px;
    button {
      span {
        font-size: 22px;
      }
      &:hover {
        span {
          color: var(--color-primary);
        }
      }
    }
    input {
      flex-grow: 1;
    }
  }
`;

function FloatingLinkEditor({
  editor,
  isLink,
  setIsLink,
  anchorElem
}: {
  editor: LexicalEditor;
  isLink: boolean;
  setIsLink: Dispatch<boolean>;
  anchorElem: HTMLElement;
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isEditMode, setEditMode] = useState(false);
  const [lastSelection, setLastSelection] = useState<RangeSelection | GridSelection | NodeSelection | null>(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl('');
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode) &&
      editor.isEditable()
    ) {
      const domRange = nativeSelection.getRangeAt(0);
      let rect;
      if (nativeSelection.anchorNode === rootElement) {
        let inner = rootElement;
        while (inner.firstElementChild != null) {
          inner = inner.firstElementChild as HTMLElement;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange.getBoundingClientRect();
      }

      setFloatingElemPosition(rect, editorElem, anchorElem);
      setLastSelection(selection);
    } else if (
      !activeElement ||
      (activeElement.className !== 'link-input' &&
      activeElement.className !== 'link-input-dark')
    ) {
      if (rootElement !== null) {
        setFloatingElemPosition(null, editorElem, anchorElem);
      }
      setLastSelection(null);
      setEditMode(false);
      setLinkUrl('');
    }

    return true;
  }, [anchorElem, editor]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateLinkEditor();
      });
    };

    window.addEventListener('resize', update);

    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update);
    }

    return () => {
      window.removeEventListener('resize', update);

      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update);
      }
    };
  }, [anchorElem.parentElement, editor, updateLinkEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (isLink) {
            setIsLink(false);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
  }, [editor, updateLinkEditor, setIsLink, isLink]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  const createNodeLink = (linkUrl: string, editor: LexicalEditor) => {
    if (linkUrl !== '') {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(linkUrl));
      editor.registerNodeTransform(LinkNode, linkNode => {
        if (linkNode.getTarget() == null) {
          linkNode.setTarget('_blank');
        }
      });
    }
    editorRef.current.style.display = 'none';
  };

  const currentTheme = useAppSelector(getCurrentThemes);
  const linkInputClassName = currentTheme ? 'link-input-dark' : 'link-input';
  const styledFloatingClassName = currentTheme ? 'StyledFloatingDark' : 'StyledFloating';

  return (
    <StyledFloating className={styledFloatingClassName} ref={editorRef}>
      <div className={linkInputClassName}>
        <input
          ref={inputRef}
          onChange={event => {
            setLinkUrl(event.target.value);
          }}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              if (lastSelection !== null) {
                createNodeLink(linkUrl, editor);
              }
            }
          }}
        />
        <Button
          type="text"
          icon={<CheckOutlined />}
          onMouseDown={event => event.preventDefault()}
          onClick={() => {
            if (lastSelection !== null) {
              createNodeLink(linkUrl, editor);
            }
          }}
        />
      </div>
    </StyledFloating>
  );
}

function useFloatingLinkEditorToolbar(editor: LexicalEditor, anchorElem: HTMLElement): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const linkParent = $findMatchingParent(node, $isLinkNode);
      const autoLinkParent = $findMatchingParent(node, $isAutoLinkNode);

      // We don't want this menu to open for auto links.
      if (linkParent != null && autoLinkParent == null) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar]);

  return isLink
    ? createPortal(
        <FloatingLinkEditor editor={activeEditor} isLink={isLink} anchorElem={anchorElem} setIsLink={setIsLink} />,
        anchorElem
      )
    : null;
}

export default function FloatingLinkEditorPlugin({
  anchorElem = document.body
}: {
  anchorElem?: HTMLElement;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditorToolbar(editor, anchorElem);
}
