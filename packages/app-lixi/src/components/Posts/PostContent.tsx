import React, { useEffect, useMemo } from 'react';
import parse from 'html-react-parser';
import ReactDomServer from 'react-dom/server';
import intl from 'react-intl-universal';
import { ReadMoreMore } from 'read-more-more';
import ReactHtmlParser from 'react-html-parser';
import { Language } from '@bcpros/lixi-models/constants/translation';

const PostContent = ({ post, showTranslation, currentLocale }) => {
  let iFrameEmbed = null;

  const postContent: string = useMemo(() => {
    if (post?.originalLanguage === 'en' || post?.originalLanguage === 'vi') {
      return post?.translations && post?.translations.length > 0 && showTranslation
        ? post.translations[0].translateContent
        : post.content;
    } else {
      return post?.translations && post?.translations.length > 0 && showTranslation
        ? currentLocale === 'en'
          ? post.translations[Language.en].translateContent
          : post.translations[Language.vi]?.translateContent || post.translations[Language.en].translateContent //old post dont have vi trans will translate => en
        : post.content;
    }
  }, [showTranslation, currentLocale]);

  const content: any = useMemo(() => {
    return parse(postContent, {
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
              {domNode.children.map(child => child.data)}
            </span>
          );
        }
      }
    });
  }, [postContent]);

  const handleContentEmbed = useMemo(() => {
    let staticMarkupContent = ReactDomServer.renderToStaticMarkup(content);
    const postScore = post?.danaBurnScore;
    if (staticMarkupContent.includes('iframe') && postScore >= 50) {
      let indexOfIframe = staticMarkupContent.indexOf('<div data-lexical-decorator="true" contenteditable="false">');
      let contentText = staticMarkupContent.slice(0, indexOfIframe) || null;
      let iframe = staticMarkupContent.slice(indexOfIframe) || null;
      iFrameEmbed = iframe;
      if (iframe.includes('EditorLexical_paragraph')) {
        let indexOfSecondPara = iframe.indexOf('<p class="EditorLexical_paragraph');
        iFrameEmbed = iframe.slice(0, indexOfSecondPara);
      }
      staticMarkupContent = contentText;
    }
    return staticMarkupContent;
  }, [content]);

  const lineContentShow = useMemo(() => {
    let lineNum = 3.5;
    const postScore = post?.danaBurnScore;
    if (postScore < 10) {
      if (postScore >= 1 && postScore < 2) {
        lineNum = 4.5;
      } else if (postScore >= 2 && postScore < 5) {
        lineNum = 5;
      } else if (postScore >= 5 && postScore < 10) {
        lineNum = 6;
      }
    } else if (postScore >= 10) {
      let n1 = 10,
        n2 = 10,
        next = 0;
      lineNum = 6;

      while (postScore >= n2 && lineNum < 21) {
        lineNum++;
        next = n1 + n2;
        n1 = n2;
        n2 = next;
      }
    }
    return lineNum;
  }, [post?.danaBurnScore]);

  return (
    <div className="read-more">
      <ReadMoreMore
        id="readMore"
        linesToShow={lineContentShow + lineContentShow * 0.1} //default lineHeight of Readmoremore is 1 but we custom lineHeight is 1.1
        parseHtml
        text={handleContentEmbed}
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
