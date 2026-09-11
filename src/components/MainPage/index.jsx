import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import "./MainPage.css";
import Ui from "../Ui";
import Page from "../Page";
import UiToggle from "../UiToggle";
import { createLabelDocument } from "../../labelAst";
import { downloadPdf } from "../../pdfDownload";

const urlPropsQueryConfig = {
  text: "string",
  width: "number",
  height: "number",
  top: "number",
  right: "number",
  bottom: "number",
  left: "number",
  bleed: "number",
  cropmark: "boolean",
  debugBorder: "boolean",
  isUiVisible: "boolean",
  pScale: "number",
  h1Scale: "number",
};

const changeHandlerNames = {
  text: "onChangeText",
  width: "onChangeWidth",
  height: "onChangeHeight",
  top: "onChangeTop",
  right: "onChangeRight",
  bottom: "onChangeBottom",
  left: "onChangeLeft",
  bleed: "onChangeBleed",
  cropmark: "onChangeCropmark",
  debugBorder: "onChangeDebugBorder",
  isUiVisible: "onChangeIsUiVisible",
  pScale: "onChangePScale",
  h1Scale: "onChangeH1Scale",
};

const decodeQueryValue = (value, type) => {
  if (value === null) return undefined;
  if (type === "number") {
    const number = Number(value);
    return Number.isNaN(number) ? undefined : number;
  }
  if (type === "boolean") return value === "1" || value === "true";
  if (/%[0-9a-f]{2}/i.test(value)) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return value;
};

const getUrlProps = (search) => {
  const searchParams = new URLSearchParams(search);

  return Object.fromEntries(
    Object.entries(urlPropsQueryConfig).map(([name, type]) => [
      name,
      decodeQueryValue(searchParams.get(name), type),
    ])
  );
};

class MainPage extends PureComponent {
  static propTypes = {
    // URL props are automatically decoded and passed in based on the config

    text: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
    bleed: PropTypes.number,
    cropmark: PropTypes.bool,
    debugBorder: PropTypes.bool,
    isUiVisible: PropTypes.bool,

    pScale: PropTypes.number,
    h1Scale: PropTypes.number,

    // change handlers are automatically generated when given a config.
    // By default they update that single query parameter and maintain existing
    // values in the other parameters.

    onChangeText: PropTypes.func.isRequired,
    onChangeWidth: PropTypes.func.isRequired,
    onChangeHeight: PropTypes.func.isRequired,
    onChangeTop: PropTypes.func.isRequired,
    onChangeRight: PropTypes.func.isRequired,
    onChangeBottom: PropTypes.func.isRequired,
    onChangeLeft: PropTypes.func.isRequired,
    onChangeBleed: PropTypes.func.isRequired,
    onChangeCropmark: PropTypes.func.isRequired,
    onChangeDebugBorder: PropTypes.func.isRequired,
    onChangeIsUiVisible: PropTypes.func.isRequired,

    onChangePScale: PropTypes.func.isRequired,
    onChangeH1Scale: PropTypes.func.isRequired,
  };

  static defaultProps = {
    text: `# 2001
----
# space odyssey
----
----
2001: A Space Odyssey is a 1968 science fiction film produced and directed by Stanley Kubrick.
`,
    width: 90,
    height: 130,
    top: 3,
    right: 6,
    bottom: 4,
    left: 6,
    bleed: 3,
    cropmark: false,
    debugBorder: false,
    isUiVisible: false,
    pScale: 100,
    h1Scale: 100,
  };

  toggleClickHandler = () => {
    this.props.onChangeIsUiVisible(!this.props.isUiVisible);
  };

  render() {
    const document = createLabelDocument(this.props);

    return (
      <div className="MainPage">
        <div>
          <Page document={document} />
          <UiToggle
            isUiVisible={this.props.isUiVisible}
            toggleClickHandler={this.toggleClickHandler}
          />
          <Ui
            visible={this.props.isUiVisible}
            text={this.props.text}
            width={this.props.width}
            height={this.props.height}
            top={this.props.top}
            right={this.props.right}
            bottom={this.props.bottom}
            left={this.props.left}
            bleed={this.props.bleed}
            cropmark={this.props.cropmark}
            debugBorder={this.props.debugBorder}
            pScale={this.props.pScale}
            h1Scale={this.props.h1Scale}
            changeText={this.props.onChangeText}
            changeWidth={this.props.onChangeWidth}
            changeHeight={this.props.onChangeHeight}
            changeTop={this.props.onChangeTop}
            changeRight={this.props.onChangeRight}
            changeBottom={this.props.onChangeBottom}
            changeLeft={this.props.onChangeLeft}
            changeBleed={this.props.onChangeBleed}
            changeCropmark={this.props.onChangeCropmark}
            changeDebugBorder={this.props.onChangeDebugBorder}
            downloadPdf={() =>
              downloadPdf(
                document,
                `label-${this.props.width}x${this.props.height}mm.pdf`
              )
            }
            changePScale={this.props.onChangePScale}
            changeH1Scale={this.props.onChangeH1Scale}
          />
        </div>
      </div>
    );
  }
}

class UrlConnectedMainPage extends PureComponent {
  state = { search: window.location.search };

  componentDidMount() {
    window.addEventListener("popstate", this.handleLocationChange);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.handleLocationChange);
  }

  handleLocationChange = () => {
    this.setState({ search: window.location.search });
  };

  updateQueryParam = (name, type, value) => {
    const url = new URL(window.location.href);
    const encodedValue = type === "boolean" ? (value ? "1" : "0") : value;

    if (encodedValue === undefined || encodedValue === null) {
      url.searchParams.delete(name);
    } else {
      url.searchParams.set(name, encodedValue);
    }

    window.history.pushState({}, "", url);
    this.handleLocationChange();
  };

  render() {
    const changeHandlers = Object.fromEntries(
      Object.entries(urlPropsQueryConfig).map(([name, type]) => [
        changeHandlerNames[name],
        (value) => this.updateQueryParam(name, type, value),
      ])
    );

    return <MainPage {...getUrlProps(this.state.search)} {...changeHandlers} />;
  }
}

export default UrlConnectedMainPage;
