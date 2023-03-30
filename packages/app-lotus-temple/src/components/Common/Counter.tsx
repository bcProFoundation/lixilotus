import { useEffect, useState } from 'react';
import styled from 'styled-components';

export const GridDiv = styled.div`
  .count {
    cursor: pointer;
    color: rgba(30, 26, 29, 0.6);
  }
  .count .goUp {
    display: inline-flex;
    opacity: 0;
    transform: translate3d(0, -20px, 0);
    transition: 0.1s ease-in-out;
  }
  .count .waitDown {
    display: inline-flex;
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  .count .reverted {
    display: inline-flex;
    opacity: 0;
    transform: translate3d(0, -20px, 0);
    transition: 0.1s ease-in-out;
  }
  .count .initial {
    display: inline-flex;
    opacity: 1;
    transform: translate3d(0, 0px, 0);
    transition: 0.1s ease-in-out;
  }
`;

type CounterProps = {
  num: number;
};

export const Counter = (props: CounterProps) => {
  const [count, setCount] = useState(props.num);
  const [animationCounter, setAnimationCounter] = useState('initial');

  useEffect(() => {
    if (props.num != count) {
      setTimeout(() => setAnimationCounter('goUp'), 0);
      setTimeout(() => setCount(props.num), 100);
      setTimeout(() => setAnimationCounter(count < props.num ? 'waitDown' : 'reverted'), 100);
      setTimeout(() => setAnimationCounter('initial'), 200);
    }
  });

  return (
    <GridDiv className="grid">
      <div className="count">
        <span style={{ fontSize: '16px' }} className={animationCounter}>
          {count}
        </span>
        {count > 0 && (
          <>
            &nbsp;
            <span style={{ fontSize: '10px' }}>XPI</span>
          </>
        )}
      </div>
    </GridDiv>
  );
};
