import React, { useEffect, useRef, useState } from 'react';

const URLFB = 'https://www.facebook.com';

export interface FacebookPostEmbedProps {
  url: string;
  options?: Record<string, any>;
  placeholder?: string | React.ReactNode;
  onLoad?: (element: any) => void;
  onError?: () => void;
}

export const FacebookEmbed: React.FC<FacebookPostEmbedProps> = props => {
  const { url } = props;

  const ref = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [embedSrc, setEmbedSrc] = useState('');
  const postUrl = props.url.slice(0, props.url.lastIndexOf('/'));

  useEffect(() => {
    loadPost(props);
  }, [url]);

  const loadPost = props => {
    setLoading(true);
    setError(false);
    if (props?.url && props.url.includes(URLFB)) {
      const arrUrl = props.url.split(' ');
      const src = arrUrl.find(item => item.includes('src'));
      if (src) {
        setEmbedSrc(src.slice(5, -1));
        setTimeout(() => {
          if (ref?.current?.innerHTML) {
            props.onLoad(ref.current.innerHTML);
          }
        }, 500);
      }
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      {loading && <React.Fragment>{props.placeholder}</React.Fragment>}
      {error && <React.Fragment>Could not load post!</React.Fragment>}
      {!loading && !error && (
        <div ref={ref}>
          <iframe
            id="facebook-embed"
            title="Reddit preview"
            src={embedSrc}
            width="100%"
            height="650"
            style={{ border: 'none' }}
            scrolling="yes"
            sandbox="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            loading="lazy"
          />
        </div>
      )}
    </React.Fragment>
  );
};
