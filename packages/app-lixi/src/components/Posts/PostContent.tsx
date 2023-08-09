import React from 'react';
import parse from 'html-react-parser';
import ReactDomServer from 'react-dom/server';
import intl from 'react-intl-universal';
import { ReadMoreMore } from 'read-more-more';
import ReactHtmlParser from 'react-html-parser';

const PostContent = ({ post }) => {
  const postContent = post?.content;
  let iFrameEmbed = null;

  const calculateLineShow = () => {
    let lineNum = 5.5;
    const postScore = post?.danaBurnScore;
    if (postScore >= 50 && postScore < 200) {
      lineNum = 11;
    } else if (postScore >= 200) {
      lineNum = 16.5;
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

  const handleContentEmbed = () => {
    let staticMarkupContent = ReactDomServer.renderToStaticMarkup(content);
    const postScore = post?.danaBurnScore;
    if (staticMarkupContent.includes('iframe') && postScore >= 50) {
      let newContent = staticMarkupContent.split('<div data-lexical-decorator="true" contenteditable="false">');
      let contentText = newContent[0] || null;
      let iframeEmbed = newContent[1] || null;
      iFrameEmbed = iframeEmbed;
      staticMarkupContent = contentText;
    }
    return staticMarkupContent;
  };

  return (
    <div className="read-more">
      <ReadMoreMore
        id="readMore"
        linesToShow={calculateLineShow()}
        parseHtml
        text={handleContentEmbed()}
        checkFor={1000}
        transDuration={0}
        readMoreText={intl.get('general.showMore')}
        readLessText={' '}
        btnStyles={{ color: 'var(--color-primary)', pointerEvents: 'none' }}
      />
      {iFrameEmbed && ReactHtmlParser(iFrameEmbed)}
    </div>
  );
};

export default React.memo(PostContent);
