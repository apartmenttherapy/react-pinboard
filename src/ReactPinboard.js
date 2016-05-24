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

const ReactPinboard = React.createClass({
  childRefs: [],

  propTypes: {
    cols: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.arrayOf(React.PropTypes.shape({
        media: React.PropTypes.string,
        cols: React.PropTypes.number.isRequired
      }))
    ]),
    spacing: React.PropTypes.string
  },
  
  getDefaultProps: function() {
    return {
      cols: 2,
      spacing: '1em'
    };
  },
  
  getInitialState: function() {
    // Since we don't have DOM nodes to weigh yet, pretend all children are
    // equal-height for the initial, naive rendering.
    const childWeights = this.props.children.map(() => 1);
    return {
      columns: _createColumnOrdering(childWeights, this.getNumCols())
    };
  },
  
  componentDidMount: function() {
    this._debouncedForceRefresh = debounce(this.forceRefresh, 100);
    window.addEventListener('resize', this._debouncedForceRefresh);
    
    setTimeout(this.forceRefresh, 2000);
  },
  
  componentWillUnmount: function() {
    window.removeEventListener('resize', this._debouncedForceRefresh);
  },
  
  componentDidUpdate: function() {
    this.forceRefresh();
  },
  
  forceRefresh: function() {
    const childWeights = this.childRefs.map((c) => {
      return ReactDOM.findDOMNode(c).offsetHeight;
    });
    const newColumns = _createColumnOrdering(childWeights, this.getNumCols());
    
    if (JSON.stringify(newColumns) !== JSON.stringify(this.state.columns)) {
      this.setState({columns: newColumns});
    }
  },
  
  getNumCols: function() {
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
  },
  
  getStyles: function() {
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
  },
  
  render: function() {
    return (
      <div style={this.getStyles().pinboard}>
        {this.state.columns.map(this.renderColumn)}
        <div style="clear: both;"></div>
      </div>
    );
  },
  
  renderColumn: function(childIndexes, columnIndex) {
    const style = Object.assign(
      {},
      this.getStyles().pinColumn,
      (columnIndex === this.state.columns.length - 1) && {marginRight: 0}
    );
    
    return (
      <div style={style} key={childIndexes[0]}>
        {childIndexes.map(this.renderChild)}
      </div>
    );
  },
  
  renderChild: function(index) {
    const Element = React.cloneElement(this.props.children[index], {ref: (c) => { this.childRefs[index] = c; }});
    return (
      <div style={this.getStyles().pinWrapper} key={index}>
        {Element}
      </div>
    );
  }
});

module.exports = ReactPinboard;