import React from 'react';
import { CodeAlt } from '@styled-icons/boxicons-regular/CodeAlt';
import { FormatBold } from '@styled-icons/material/FormatBold';
import { FormatItalic } from '@styled-icons/material/FormatItalic';
import { FormatStrikethrough } from '@styled-icons/material/FormatStrikethrough';
import { FormatUnderlined } from '@styled-icons/material/FormatUnderlined';
import {
  getPluginType,
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MARK_UNDERLINE,
  MarkToolbarButton
} from '@udecode/plate';
import { useMyPlateEditorRef } from './plateTypes';

export const BasicMarkToolbarButtons = () => {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <MarkToolbarButton type={getPluginType(editor, MARK_BOLD)} icon={<FormatBold />} />
      <MarkToolbarButton type={getPluginType(editor, MARK_ITALIC)} icon={<FormatItalic />} />
      <MarkToolbarButton type={getPluginType(editor, MARK_UNDERLINE)} icon={<FormatUnderlined />} />
      <MarkToolbarButton type={getPluginType(editor, MARK_STRIKETHROUGH)} icon={<FormatStrikethrough />} />
      <MarkToolbarButton type={getPluginType(editor, MARK_CODE)} icon={<CodeAlt />} />
    </>
  );
};
