import React from 'react';
import { FormatQuote } from '@styled-icons/material/FormatQuote';
import { BlockToolbarButton, ELEMENT_BLOCKQUOTE, getPluginType, useEventPlateId } from '@udecode/plate';
import { useMyPlateEditorRef } from './plateTypes';

export const BasicElementToolbarButtons = () => {
  const editor = useMyPlateEditorRef(useEventPlateId());

  return (
    <>
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_BLOCKQUOTE)} icon={<FormatQuote />} />
    </>
  );
};
