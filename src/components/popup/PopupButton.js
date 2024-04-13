import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import ClickableComponent from '../ClickableComponent';
import Popup from './Popup';

const PopupButton = ({
  inline = true,
  className,
  onClick,
  onFocus,
  onBlur,
  children
}) => {
  const ps = { onClick, onFocus, onBlur };
  return (
    <ClickableComponent
      className={classNames(
        className,
        {
          'video-react-menu-button-inline': !!inline,
          'video-react-menu-button-popup': !inline
        },
        'video-react-control video-react-button video-react-menu-button'
      )}
      {...ps}
    >
      <Popup>{children}</Popup>
    </ClickableComponent>
  );
};

PopupButton.propTypes = {
  inline: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string
};

PopupButton.displayName = 'PopupButton';

export default PopupButton;
