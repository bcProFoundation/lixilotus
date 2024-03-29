import React from 'react';
import parse from 'html-react-parser';
import ReactDomServer from 'react-dom/server';
import intl from 'react-intl-universal';
import { ReadMoreMore } from 'read-more-more';

const PostTranslate = ({ postTranslate }) => {
  const content: any = parse(postTranslate, {
    replace: (domNode: any) => {
      if (domNode?.attribs && domNode?.attribs?.class === 'EditorLexical_hashtag') {
        const hashtag: string = domNode?.children[0]?.data;
        return (
          <span
            rel="noopener noreferrer"
            className="hashtag-link"
            id={`${hashtag}`}
            style={{ color: 'var(--color-primary)' }}
          >
            {domNode?.children.map(child => child?.data)}
          </span>
        );
      }
    }
  });

  const handleContentEmbed = () => {
    let staticMarkupContent = ReactDomServer.renderToStaticMarkup(content);
    if (staticMarkupContent.includes('iframe')) {
      let newContent = staticMarkupContent.split('<div data-lexical-decorator="true" contenteditable="false">');
      let contentText = newContent[0] || null;
      staticMarkupContent = contentText;
    }
    return staticMarkupContent;
  };

  return (
    <div className="read-more">
      <ReadMoreMore
        id="readMore"
        linesToShow={10000}
        parseHtml
        text={handleContentEmbed()}
        checkFor={10000}
        transDuration={0}
        readMoreText={intl.get('general.showMore')}
        readLessText={' '}
        btnStyles={{ color: 'var(--color-primary)' }}
      />
    </div>
  );
};

export default React.memo(PostTranslate);
