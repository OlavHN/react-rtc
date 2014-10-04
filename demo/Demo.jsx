/** @jsx React.DOM */

var Firebase = require('firebase');
var React = require('react/addons');

var Rtc = require('./Rtc');

// Each child of Rtc will get localStream and remoteStream injected into the component! It'll use the firebase ref for singalling

var ExampleVideo = React.createClass({
  render: function() {
    var localStream = this.props.localStream;
    var remoteStream = this.props.remoteStream;

    console.log('local', localStream, 'remote', remoteStream);
    if (!localStream || !remoteStream)
      return null;

    return (
      <div>
        <video autoPlay src={URL.createObjectURL(localStream)} />
        <video autoPlay src={URL.createObjectURL(remoteStream)} />
      </div>
    )
  }
});

React.renderComponent(
  <Rtc component={React.DOM.span} id={Math.random().toString(36).substring(7)} fb={new Firebase('https://spatially.firebaseio.com')}>
    <ExampleVideo key="aRoom" />
    <ExampleVideo key="anotherRoom" />
  </Rtc>,
  document.body
);
