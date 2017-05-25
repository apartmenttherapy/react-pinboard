const PropTypes = require('prop-types');
const React = require('react');
const ReactDOM = require('react-dom');
const debounce = require('lodash.debounce');

const _createColumnOrdering = function(childWeights, numCols) {
  let columns = [];
  let columnWeights = [];
  
  for (var i = 0; i < numCols; i++) {
    columns.push([]);
    columnWeights.push(0);
  }
  
  childWeights.forEach((weight, index) => {
    const smallestColumnIndex = columnWeights.indexOf(Math.min.apply(null, columnWeights));
    columns[smallestColumnIndex].push(index);
    columnWeights[smallestColumnIndex] += weight;
  });
  
  return columns;
};

class ReactPinboard extends React.Component {
  constructor(props) {
    super(props);
    this.childRefs = [];
    // Since we don't have DOM nodes to weigh yet, pretend all children are
    // equal-height for the initial, naive rendering.
    const childWeights = props.children.map(() => 1);
    this.state = {
      columns: _createColumnOrdering(childWeights, this.getNumCols())
    };
  }
  
  componentDidMount() {
    this._debouncedForceRefresh = debounce(this.forceRefresh.bind(this), 100);
    window.addEventListener('resize', this._debouncedForceRefresh);  
    setTimeout(this._debouncedForceRefresh, 2000);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this._debouncedForceRefresh);
  }
  
  componentDidUpdate() {
    this.forceRefresh();
  }
  
  forceRefresh() {
    const childWeights = this.childRefs.map((c) => {
      return ReactDOM.findDOMNode(c).children[0].offsetHeight;
    });
    const newColumns = _createColumnOrdering(childWeights, this.getNumCols());
    
    if (JSON.stringify(newColumns) !== JSON.stringify(this.state.columns)) {
      this.setState({columns: newColumns});
    }
  }
  
  getNumCols() {
    if (typeof this.props.cols === 'number') {
      return this.props.cols;
    } else {
      if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
        // Server-renders and browser without matchMedia should use the last col
        // value provided, which should represent the smallest viewport.
        return this.props.cols[this.props.cols.length - 1].cols;
      } else {
        // Return the cols for the first-matching media query
        return this.props.cols.filter((opt) => window.matchMedia(opt.media).matches)[0].cols;
      }
    }
  }
  
  getStyles() {
    return {
      pinColumn: {
        width: `calc(${100 / this.getNumCols()}% - ${(this.getNumCols()-1)/this.getNumCols()} * ${this.props.spacing})`,
        float: 'left',
        marginRight: this.props.spacing
      },
      pinWrapper: {
        marginBottom: this.props.spacing
      }
    };
  }
  
  render() {
    return (
      <div style={this.getStyles().pinboard}>
        {this.state.columns.map(this.renderColumn, this)}
        <div style={{clear: 'left'}}></div>
      </div>
    );
  }
  
  renderColumn(childIndexes, columnIndex) {
    const style = Object.assign(
      {},
      this.getStyles().pinColumn,
      (columnIndex === this.state.columns.length - 1) && {marginRight: 0}
    );
    
    return (
      <div style={style} key={childIndexes[0]}>
        {childIndexes.map(this.renderChild, this)}
      </div>
    );
  }
  
  renderChild(index) {
    return (
      <div style={this.getStyles().pinWrapper} key={index} ref={(c) => { this.childRefs[index] = c; } }>
        {this.props.children[index]}
      </div>
    );
  }
}

ReactPinboard.defaultProps = {
  cols: 2,
  spacing: '1em'
};

ReactPinboard.propTypes = {
  cols: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.shape({
      media: PropTypes.string,
      cols: PropTypes.number.isRequired
    }))
  ]),
  spacing: PropTypes.string
};

module.exports = ReactPinboard;
