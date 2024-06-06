import { useState } from "react";
import Autosuggest from 'react-autosuggest';


const PlayerInput = ({ suggestions, onInputChange, onSuggestionSelected, onSuggestionsFetchRequested, disabled, }) => {
    const [inputValue, setInputValue] = useState('');
  
  const onInputChangeHandler = (event, { newValue }) => {
      setInputValue(newValue);
      onInputChange(newValue);
    };
  
  const onSuggestionSelectedHandler = (event, { suggestion }) => {
      onSuggestionSelected(suggestion);
    };
  
    const inputProps = {
      placeholder: '',
      value: inputValue,
        onChange: onInputChangeHandler,
      disabled: disabled
    };
  
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionSelected={onSuggestionSelectedHandler}
        getSuggestionValue={(suggestion) => suggestion.name}
        renderSuggestion={(suggestion) => <div>{suggestion.name}</div>}
        inputProps={inputProps}
      />
    );
  };
  
  export default PlayerInput;