import React, { useEffect, useRef, useState } from 'react';

export const generateRedditEmbedUrl = (url: string): string => {
  if (url.length === 0) return url;

  const postUrl = new URL(url);
  const embedUrl = new URL(postUrl.pathname, 'https://www.redditmedia.com');

  const searchParams = embedUrl.searchParams;
  searchParams.set('ref_source', 'embed');
  searchParams.set('embed', 'true');
  searchParams.set('theme', 'dark');

  embedUrl.search = searchParams.toString();

  return embedUrl.toString();
};

export interface RedditPostEmbedProps {
  url: string;
  options?: Record<string, any>;
  placeholder?: string | React.ReactNode;
  onLoad?: (element: any) => void;
  onError?: () => void;
}

export const RedditEmbed: React.FC<RedditPostEmbedProps> = props => {
  const { url } = props;

  const ref = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const embedUrl = generateRedditEmbedUrl(props.url);
  const postUrl = props.url.slice(0, props.url.lastIndexOf('/'));

  useEffect(() => {
    const controller = loadPost(props);

    return () => {
      controller.abort();
    };
  }, [url]);

  const loadPost = (props): AbortController => {
    setLoading(true);
    setError(false);
    const abortController = new AbortController();

    fetch(`${postUrl}.json`, { signal: abortController.signal })
      .then(res => {
        if (res.status < 300) {
          setTimeout(() => {
            if (ref?.current?.innerHTML) {
              props.onLoad(ref.current.innerHTML);
            }
          }, 500);
        } else {
          setError(true);
          props.onError && props.onError();
        }
      })
      .catch(error => {
        setError(true);
        props.onError && props.onError();
      })
      .finally(() => {
        setLoading(false);
      });

    return abortController;
  };

  return (
    <React.Fragment>
      {loading && <React.Fragment>{props.placeholder}</React.Fragment>}
      {error && <React.Fragment>Could not load post!</React.Fragment>}
      {!loading && !error && (
        <div ref={ref}>
          <iframe
            id="reddit-embed"
            title="Reddit preview"
            src={embedUrl}
            sandbox="allow-scripts allow-same-origin allow-popups"
            style={{ border: 'none' }}
            width="100%"
            height="560"
            scrolling="yes"
            loading="lazy"
          />
        </div>
      )}
    </React.Fragment>
  );
};
