import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import "./Ui.css";

const isPositiveNumber = (value) => {
  if (value === "") return false;

  const number = Number(value);
  return Number.isFinite(number) && number > 0;
};

class Ui extends PureComponent {
  static propTypes = {
    visible: PropTypes.bool.isRequired,

    text: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    top: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
    bleed: PropTypes.number.isRequired,
    cropmark: PropTypes.bool.isRequired,
    debugBorder: PropTypes.bool.isRequired,

    pScale: PropTypes.number.isRequired,
    h1Scale: PropTypes.number.isRequired,

    changeText: PropTypes.func.isRequired,
    changeWidth: PropTypes.func.isRequired,
    changeHeight: PropTypes.func.isRequired,
    changeTop: PropTypes.func.isRequired,
    changeRight: PropTypes.func.isRequired,
    changeBottom: PropTypes.func.isRequired,
    changeLeft: PropTypes.func.isRequired,
    changeBleed: PropTypes.func.isRequired,
    changeCropmark: PropTypes.func.isRequired,
    changeDebugBorder: PropTypes.func.isRequired,
    downloadPdf: PropTypes.func.isRequired,
    changePScale: PropTypes.func.isRequired,
    changeH1Scale: PropTypes.func.isRequired,
  };

  state = {
    widthDraft: null,
    heightDraft: null,
  };

  changeText = (event) => {
    this.props.changeText(event.target.value);
  };
  changeDimension = (draftName, change, value) => {
    if (isPositiveNumber(value)) {
      this.setState({ [draftName]: null });
      change(value);
      return;
    }

    this.setState({ [draftName]: value });
  };
  changeWidth = (event) => {
    this.changeDimension(
      "widthDraft",
      this.props.changeWidth,
      event.target.value
    );
  };
  changeHeight = (event) => {
    this.changeDimension(
      "heightDraft",
      this.props.changeHeight,
      event.target.value
    );
  };
  resetWidthDraft = () => {
    this.setState({ widthDraft: null });
  };
  resetHeightDraft = () => {
    this.setState({ heightDraft: null });
  };
  changeTop = (event) => {
    this.props.changeTop(event.target.value);
  };
  changeRight = (event) => {
    this.props.changeRight(event.target.value);
  };
  changeBottom = (event) => {
    this.props.changeBottom(event.target.value);
  };
  changeLeft = (event) => {
    this.props.changeLeft(event.target.value);
  };
  changeBleed = (event) => {
    this.props.changeBleed(event.target.value);
  };
  changeCropmark = (event) => {
    this.props.changeCropmark(event.target.checked);
  };
  changeDebugBorder = (event) => {
    this.props.changeDebugBorder(event.target.checked);
  };
  changePScale = (event) => {
    this.props.changePScale(event.target.value);
  };
  changeH1Scale = (event) => {
    this.props.changeH1Scale(event.target.value);
  };

  render() {
    let isVisible = "";
    if (!this.props.visible) isVisible = "hidden";

    return (
      <div className={`ui ${isVisible}`}>
        <div className="inner">
          <br />
          <div className="value">
            <div className="value__caption">
              Text{" "}
              <span className="value__valuerange">
                use \n for a forced line break
              </span>
            </div>
            <textarea
              name="word"
              cols="40"
              rows="7"
              className="value__input"
              value={this.props.text}
              onChange={this.changeText}
            />
            <div className="value__caption">
              {" "}
              <span className="value__valuerange">
                Original margins: L:12 R:16 T:7 B:12
              </span>
            </div>
          </div>

          <div className="value">
            <div className="value__caption">
              Cropmarks
            </div>
            <input
              aria-label="Cropmarks"
              className="value__input value__input--checkbox"
              type="checkbox"
              checked={this.props.cropmark}
              onChange={this.changeCropmark}
            />
          </div>

          <div className="value">
            <div className="value__caption">Show active-area guide</div>
            <input
              aria-label="Show active-area guide"
              className="value__input value__input--checkbox"
              type="checkbox"
              checked={this.props.debugBorder}
              onChange={this.changeDebugBorder}
            />
          </div>

          <div className="value">
            <button
              className="value__button"
              type="button"
              onClick={this.props.downloadPdf}
            >
              Download PDF
            </button>
          </div>
          <div className="value">
            <div className="value__caption">
              Width <span className="value__valuerange">0–~</span>
            </div>
            <input
              className="value__input"
              type="number"
              value={this.state.widthDraft ?? this.props.width}
              onChange={this.changeWidth}
              onBlur={this.resetWidthDraft}
            />
          </div>

          <div className="value">
            <div className="value__caption">
              Height <span className="value__valuerange">0–~</span>
            </div>
            <input
              className="value__input"
              type="number"
              value={this.state.heightDraft ?? this.props.height}
              onChange={this.changeHeight}
              onBlur={this.resetHeightDraft}
            />
          </div>

          <div className="value">
            <div className="value__caption">
              p-Scale <span className="value__valuerange">0–~</span>
            </div>
            <input
              className="value__input"
              type="number"
              value={this.props.pScale}
              onChange={this.changePScale}
            />
          </div>

          <div className="value">
            <div className="value__caption">
              H1-Scale <span className="value__valuerange">0–~</span>
            </div>
            <input
              className="value__input"
              type="number"
              value={this.props.h1Scale}
              onChange={this.changeH1Scale}
            />
          </div>

          <div className="value">
            <div className="value__caption">
              top <span className="value__valuerange">0–~</span>
            </div>
            <input
              className="value__input"
              type="number"
              value={this.props.top}
              onChange={this.changeTop}
            />
          </div>

          <div className="value">
            <div className="value__caption">
              right <span className="value__valuerange">0–~</span>
            </div>
            <input
              className="value__input"
              type="number"
              value={this.props.right}
              onChange={this.changeRight}
            />
          </div>

          <div className="value">
            <div className="value__caption">
              bottom <span className="value__valuerange">0–~</span>
            </div>
            <input
              className="value__input"
              type="number"
              value={this.props.bottom}
              onChange={this.changeBottom}
            />
          </div>

          <div className="value">
            <div className="value__caption">
              left <span className="value__valuerange">0–~</span>
            </div>
            <input
              className="value__input"
              type="number"
              value={this.props.left}
              onChange={this.changeLeft}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Ui;
