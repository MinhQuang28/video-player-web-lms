import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const propTypes = {
  actions: PropTypes.object,
  player: PropTypes.object,
  position: PropTypes.string,
  className: PropTypes.string
};

export default class BigPlayButton extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {}

  handleClick() {
    const { actions } = this.props;
    actions.play();
  }

  render() {
    const { player, position = 'left', className } = this.props;
    return (
      <button
        className={classNames(
          'video-react-button',
          'video-react-big-play-button',
          `video-react-big-play-button-${position}`,
          className,
          {
            'big-play-button-hide': player.hasStarted || !player.currentSrc
          }
        )}
        type="button"
        aria-live="polite"
        tabIndex="0"
        onClick={this.handleClick}
      >
        <span className="video-react-control-text">Play Video</span>
      </button>
    );
  }
}

BigPlayButton.propTypes = propTypes;
BigPlayButton.displayName = 'BigPlayButton';
