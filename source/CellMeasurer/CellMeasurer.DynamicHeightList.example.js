import Immutable from "immutable";
import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import CellMeasurer from "./CellMeasurer";
import CellMeasurerCache from "./CellMeasurerCache";
import List from "../List";
import {
  generateRandomList
} from "../demo/utils"
import styles from "./CellMeasurer.example.css";

export default class DynamicHeightList extends PureComponent {
  static propTypes = {
    getClassName: PropTypes.func.isRequired,
    list: PropTypes.instanceOf(Immutable.List).isRequired,
    width: PropTypes.number.isRequired
  };

  constructor(props, context) {
    super(props, context);

    this._cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 50,
      keyMapper: (rowIndex, columnIndex) => {
        return this.state.list.get(rowIndex).randomKey
      }
    });

    this.scrollTop = 0;

    this.state = {
      list: props.list
    }

    this._rowRenderer = this._rowRenderer.bind(this);
  }

  prependCell = () => {
    const { list } = this.state
    const newList = Immutable.List(generateRandomList());

    const targetList = newList.concat(list)

    console.log('scrollTop', this.scrollTop);

    this.setState({
      list: targetList,
      scrollTop: this.scrollTop + 1000 * 50
    })
  }

  handleRowRender = ({
    startIndex
  }) => {
    this.startIndex = startIndex
    console.log('render', this.startIndex)
  }

  handleScroll = ({
    scrollTop
  }) => {
    console.log('scroll event scrollTop', this.scrollTop);

    if (scrollTop < 1000 && scrollTop < this.scrollTop && !this.prependTimer) {
      console.log('begin to prepend');

      this.prependTimer = setTimeout(() => {
        this.prependCell()
        this.prependTimer = null;
        console.log('prepend');
      }, 200);
    }

    this.scrollTop = scrollTop;
  }

  render() {
    const { width } = this.props;

    return (
      <div>
        <button onClick={this.prependCell}>prepend</button>
        <List
          className={styles.BodyGrid}
          deferredMeasurementCache={this._cache}
          height={400}
          overscanRowCount={0}
          rowCount={this.state.list.size}
          rowHeight={this._cache.rowHeight}
          rowRenderer={this._rowRenderer}
          onRowsRendered={this.handleRowRender}
          scrollToIndex={this.state.scrollToIndex}
          onScroll={this.handleScroll}
          scrollTop={this.state.scrollTop}
          width={width}
        />
      </div>
    );
  }

  _rowRenderer({ index, key, parent, style }) {
    const { getClassName } = this.props;
    const { list } = this.state

    const datum = list.get(index % list.size);
    const classNames = getClassName({ columnIndex: 0, rowIndex: index });

    const imageWidth = 300;
    const imageHeight = datum.size * (1 + index % 3);

    const source = `https://fillmurray.com/${imageWidth}/${imageHeight}`;

    return (
      <CellMeasurer
        cache={this._cache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {({ measure }) =>
          <div className={classNames} style={style}>
            <p>{index}</p>
            <p>{datum.randomKey}</p>
            <img
              onLoad={measure}
              src={source}
              style={{
                width: imageWidth
              }}
            />
          </div>}
      </CellMeasurer>
    );
  }
}
