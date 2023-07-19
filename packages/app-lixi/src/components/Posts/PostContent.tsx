import React from 'react';
import parse from 'html-react-parser';
import ReactDomServer from 'react-dom/server';
import intl from 'react-intl-universal';
import { ReadMoreMore } from 'read-more-more';

const PostContent = ({ post }) => {
  const postContent = post?.content;

  const calculateLineShow = () => {
    let lineNum = 6.5;
    const postScore = post?.lotusBurnScore;
    if (postScore >= 50) {
      lineNum = 11;
    } else if (postScore >= 200) {
      lineNum = 17.5;
    }
    return lineNum;
  };

  const content: any = parse(postContent, {
    replace: (domNode: any) => {
      if (domNode.attribs && domNode.attribs.class === 'EditorLexical_hashtag') {
        const hashtag: string = domNode.children[0].data;
        return (
          <span
            rel="noopener noreferrer"
            className="hashtag-link"
            id={`${hashtag}`}
            style={{ color: 'var(--color-primary)' }}
          >
            {domNode.children.map(child => child.data)}
          </span>
        );
      }
    }
  });

  return (
    <div className="read-more">
      <ReadMoreMore
        id="readMore"
        linesToShow={calculateLineShow()}
        parseHtml
        text={ReactDomServer.renderToStaticMarkup(content)}
        checkFor={1000}
        transDuration={0}
        readMoreText={intl.get('general.showMore')}
        readLessText={' '}
        btnStyles={{ color: 'var(--color-primary)', pointerEvents: 'none' }}
      />
    </div>
  );
};

export default React.memo(PostContent);
