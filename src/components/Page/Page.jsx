import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import styles from "./Page.scss";

// https://codereview.stackexchange.com/questions/84988/converting-file-from-markdown-like-markup-into-html-using-repeated-substitutions
let md = dataIn => {
  // const md = function(dataIn) {
  // turn the data into an array
  let data = dataIn.split(/\r?\n/);

  // make a clone of the array to be used in the if statements.
  var tree = data.slice();

  for (var i = 0; i < tree.length; ++i) {
    // turn #s into heading tags if #s are present
    if (tree[i].match(/^# /g)) {
      let title = tree[i].replace(/^# (.*)/gm, "$1");
      data[i] = <h1>{title}</h1>;
    }

    // turn * or ** into italics and bold if present
    // if (tree[i].match(/\*\*|\*/g)) {
    //   data[i] = data[i]
    //     .replace(/\*\*([^\*|\s]+)\*\*/g, <strong>----1---</strong>)
    //     .replace(/\*([^\*|\s]+)\*/g, <em>----1---</em>);
    // }

    // surround every element with p tags if the
    // element doesn't start with an #.
    if (tree[i].match(/^[^#]/g)) {
      data[i] = <p>{tree[i]}</p>;
    }
  }

  // lastly, put the array together again to the saved as HTML
  // data = data.join("\n");

  return data;
};

class Page extends PureComponent {
  render() {
    let texts = this.props.text.split("----").map((text, i) => {
      return <span>{md(text)}</span>;
    });

    return (
      <div className={styles.row}>
        <div className={styles.container}>
          <div className={styles.cropMarks}>
            <div className={`${styles.cropMark} ${styles.vertical}`} />
            <div className={`${styles.cropMark} ${styles.horizontal}`} />
          </div>
          <div className={styles.bleed}>
            <div className={styles.crop}>
              <div className={styles.content}>
                <div className={styles.designGrid}>
                  <hr className={`${styles.frontline} ${styles.top}`} />
                  <div
                    className={`${styles.box} ${styles.right} ${styles.top}`}
                  >
                    {texts[0]}
                  </div>
                  <hr className={`${styles.frontline} ${styles.onequarter}`} />
                  <div className={`${styles.box} ${styles.onequarter}`}>
                    <span>{texts[1]}</span>
                  </div>
                  <hr className={`${styles.frontline} ${styles.center}`} />
                  <div className={`${styles.box} ${styles.center}`}>
                    <span>{texts[2]}</span>
                  </div>
                  <hr className={`${styles.frontline} ${styles.treequarter}`} />
                  <div className={`${styles.box} ${styles.treequarter}`}>
                    <span>{texts[3]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Page.propTypes = {
  // data: PropTypes.array.isRequired,
  text: PropTypes.string.isRequired
  // rowNumber: PropTypes.number.isRequired,
  // empty: PropTypes.string.isRequired
};

export default Page;
