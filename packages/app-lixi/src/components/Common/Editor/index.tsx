import React, { useState } from 'react';
import {
  Plate,
  PlateProvider,
  usePlateEditorState,
  getEventPlateId,
  useEventPlateId,
  usePlateSelectors
} from '@udecode/plate';
import { basicElementsPlugins } from './basic-elements/basicElementsPlugins';
import { BasicMarkToolbarButtons } from './basic-marks/BasicMarkToolbarButtons';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';
import { serializeHtml, useEditorState, SerializeHtml } from '@udecode/plate';
import { imagePlugins } from './media/imagePlugins';
import { formatHTML } from './serializing-html/formatHTML';
import { Button } from 'antd';

const plugins = createMyPlugins([...basicElementsPlugins, ...imagePlugins], {
  components: plateUI
});

const Editor = props => {
  const [value, setValue] = useState<string | null>(null);

  const handleCreateClick = () => {
    props.onSubmitPost(value);
  };

  const handleTextChange = value => {
    setValue(value);
  };

  const Serialized = () => {
    //Will create useLayoutEffect warning
    //Wait for Plate update to fix the problem
    const editor = useEditorState();
    const html = serializeHtml(editor, {
      nodes: editor.children
    });

    setValue(formatHTML(html));
    return <></>;
  };

  return (
    <>
      <PlateProvider<MyValue> plugins={plugins}>
        <Toolbar>
          <BasicMarkToolbarButtons />
        </Toolbar>

        <Plate<MyValue> editableProps={editableProps}>
          <Serialized />
        </Plate>
      </PlateProvider>

      <Button type="primary" className="outline-btn" onClick={() => handleCreateClick()} style={{ marginTop: '70px' }}>
        Create Post
      </Button>
    </>
  );
};

export default Editor;
