import React, { useState } from 'react';
import { Input, Tag } from 'antd';

const TagInputField = () => {
  //TODO: Intergrate with search box
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = e => {
    setInputValue(e.target.value);
  };

  const handleInputPressEnter = () => {
    const regex = /#(\w+)/g;
    let match;
    const newTags = [];

    while ((match = regex.exec(inputValue))) {
      newTags.push(match[1]);
    }

    if (newTags.length > 0) {
      setTags([...tags, ...newTags]);
    }

    setInputValue('');
  };

  const handleTagClose = removedTag => {
    const updatedTags = tags.filter(tag => tag !== removedTag);
    setTags(updatedTags);
  };

  return (
    <div>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onPressEnter={handleInputPressEnter}
        placeholder="Enter tags (use '#' to add)"
      />
      <div>
        {tags.map(tag => (
          <Tag closable onClose={() => handleTagClose(tag)} key={tag}>
            {tag}
          </Tag>
        ))}
      </div>
    </div>
  );
};

export default TagInputField;
