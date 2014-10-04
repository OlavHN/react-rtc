/** @jsx React.DOM */

var Firebase = require('firebase');
var React = require('react/addons');

var Rtc = require('../../src/Rtc');

// Each child of Rtc will get localStream and remoteStream injected into the component! It'll use the firebase ref for singaling

var ExampleVideo = React.createClass({
  render: function() {
    var localStream = this.props.localStream;
    var remoteStream = this.props.remoteStream;

    if (remoteStream)
      return <video autoPlay src={URL.createObjectURL(remoteStream)} />

    if (localStream)
      return <video autoPlay src={URL.createObjectURL(localStream)} />

    return null;
  }
});

var Demo = React.createClass({

  getInitialState: function() {
    return { room: 'aRoom' };
  },

  render: function() {
    return (
      <div>
        <Rtc component={React.DOM.span} id={Math.random().toString(36).substring(7)} fb={new Firebase('https://react-rtc.firebaseio.com/')}>
          <ExampleVideo key={this.state.room} />
        </Rtc>
        <input type="text" ref="input" />
        <button onClick={this.handleClick}>Join room</button>
      </div>

    );
  },

  handleClick: function() {
    this.setState({room: this.refs.input.getDOMNode().value});
    this.refs.input.getDOMNode().value = "";
  }
});

React.renderComponent(
  <Demo />,
  document.body
);
