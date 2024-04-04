import PropTypes from 'prop-types';
import React, { Component } from 'react';

const propTypes = {
  actions: PropTypes.object,
  className: PropTypes.string,
  seconds: PropTypes.oneOf([5, 10, 30]),
  onclick: PropTypes.func
};

const defaultProps = {
  seconds: 10
};

export default mode => {
  class ForwardReplayControl extends Component {
    constructor(props, context) {
      super(props, context);
      this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
      const { actions, seconds, onClick } = this.props;
      // Depends mode to implement different actions
      if (mode === 'forward') {
        actions.forward(seconds);
        if (onClick) {
          onClick(seconds);
        }
      } else {
        actions.replay(seconds);
        if (onClick) {
          onClick(seconds);
        }
      }
    }

    render() {
      const { seconds, className } = this.props;
      const classNames = [
        'video-react-control',
        'video-react-button',
        'video-react-icon'
      ];
      classNames.push(
        `video-react-icon-${mode}-${seconds}`,
        `video-react-${mode}-control`
      );
      if (className) {
        classNames.push(className);
      }
      return (
        <button
          ref={c => {
            this.button = c;
          }}
          className={classNames.join(' ')}
          type="button"
          onClick={this.handleClick}
        >
          <span className="video-react-control-text">{`${mode} ${seconds} seconds`}</span>
        </button>
      );
    }
  }

  ForwardReplayControl.propTypes = propTypes;
  ForwardReplayControl.defaultProps = defaultProps;
  return ForwardReplayControl;
};
