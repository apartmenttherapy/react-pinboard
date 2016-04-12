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
    cols: React.PropTypes.number,
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
      columns: _createColumnOrdering(childWeights, this.props.cols)
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
    const newColumns = _createColumnOrdering(childWeights, this.props.cols);
    
    if (JSON.stringify(newColumns) !== JSON.stringify(this.state.columns)) {
      this.setState({columns: newColumns});
    }
  },
  
  getStyles: function() {
    return {
      pinColumn: {
        width: `calc(${100 / this.props.cols}% - ${(this.props.cols-1)/this.props.cols} * ${this.props.spacing})`,
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