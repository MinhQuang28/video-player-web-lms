import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Manager from '../Manager';
import * as browser from '../utils/browser';
import { focusNode } from '../utils/dom';
import { mergeAndSortChildren, isVideoChild, throttle } from '../utils';
import fullscreen from '../utils/fullscreen';
import Video from './Video';
import PosterImage from './PosterImage';
import LoadingSpinner from './LoadingSpinner';
import Bezel from './Bezel';
import BigPlayButton from './BigPlayButton';
import ControlBar from './control-bar/ControlBar';
import Shortcut from './Shortcut';

class Player extends Component {
  constructor(props, context) {
    super(props, context);
    this.controlsHideTimer = null;
    this.video = null; // the Video component
    this.manager = new Manager(props.store);
    this.actions = this.manager.getActions();
    this.manager.subscribeToPlayerStateChange(
      this.handleStateChange.bind(this)
    );
    this.getStyle = this.getStyle.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.getChildren = this.getChildren.bind(this);
    this.handleMouseMove = throttle(this.handleMouseMove.bind(this), 250);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.startControlsTimer = this.startControlsTimer.bind(this);
    this.handleFullScreenChange = this.handleFullScreenChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    fullscreen.addEventListener(this.handleFullScreenChange);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    fullscreen.removeEventListener(this.handleFullScreenChange);
    if (this.controlsHideTimer) {
      window.clearTimeout(this.controlsHideTimer);
    }
  }

  getDefaultChildren(originalChildren) {
    return [
      <Video
        ref={c => {
          this.video = c;
          this.manager.video = this.video;
        }}
        key="video"
        order={0.0}
      >
        {originalChildren}
      </Video>,
      <PosterImage key="poster-image" order={1.0} />,
      <LoadingSpinner key="loading-spinner" order={2.0} />,
      <Bezel key="bezel" order={3.0} />,
      <BigPlayButton key="big-play-button" order={4.0} />,
      <ControlBar key="control-bar" order={5.0} />,
      <Shortcut key="shortcut" order={99.0} />
    ];
  }

  getChildren(props) {
    const {
      className: _,
      children: originalChildren,
      ...propsWithoutChildren
    } = props;
    const children = React.Children.toArray(this.props.children).filter(
      e => !isVideoChild(e)
    );
    const defaultChildren = this.getDefaultChildren(originalChildren);
    return mergeAndSortChildren(
      defaultChildren,
      children,
      propsWithoutChildren
    );
  }

  setWidthOrHeight(style, name, value) {
    let styleVal;
    if (typeof value === 'string') {
      if (value === 'auto') {
        styleVal = 'auto';
      } else if (value.match(/\d+%/)) {
        styleVal = value;
      }
    } else if (typeof value === 'number') {
      styleVal = `${value}px`;
    }
    Object.assign(style, {
      [name]: styleVal
    });
  }

  getStyle() {
    const {
      fluid,
      aspectRatio: propsAspectRatio,
      height: propsHeight,
      width: propsWidth
    } = this.props;
    const { player } = this.manager.getState();
    const style = {};
    let width;
    let height;
    let aspectRatio;

    if (propsAspectRatio !== undefined && propsAspectRatio !== 'auto') {
      aspectRatio = propsAspectRatio;
    } else if (player.videoWidth) {
      aspectRatio = `${player.videoWidth}:${player.videoHeight}`;
    } else {
      aspectRatio = '16:9';
    }

    const ratioParts = aspectRatio.split(':');
    const ratioMultiplier = ratioParts[1] / ratioParts[0];

    if (propsWidth !== undefined) {
      width = propsWidth;
    } else if (propsHeight !== undefined) {
      width = propsHeight / ratioMultiplier;
    } else {
      width = player.videoWidth || 400;
    }

    if (propsHeight !== undefined) {
      height = propsHeight;
    } else {
      height = width * ratioMultiplier;
    }

    if (fluid) {
      style.paddingTop = `${ratioMultiplier * 100}%`;
    } else {
      this.setWidthOrHeight(style, 'width', width);
      this.setWidthOrHeight(style, 'height', height);
    }

    return style;
  }

  getState() {
    return this.manager.getState();
  }

  get playbackRate() {
    return this.video.playbackRate;
  }

  set playbackRate(rate) {
    this.video.playbackRate = rate;
  }

  get muted() {
    return this.video.muted;
  }

  set muted(val) {
    this.video.muted = val;
  }

  get volume() {
    return this.video.volume;
  }

  set volume(val) {
    this.video.volume = val;
  }

  get videoWidth() {
    return this.video.videoWidth;
  }

  get videoHeight() {
    return this.video.videoHeight;
  }

  play() {
    this.video.play();
  }

  pause() {
    this.video.pause();
  }

  load() {
    this.video.load();
  }

  addTextTrack(...args) {
    this.video.addTextTrack(...args);
  }

