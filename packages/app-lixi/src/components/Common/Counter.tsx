import { useEffect, useState } from 'react';
import styled from 'styled-components';

export const GridDiv = styled.div`
  .Count {
    cursor: pointer;
  }
  .Count .goUp {
    display: inline-flex;
    opacity: 0;
    transform: translate3d(0, -20px, 0);
    transition: 0.1s ease-in-out;
  }
  .Count .waitDown {
    display: inline-flex;
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  .Count .initial {
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
      setTimeout(() => setAnimationCounter('waitDown'), 100);
      setTimeout(() => setAnimationCounter('initial'), 200);
    }
  });

  return (
    <GridDiv className="Grid">
      <div className="Count">
        <span className={animationCounter}>{count}</span>
      </div>
    </GridDiv>
  );
};
