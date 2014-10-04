/** @jsx React.DOM */
var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;

var Firebase = require('firebase');
var React = require('react/addons');

/**
 * The peer wraps an element and establishes a PeerConnection with one peer
 * The peer requires a key and it must correspond with a remote peers key
 */
var Peer = React.createClass({displayName: 'Peer',

  getInitialState: function() {
    return {
      remoteStream: null
    };
  },

  componentWillMount: function() {
    var localStream = this.props.localStream;

    if (localStream)
      this.negotiatePeerConnection(localStream);
  },

  componentWillReceiveProps: function(newProps) {
    var localStream = this.props.localStream;

    if (localStream !== newProps.localStream)
      this.handleNewStream(newProps.localStream);
  },

  handleNewStream: function(newStream) {
    var pc = this.state.pc;
    var localStream = this.props.localStream;

    if (!pc && newStream)
      return this.negotiatePeerConnection(newStream);
  },

  negotiatePeerConnection: function(localStream) {
    var fb = this.props.fb;
    var id = this.props.id;

    fb.child(id).set(true);

    // Remove me if logging off
    fb.child(id).onDisconnect().remove();

    // Check wether to send offer, listen to answer or ignore
    fb.on('child_added', function(snap) {
      var peer = snap.name();

      if (peer === id)
        return;

      fb.child(id).set(true);
      var previousPeer = this.state.peer;
      if (previousPeer) {
        fb.child(previousPeer).child('answer').off();
        fb.child(previousPeer).child('offer').off();
        fb.child(previousPeer).child('candidates').off();
      }

      this.setState({
        peer: peer
      });

      var pc = this.initializePeerConnection(localStream);
      window.pc = pc;

      if (peer > id) {
        console.log('i make offer')
        this.makeOffer(pc);
        fb.child(peer).child('answer').on('value', function(snap) {
          var answer = snap.val();

          if (!answer)
            return;

          this.handleAnswer(pc, JSON.parse(answer));
        }.bind(this));
      } else {
        console.log('I will answer')
        fb.child(peer).child('offer').on('value', function(snap) {
          var offer = snap.val();

          if (!offer)
            return;

          console.log('now Im answering')
          this.handleOffer(pc, JSON.parse(offer));
        }.bind(this));
      }

      // Listen for new candidates
      console.log('peer', peer);
      fb.child(peer).child('candidates').on('child_added', function(snap) {
        var candidate = snap.val();
        console.log('adding candidate', JSON.parse(candidate));

        if (!candidate)
          return;

        pc.addIceCandidate(new IceCandidate(JSON.parse(candidate)));
      });
    }.bind(this));

    // If it's us, remove the PC.
    /*fb.on('child_removed', function(snap) {
      var removedPeer = snap.name();
      var peer = this.state.peer;
      var localStream = this.props.localStream;

      if (localStream && removedPeer === peer)
        this.state.remoteStream.stop();

    }.bind(this));*/
  },

  initializePeerConnection: function(localStream) {
    var fb = this.props.fb;
    var id = this.props.id;

    fb.child(id).set(true);

    var server = {
      iceServers: [
        { url: "stun:23.21.150.121" },
        { url: "stun:stun.l.google.com:19302" }
      ]
    };

    var options = {
      optional: [
        { DtlsSrtpKeyAgreement: true },
        { RtpDataChannels: true }
      ]
    };

    var pc = new PeerConnection(server, options);

    pc.onaddstream = function(e) {
      var stream = e.stream;

      this.setState({
        remoteStream: stream
      });
    }.bind(this);

    pc.onicecandidate = function(e) {
      if (e.candidate === null)
        return;

      var id = this.props.id;
      var fb = this.props.fb;
      // TODO: Firefox IceCandidate JSON bug. Need to serialize :(
      fb.child(id).child('candidates').push(JSON.stringify(e.candidate));
    }.bind(this);

    if (localStream) {
      console.log('adding stream through setup', localStream);
      pc.addStream(localStream);
    }

    this.setState({pc: pc});

    return pc;
  },

  makeOffer: function(pc) {
    var fb = this.props.fb;
    var id = this.props.id;

    var offerConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
      }
    };

    pc.createOffer(function(offer) {
      pc.setLocalDescription(offer);

      fb.child(id).child('offer').set(JSON.stringify(offer));
      console.log('offer', offer);

    }, function(e) {
      console.error(e);
    }, offerConstraints);
  },

  handleOffer: function(pc, offer) {
    var fb = this.props.fb;
    var id = this.props.id;

    var answerConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
      }
    };

    console.log(arguments);
    pc.setRemoteDescription(new SessionDescription(offer))

    pc.createAnswer(function(answer) {
      pc.setLocalDescription(answer);
      fb.child(id).child('answer').set(JSON.stringify(answer));
    }, function(e) {
      console.error(e);
    }, answerConstraints);
  },

  handleAnswer: function(pc, answer) {
    pc.setRemoteDescription(new SessionDescription(answer));
  },

  render: function() {
    var child = React.Children.only(this.props.children);
    var localStream = this.props.localStream;
    var remoteStream = this.state.remoteStream;

    return React.addons.cloneWithProps(child, {
     key: child.props.key,
     localStream: localStream,
     remoteStream: remoteStream
   });
  }
});

module.exports = Peer;
