import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import styles from "./Ui.scss";

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
    printscale: PropTypes.number.isRequired,
    cropmark: PropTypes.bool.isRequired,

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
    changePrintscale: PropTypes.func.isRequired,
    changeCropmark: PropTypes.func.isRequired,
    changePScale: PropTypes.func.isRequired,
    changeH1Scale: PropTypes.func.isRequired
  };

  changeText = event => {
    this.props.changeText(event.target.value);
  };
  changeWidth = event => {
    this.props.changeWidth(event.target.value);
  };
  changeHeight = event => {
    this.props.changeHeight(event.target.value);
  };
  changeTop = event => {
    this.props.changeTop(event.target.value);
  };
  changeRight = event => {
    this.props.changeRight(event.target.value);
  };
  changeBottom = event => {
    this.props.changeBottom(event.target.value);
  };
  changeLeft = event => {
    this.props.changeLeft(event.target.value);
  };
  changeBleed = event => {
    this.props.changeBleed(event.target.value);
  };
  changePrintscale = event => {
    this.props.changePrintscale(event.target.value);
  };
  changeCropmark = event => {
    this.props.changeCropmark(event.target.value);
  };
  changePScale = event => {
    this.props.changePScale(event.target.value);
  };
  changeH1Scale = event => {
    this.props.changeH1Scale(event.target.value);
  };

  render() {
    let isVisible = "";
    if (!this.props.visible) isVisible = styles.hidden;

    return (
      <div className={`${styles.ui} ${isVisible}`}>
        <div className={styles.inner}>
          <br />
          <div className={styles.value}>
            <div className={styles.value__caption}>
              Text{" "}
              <span className={styles.value__valuerange}>
                separated by line
              </span>
            </div>
            <textarea
              name="word"
              cols="40"
              rows="7"
              className={styles.value__input}
              value={this.props.text}
              onChange={this.changeText}
            />
          </div>

          {/*
          <div className={styles.value}>
            <div className={styles.value__caption}>
              Cropmarks{" "}
              <span className={styles.value__valuerange}>true/false</span>
            </div>
            <input
              className={styles.value__input}
              type="checkbox"
              checked={this.props.cropmark}
              onChange={this.changeCropmark}
            />
          </div>
*/}
          <div className={styles.value}>
            <div className={styles.value__caption}>
              Width <span className={styles.value__valuerange}>0–~</span>
            </div>
            <input
              className={styles.value__input}
              type="number"
              value={this.props.width}
              onChange={this.changeWidth}
            />
          </div>

          <div className={styles.value}>
            <div className={styles.value__caption}>
              Height <span className={styles.value__valuerange}>0–~</span>
            </div>
            <input
              className={styles.value__input}
              type="number"
              value={this.props.height}
              onChange={this.changeHeight}
            />
          </div>

          <div className={styles.value}>
            <div className={styles.value__caption}>
              p-Scale <span className={styles.value__valuerange}>0–~</span>
            </div>
            <input
              className={styles.value__input}
              type="number"
              value={this.props.pScale}
              onChange={this.changePScale}
            />
          </div>

          <div className={styles.value}>
            <div className={styles.value__caption}>
              H1-Scale <span className={styles.value__valuerange}>0–~</span>
            </div>
            <input
              className={styles.value__input}
              type="number"
              value={this.props.h1Scale}
              onChange={this.changeH1Scale}
            />
          </div>

          <div className={styles.value}>
            <div className={styles.value__caption}>
              Scale for print{" "}
              <span className={styles.value__valuerange}>0–~%</span>
            </div>
            <input
              className={styles.value__input}
              type="number"
              value={this.props.printscale}
              onChange={this.changePrintscale}
            />
          </div>

          <div className={styles.value}>
            <div className={styles.value__caption}>
              top <span className={styles.value__valuerange}>0–~</span>
            </div>
            <input
              className={styles.value__input}
              type="number"
              value={this.props.top}
              onChange={this.changeTop}
            />
          </div>

          <div className={styles.value}>
            <div className={styles.value__caption}>
              right <span className={styles.value__valuerange}>0–~</span>
            </div>
            <input
              className={styles.value__input}
              type="number"
              value={this.props.right}
              onChange={this.changeRight}
            />
          </div>

          <div className={styles.value}>
            <div className={styles.value__caption}>
              bottom <span className={styles.value__valuerange}>0–~</span>
            </div>
            <input
              className={styles.value__input}
              type="number"
              value={this.props.bottom}
              onChange={this.changeBottom}
            />
          </div>

          <div className={styles.value}>
            <div className={styles.value__caption}>
              left <span className={styles.value__valuerange}>0–~</span>
            </div>
            <input
              className={styles.value__input}
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
