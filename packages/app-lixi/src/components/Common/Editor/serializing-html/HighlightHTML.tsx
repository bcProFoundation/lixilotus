import React from 'react';
import { formatHTML } from './formatHTML';

// TODO: Will remove in later editor's update
export const HighlightHTML = ({ code }: { code: string }) => (
  <div>
    {/* {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre className={className} style={style}>
        {tokens.map((line, i) => (
          <div key={i} {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({ token, key })} />
            ))}
          </div>
        ))}
      </pre>
    )} */}
    {formatHTML(code)}
  </div>
);
