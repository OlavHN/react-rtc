react-rtc
=========

react-rtc is a react component that uses firebase to establish webRTC connections.

[Simple demo](http://olavhn.github.io/react-rtc/)

Usage
----

```javascript
/** @jsx React.DOM */
var Firebase = require('firebase');
var React = require('react');

var Rtc = require('react-rtc');

var myFirebaseRef = new Firebase('https://someFbApp.firebaseio.com');

var VideoComponent = React.createClass({
  componentWillReceiveProps: function(newProps) {
    if (this.props.remoteVideo !== newProps.remoteVideo)
      this.setState({src: URL.createObjectURL(newProps.remoteVideo)});
  },

  render: function() {
    return <video src={this.state.src} />
  }
});

// Then use it like this:

<Rtc id="myId" fb={myFirebaseRef}>
  <VideoComponent key="sharedKey">
  <VideoComponent key="anotherKeySharedWithAnotherClient">
</Rtc>
```

API
----
`Rtc` requires `id` and `fb` props. It can also take a `component` prop which decides what DOM element child components will render in. It will default to a DIV element. `id` must be unique amongst all clients/browsers who share the same firebase ref.

Child components require a `key` component. Whenever a child component in *another* browser has the same key, they will establish a webRTC connection, and the child will get two new props injected: `localStream` and `remoteStream`. These are webRTC media streams.
