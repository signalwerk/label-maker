import React from "react";
import PropTypes from "prop-types";
import "./UiToggle.css";

const UiToggle = (props) => {
  const { isUiVisible, toggleClickHandler } = props;
  const toggleValue = (bool) => {
    if (!bool) return `cog uiToggle`;
    return `cross uiToggle`;
  };
  return (
    <input
      type="button"
      className={toggleValue(isUiVisible)}
      value={""}
      onClick={toggleClickHandler}
    />
  );
};

UiToggle.propTypes = {
  isUiVisible: PropTypes.bool.isRequired,
  toggleClickHandler: PropTypes.func.isRequired,
};

export default UiToggle;
