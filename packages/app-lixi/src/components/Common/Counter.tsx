import { useEffect, useState } from 'react';
import styled from 'styled-components';

export const GridDiv = styled.div`
  .count {
    cursor: pointer;
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
      setTimeout(() => setAnimationCounter('waitDown'), 100); //counterStates == 'counterSuccess.type' ? 'waitDown' : 'reverted'
      setTimeout(() => setAnimationCounter('initial'), 200);
    }
  });

  return (
    <GridDiv className="grid">
      <div className="count">
        <span className={animationCounter}>{count}</span>
      </div>
    </GridDiv>
  );
};
