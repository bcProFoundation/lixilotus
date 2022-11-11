import React from 'react';
import { FormatItalic } from '@styled-icons/material/FormatItalic';
import { FormatStrikethrough } from '@styled-icons/material/FormatStrikethrough';
import {
  getPluginType,
  MARK_ITALIC,
  MARK_STRIKETHROUGH,
  MarkToolbarButton,
  ListToolbarButton,
  ELEMENT_UL,
  ELEMENT_OL,
  LinkToolbarButton
} from '@udecode/plate';
import { useMyPlateEditorRef } from './plateTypes';
import { FormatListBulleted, FormatListNumbered, Link } from 'styled-icons/material';

export const BasicMarkToolbarButtons = () => {
  const editor = useMyPlateEditorRef();

  return (
    <>
      <MarkToolbarButton type={getPluginType(editor, MARK_ITALIC)} icon={<FormatItalic />} />
      <MarkToolbarButton type={getPluginType(editor, MARK_STRIKETHROUGH)} icon={<FormatStrikethrough />} />
      <ListToolbarButton type={getPluginType(editor, ELEMENT_UL)} icon={<FormatListBulleted />} />
      <ListToolbarButton type={getPluginType(editor, ELEMENT_OL)} icon={<FormatListNumbered />} />
      <LinkToolbarButton icon={<Link />} />
    </>
  );
};