  canPlayType(...args) {
    this.video.canPlayType(...args);
  }

  seek(time) {
    this.video.seek(time);
  }

  forward(seconds) {
    this.video.forward(seconds);
  }

  replay(seconds) {
    this.video.replay(seconds);
  }

  toggleFullscreen() {
    this.video.toggleFullscreen();
  }

  subscribeToStateChange(listener) {
    return this.manager.subscribeToPlayerStateChange(listener);
  }

  handleResize() {}

  handleFullScreenChange(event) {
    if (event.target === this.manager.rootElement) {
      this.actions.handleFullscreenChange(fullscreen.isFullscreen);
    }
  }

  handleMouseDown() {
    this.startControlsTimer();
  }

  handleMouseMove() {
    this.startControlsTimer();
  }

  handleKeyDown() {
    this.startControlsTimer();
  }

  startControlsTimer() {
    let controlBarActiveTime = 3000;
    React.Children.forEach(this.props.children, element => {
      if (!React.isValidElement(element) || element.type !== ControlBar) {
        return;
      }

      const { autoHideTime } = element.props;
      if (typeof autoHideTime === 'number') {
        controlBarActiveTime = autoHideTime;
      }
    });

    this.actions.userActivate(true);
    clearTimeout(this.controlsHideTimer);
    this.controlsHideTimer = setTimeout(() => {
      this.actions.userActivate(false);
    }, controlBarActiveTime);
  }

  handleStateChange(state, prevState) {
    if (state.isFullscreen !== prevState.isFullscreen) {
      this.handleResize();
      focusNode(this.manager.rootElement);
    }
    this.forceUpdate();
  }

  handleFocus() {
    this.actions.activate(true);
  }

  handleBlur() {
    this.actions.activate(false);
  }

  render() {
    const { fluid } = this.props;
    const { player } = this.manager.getState();
    const {
      paused,
      hasStarted,
      waiting,
      seeking,
      isFullscreen,
      userActivity
    } = player;
    const props = {
      ...this.props,
      player,
      actions: this.actions,
      manager: this.manager,
      store: this.manager.store,
      video: this.video ? this.video.video : null
    };
    const children = this.getChildren(props);

    return (
      <div
        className={classNames(
          {
            'video-react-controls-enabled': true,
            'video-react-has-started': hasStarted,
            'video-react-paused': paused,
            'video-react-playing': !paused,
            'video-react-waiting': waiting,
            'video-react-seeking': seeking,
            'video-react-fluid': fluid,
            'video-react-fullscreen': isFullscreen,
            'video-react-user-inactive': !userActivity,
            'video-react-user-active': userActivity,
            'video-react-workinghover': !browser.IS_IOS
          },
          'video-react',
          this.props.className
        )}
        style={this.getStyle()}
        ref={c => {
          this.manager.rootElement = c;
        }}
        role="region"
        onTouchStart={this.handleMouseDown}
        onMouseDown={this.handleMouseDown}
        onTouchMove={this.handleMouseMove}
        onMouseMove={this.handleMouseMove}
        onKeyDown={this.handleKeyDown}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        tabIndex="-1"
      >
        {children}
      </div>
    );
  }
}

Player.propTypes = {
  children: PropTypes.any,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fluid: PropTypes.bool,
  muted: PropTypes.bool,
  playsInline: PropTypes.bool,
  aspectRatio: PropTypes.string,
  className: PropTypes.string,
  videoId: PropTypes.string,
  startTime: PropTypes.number,
  loop: PropTypes.bool,
  autoPlay: PropTypes.bool,
  src: PropTypes.string,
  poster: PropTypes.string,
  preload: PropTypes.oneOf(['auto', 'metadata', 'none']),
  onLoadStart: PropTypes.func,
  onWaiting: PropTypes.func,
  onCanPlay: PropTypes.func,
  onCanPlayThrough: PropTypes.func,
  onPlaying: PropTypes.func,
  onEnded: PropTypes.func,
  onSeeking: PropTypes.func,
  onSeeked: PropTypes.func,
  onPlay: PropTypes.func,
  onPause: PropTypes.func,
  onProgress: PropTypes.func,
  onDurationChange: PropTypes.func,
  onError: PropTypes.func,
  onSuspend: PropTypes.func,
  onAbort: PropTypes.func,
  onEmptied: PropTypes.func,
  onStalled: PropTypes.func,
  onLoadedMetadata: PropTypes.func,
  onLoadedData: PropTypes.func,
  onTimeUpdate: PropTypes.func,
  onRateChange: PropTypes.func,
  onVolumeChange: PropTypes.func,
  store: PropTypes.object
};

Player.defaultProps = {
  fluid: true,
  muted: false,
  playsInline: false,
  preload: 'auto',
  aspectRatio: 'auto'
};

Player.displayName = 'Player';

export default Player;
