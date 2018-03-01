import React, { PureComponent } from "react";
import { addUrlProps, UrlQueryParamTypes } from "react-url-query";
import PropTypes from "prop-types";
import styles from "./MainPage.scss";
import Textlayer from "../Textlayer/Textlayer";
import Ui from "../Ui/Ui";
import Page from "../Page/Page";
import CSSVariableApplicator from "../CSSVariableApplicator/CSSVariableApplicator";
import UiToggle from "../UiToggle/UiToggle";

const urlPropsQueryConfig = {
  text: { type: UrlQueryParamTypes.string },
  width: { type: UrlQueryParamTypes.number },
  height: { type: UrlQueryParamTypes.number },
  top: { type: UrlQueryParamTypes.number },
  right: { type: UrlQueryParamTypes.number },
  bottom: { type: UrlQueryParamTypes.number },
  left: { type: UrlQueryParamTypes.number },
  bleed: { type: UrlQueryParamTypes.number },
  printscale: { type: UrlQueryParamTypes.number },
  cropmark: { type: UrlQueryParamTypes.boolean },
  isUiVisible: { type: UrlQueryParamTypes.boolean }
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
    printscale: PropTypes.number,
    cropmark: PropTypes.bool,
    isUiVisible: PropTypes.bool,

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
    onChangePrintscale: PropTypes.func.isRequired,
    onChangeIsUiVisible: PropTypes.func.isRequired
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
    printscale: 100,
    cropmark: true,
    isUiVisible: false
  };
  constructor() {
    super();

    const body = document.getElementsByTagName("body")[0];

    // onChangeWidth = width => {
    //   this.props.onChangeWidth(width);
    // };
    // onChangeHeight = height => {
    //   this.props.onChangeHeight(height);
    // };
    // onChangeTop = top => {
    //   this.props.onChangeTop(top);
    // };
    // onChangeRight = right => {
    //   this.props.onChangeRight(right);
    // };
    // onChangeBottom = bottom => {
    //   this.props.onChangeBottom(bottom);
    // };
    // onChangeLeft = left => {
    //   this.props.onChangeLeft(left);
    // };
    // onChangeBleed = bleed => {
    //   this.props.onChangeBleed(bleed);
    // };
    // onChangeCropmark = cropmark => {
    //   this.props.onChangeCropmark(cropmark);
    // };
  }

  toggleClickHandler = () => {
    this.props.onChangeIsUiVisible(!this.props.isUiVisible);
  };

  render() {
    return (
      <div className={`${styles.MainPage} ${this.props.style}`}>
        <div className={styles.visual}>
          <CSSVariableApplicator
            variables={{
              "--width": this.props.width,
              "--height": this.props.height,
              "--design-grid-top": this.props.top,
              "--design-grid-right": this.props.right,
              "--design-grid-bottom": this.props.bottom,
              "--design-grid-left": this.props.left,
              "--printscale": this.props.printscale / 100
            }}
          />

          <Page text={this.props.text} />
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
            printscale={this.props.printscale}
            cropmark={this.props.cropmark}
            changeText={this.props.onChangeText}
            changeWidth={this.props.onChangeWidth}
            changeHeight={this.props.onChangeHeight}
            changeTop={this.props.onChangeTop}
            changeRight={this.props.onChangeRight}
            changeBottom={this.props.onChangeBottom}
            changeLeft={this.props.onChangeLeft}
            changeBleed={this.props.onChangeBleed}
            changePrintscale={this.props.onChangePrintscale}
            changeCropmark={this.props.onChangeCropmark}
          />
        </div>
      </div>
    );
  }
}
export default addUrlProps({ urlPropsQueryConfig })(MainPage);
