/** @jsx React.DOM */

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;

var Firebase = require('firebase');
var React = require('react/addons');

var Peer = require('./Peer');

/**
 * The Rtc component manages the local stream
 * The Rtc needs an id and a firebase ref
 */
var Rtc = React.createClass({

  getInitialState: function() {
    return {
      localStream: null
    };
  },

  componentDidMount: function() {
    // Get media
    var mediaOptions = {
      video: true,
      audio: true
    };

    navigator.getUserMedia(
      mediaOptions, 
      function gUMsuccess(stream) {
        this.setState({
          localStream: stream
        });
      }.bind(this),
      function gUMerror(e) {
        console.error(e);
      });
  },

  render: function() {
    var component = this.props.component || React.DOM.div;
    var localStream = this.state.localStream;
    var id = this.props.id;

    var children = React.Children.map(this.props.children, function(child) {
      var key = child.props.key;
      var fb = this.props.fb.child(key);

      return (
        <Peer id={id} key={key} localStream={localStream} fb={fb}>
          {child}
        </Peer>
      );
    }, this);

    return component(this.props, Object.keys(children).map(function(key) {
      return children[key];
    }));
  }
});

module.exports = Rtc;
