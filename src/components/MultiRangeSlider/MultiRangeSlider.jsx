import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Wrapper,
  InputWrapper,
  ControlWrapper,
  Input,
  Rail,
  InnerRail,
  Control,
  Values,
} from "./MultiRangeSliderStyles";

const MultiRangeSlider = ({ min, max, value, step, onChange }) => {
  const [minValue, setMinValue] = useState(value ? value.min : min);
  const [maxValue, setMaxValue] = useState(value ? value.max : max);

  useEffect(() => {
    if (value) {
      setMinValue(value.min);
      setMaxValue(value.max);
    }
  }, [value]);

  const handleMinChange = (e) => {
    e.preventDefault();
    const newMinVal = Math.min(+e.target.value, maxValue - step);
    if (!value) setMinValue(newMinVal);
    onChange({ min: newMinVal, max: maxValue });
  };

  const handleMaxChange = (e) => {
    e.preventDefault();
    const newMaxVal = Math.max(+e.target.value, minValue + step);
    if (!value) setMaxValue(newMaxVal);
    onChange({ min: minValue, max: newMaxVal });
  };

  const minPos = ((minValue - min) / (max - min)) * 100;
  const maxPos = ((maxValue - min) / (max - min)) * 100;

  return (
    <Wrapper>
      <InputWrapper>
        <Input
          type="range"
          value={minValue}
          min={min}
          max={max}
          step={step}
          onChange={handleMinChange}
        />
        <Input
          type="range"
          value={maxValue}
          min={min}
          max={max}
          step={step}
          onChange={handleMaxChange}
        />
      </InputWrapper>

      <ControlWrapper>
        <Control style={{ left: `${minPos}%` }} />
        <Rail>
          <InnerRail
            style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}
          />
        </Rail>
        <Control style={{ left: `${maxPos}%` }} />
        <Values>
          <div className="slider__left-value">{minValue}</div>
          <div className="slider__right-value">{maxValue}</div>
        </Values>
      </ControlWrapper>
    </Wrapper>
  );
};

MultiRangeSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default MultiRangeSlider;
