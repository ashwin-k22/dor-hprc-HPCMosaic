import React, { useState, useEffect, useMemo, useRef } from "react";
import Text from "./Text";
import Select from "./Select";
import Number from "./Number";
import Checkbox from "./Checkbox";
import RadioGroup from "./RadioGroup";
import Picker from "./Picker";
import Uploader from "./Uploader";
import Time from "./Time";
import Module from "./Module";
import Unit from "./Unit";

function Composer(props) {
  const [fields, setFields] = useState([]);

  const [currentValues, setCurrentValues] = useState([]);

  const [conditionFields, setConditionFields] = useState([]);

  // const prevValuesRef = useRef(null);
  function handleUploadedFiles(files, globalFiles) {
    if (props.onFileChange) props.onFileChange(files, globalFiles);
  }

  function handleValueChange(index, value) {
    setCurrentValues((prevValues) => {
      const newChosenValues = [...prevValues];
      newChosenValues[index] = value;
      return newChosenValues;
    });
  }

  function handleSelectValueChange(index, selectedOption) {
    handleValueChange(index, selectedOption.value)
  }

  function showFields() {
    console.log(fields);
  }

  function showConditionFields() {
    console.log(conditionFields);
  }

  function showCurrentValues() {
    console.log(currentValues);
  }

  // useEffect for fields, when changing environment
  useEffect(() => {
    setFields(props.fields);
    const formattedFields = Object.entries(props.fields).map((field) => [
      ...field,
      field[1].hasOwnProperty("condition") ? false : true,
    ]);
    setFields(formattedFields);

    const values = Object.entries(props.fields).map((field) => {
      if (field[1].type === "checkbox") {
        return field[1].checked ? field[1].value : "";
      } else return field[1].value ? field[1].value : "";
    });

    const conditionFields = Object.entries(props.fields)
      .map((field, index) => {
        if (field[1].hasOwnProperty("condition")) {
          return {
            index: index,
            condition: field[1].condition,
          };
        }
      })
      .filter((field) => field !== undefined);

    setConditionFields(conditionFields);

    setCurrentValues(values);
  }, [props.fields]);

  const evaluateCondition = ({ index, condition }) => {
    const evaluateAtomicCondition = (expr) => {
      const [depender, value] = expr.split(".");
      const dependerIndex = fields.findIndex((field) => field[0] === depender);
      const currentValue = currentValues[dependerIndex];
      return currentValue === value;
    };

    const evaluateExpression = (expr) => {

    // Splits expr string into an array of tokens e.g. " (A &&B)  " -> ["(", "A", "&&", "B", "C"]
    const tokens = expr.match(/(\|\||&&|\(|\)|!|\^|[^\s\|\&\(\)]+)/g);
    const valuesStack = [];
    const operatorsStack = [];
	
    // Operators with higher precedence are applied first.
    const precedence = { '||': 1, '&&': 3, '!': 4, '^': 2 };

    const applyOperator = () => {
      const operator = operatorsStack.pop();
      if (operator === '!') {
        const value = valuesStack.pop();
        valuesStack.push(!value);
      } else {
        const right = valuesStack.pop();
        const left = valuesStack.pop();
        if (operator === '&&') {
          valuesStack.push(left && right);
        } else if (operator === '||') {
          valuesStack.push(left || right);
        } else if (operator === '^') {
          valuesStack.push(left ^ right);  
        }
      }
    };

    tokens.forEach(token => {
      if (token === '&&' || token === '||' || token === '^') {
        while (operatorsStack.length && precedence[operatorsStack[operatorsStack.length - 1]] >= precedence[token]) {
          applyOperator();
        }
        operatorsStack.push(token);
      } else if (token === '!') {
  	operatorsStack.push(token);
      } else if (token === '(') {
        operatorsStack.push(token);
      } else if (token === ')') {
        while (operatorsStack.length && operatorsStack[operatorsStack.length - 1] !== '(') {
          applyOperator();
        }
        operatorsStack.pop(); // remove the '('
      } else {
        valuesStack.push(evaluateAtomicCondition(token));
      }
    });

    while (operatorsStack.length) {
      applyOperator();
    }

    return valuesStack[0];
  };

  const isVisible = evaluateExpression(condition.trim());

  if (isVisible) {
    setFields((prevFields) => {
      const newFields = [...prevFields];
      newFields[index][2] = true;
      return newFields;
    });
  } else {
    if (currentValues[index] !== null) {
      setCurrentValues((prevValues) => {
        const newValues = [...prevValues];
        newValues[index] = null;
        return newValues;
      });
    }
    setFields((prevFields) => {
      const newFields = [...prevFields];
      newFields[index][2] = false;
      return newFields;
    });
  }
};

// useEffect for currentValues
useEffect(() => {
  for (const field of conditionFields) {
    evaluateCondition(field);
  }
}, [currentValues]);


  const toggleVisibility = (index) => {
    setFields((prevFields) => {
      const newFields = [...prevFields];
      newFields[index][2] = !newFields[index][2];
      return newFields;
    });
  };

  // TODO: Use React.createElement and map for types instead of JSX for dynamic components
  const renderer = (fields) => {
    if (fields === undefined) {
      return;
    }
    const fieldList = [];
    for (const [index, [key, value, toggle]] of fields.entries()) {
      const { type, condition, ...attributes } = value;
      if (type === "text") {
        fieldList.push(
          toggle && (
            <Text
              key={index}
              index={index}
              {...attributes}
              onChange={handleValueChange}
            />
          )
        );
      } else if (type === "select") {
        fieldList.push(
          toggle && (
            <Select
              key={index}
              index={index}
              {...attributes}
              onChange={handleSelectValueChange}
            />
          )
        );
      } else if (type === "number") {
        fieldList.push(
          toggle && (
            <Number
              key={index}
              index={index}
              {...attributes}
              onChange={handleValueChange}
            />
          )
        );
      } else if (type === "checkbox") {
        fieldList.push(
          toggle && (
            <Checkbox
              key={index}
              index={index}
              {...attributes}
              onChange={handleValueChange}
            />
          )
        );
      } else if (type === "radioGroup") {
        fieldList.push(
          toggle && (
            <RadioGroup
              key={index}
              index={index}
              {...attributes}
              onChange={handleValueChange}
            />
          )
        );
      } else if (type === "picker") {
        fieldList.push(
          toggle && (
            <Picker
              key={index}
              index={index}
              {...attributes}
              onChange={handleValueChange}
            />
          )
        );
      } else if (type === "uploader") {
        fieldList.push(
          toggle && (
            <Uploader
              key={index}
              index={index}
              {...attributes}
              onChange={handleUploadedFiles}
            />
          )
        );
      } else if (type === "time") {
        fieldList.push(
          toggle && (
            <Time
              key={index}
              index={index}
              {...attributes}
              onChange={handleValueChange}
            />
          )
        );
      } else if (type === "module") {
        fieldList.push(
          toggle && (
            <Module
              key={index}
              index={index}
              {...attributes}
              onChange={handleValueChange}
            />
          )
        );
      } else if (type === "unit") {
        fieldList.push(
          toggle && (
            <Unit
              key={index}
              index={index}
              {...attributes}
              onChange={handleValueChange}
            />
          )
        );
      } else {
        fieldList.push(
          <p key={index}>
            {key} : {type}
          </p>
        );
      }
    }
    return fieldList;
  };

  const memoizedComponent = useMemo(() => {
    return renderer(fields);
  }, [fields]);

  return <div>{memoizedComponent}</div>;
}

export default Composer;
