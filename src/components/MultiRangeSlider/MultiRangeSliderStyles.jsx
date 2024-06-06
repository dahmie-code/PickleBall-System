import styled from "styled-components";

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin: 4px calc(16px / 2) 10px;
  height: calc(10px + 1.6rem);

  @media screen and (max-width: 760px) {
    width: 200px;
  }
`;

const InputWrapper = styled.div`
  width: calc(100% + 16px);
  margin: 0 calc(16px / -2);
  position: absolute;
  height: 16px;
`;

const ControlWrapper = styled.div`
  width: 100%;
  position: absolute;
  height: 16px;
`;

const Input = styled.input`
  position: absolute;
  width: 100%;
  pointer-events: none;
  appearance: none;
  height: 100%;
  opacity: 0;
  z-index: 3;
  padding: 0;

  &::-ms-track {
    appearance: none;
    background: transparent;
    border: transparent;
  }

  &::-moz-range-track {
    appearance: none;
    background: transparent;
    border: transparent;
  }

  &:focus::-webkit-slider-runnable-track {
    appearance: none;
    background: transparent;
    border: transparent;
  }

  &::-ms-thumb {
    appearance: none;
    pointer-events: all;
    width: 16px;
    height: 16px;
    border-radius: 0;
    border: 0 none;
    cursor: grab;
  }

  &::-ms-thumb:active {
    cursor: grabbing;
  }

  &::-moz-range-thumb {
    appearance: none;
    pointer-events: all;
    width: 16px;
    height: 16px;
    border-radius: 0;
    border: 0 none;
    cursor: grab;
  }

  &::-moz-range-thumb:active {
    cursor: grabbing;
  }

  &::-webkit-slider-thumb {
    appearance: none;
    pointer-events: all;
    width: 16px;
    height: 16px;
    border-radius: 0;
    border: 0 none;
    cursor: grab;
  }

  &::-webkit-slider-thumb:active {
    cursor: grabbing;
  }
`;

const Rail = styled.div`
  position: absolute;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
  height: 3px;
  border-radius: 3px;
  background: lightgrey;
`;

const InnerRail = styled.div`
  position: absolute;
  height: 100%;
  background: #006ca5;
  opacity: 0.5;
`;

const Control = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  position: absolute;
  background: #006ca5;
  top: 50%;
  margin-left: calc(16px / -2);
  transform: translate3d(0, -50%, 0);
  z-index: 2;
`;

const Values = styled.div`
  .slider__left-value,
  .slider__right-value {
    color: black;
    font-size: 12px;
    margin-top: 20px;
    position: absolute;
  }
  

  .slider__left-value {
    left: 6px;
  }

  .slider__right-value {
    right: -4px;
  }

  @media screen and (max-width: 760px) {
    .slider__left-value,
    .slider__right-value {
      color: white;
    }
  }
`;

export {
  Wrapper,
  InputWrapper,
  ControlWrapper,
  Input,
  Rail,
  InnerRail,
  Control,
  Values,
};
