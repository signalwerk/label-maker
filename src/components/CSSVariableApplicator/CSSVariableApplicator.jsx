import React, { Component } from "react";

class CSSVariableApplicator extends Component {
  componentDidMount() {
    this.updateCSSVariables(this.props.variables);
  }

  componentDidUpdate(prevProps) {
    if (this.props.variables !== prevProps.variables) {
      this.updateCSSVariables(this.props.variables);
    }
  }
  updateCSSVariables(variables) {
    console.log("updateCSSVariables", variables);

    Object.keys(variables).forEach(function(key) {
      document.documentElement.style.setProperty(key, variables[key]);
    });
  }
  render() {
    return <div>{this.props.children}</div>;
  }
}

export default CSSVariableApplicator;
