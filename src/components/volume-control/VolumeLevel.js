import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const VolumeLevel = ({ percentage = '100%', vertical = false, className }) => {
  const style = {};
  if (vertical) {
    style.height = percentage;
  } else {
    style.width = percentage;
  }

  return (
    <div
      className={classNames(className, 'video-react-volume-level')}
      style={style}
    >
      <span className="video-react-control-text" />
    </div>
  );
};

VolumeLevel.propTypes = {
  percentage: PropTypes.string,
  vertical: PropTypes.bool,
  className: PropTypes.string
};

VolumeLevel.displayName = 'VolumeLevel';

export default VolumeLevel;
