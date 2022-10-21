import React from 'react';

import CreateOrEditPostComponent from '@components/Posts/CreateOrEditPostComponent';

const EditPost = () => {
  return <CreateOrEditPostComponent isEditPost={true} />;
};

export default EditPost;
