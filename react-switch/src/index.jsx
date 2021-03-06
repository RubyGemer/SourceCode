import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  checkedIcon as defaultCheckedIcon,
  uncheckedIcon as defaultUncheckedIcon
} from "./icons.jsx";
import getBackgroundColor from "./getBackgroundColor";
import hexColorPropType from "./hexColorPropType";

class ReactSwitch extends Component {
  constructor(props) {
    super(props);
    const { height, width, handleDiameter, checked } = props;
    this.$handleDiameter = handleDiameter || height - 2;
    this.$checkedPos = Math.max(
      width - height,
      width - (height + this.$handleDiameter) / 2
    );
    this.$uncheckedPos = Math.max(0, (height - this.$handleDiameter) / 2);
    this.state = {
      $pos: checked ? this.$checkedPos : this.$uncheckedPos
    };

    this.$onMouseDown = this.$onMouseDown.bind(this);
    this.$onMouseMove = this.$onMouseMove.bind(this);
    this.$onMouseUp = this.$onMouseUp.bind(this);

    this.$onTouchStart = this.$onTouchStart.bind(this);
    this.$onTouchMove = this.$onTouchMove.bind(this);
    this.$onTouchEnd = this.$onTouchEnd.bind(this);
    this.$onTouchCancel = this.$onTouchCancel.bind(this);
    this.$onClick = this.$onClick.bind(this);

    this.$onInputChange = this.$onInputChange.bind(this);
    this.$setHasOutline = this.$setHasOutline.bind(this);
    this.$setHasNoOutline = this.$setHasNoOutline.bind(this);
    this.$getInputRef = this.$getInputRef.bind(this);
  }

  componentWillReceiveProps({ checked }) {
    const $pos = checked ? this.$checkedPos : this.$uncheckedPos;
    this.setState({ $pos });
  }

  $onDragStart(clientX) {
    this.$inputRef.focus();
    this.setState({
      $startX: clientX,
      $hasOutline: true,
      $dragStartingTime: Date.now()
    });
  }

  $onDrag(clientX) {
    const { $startX, $isDragging, $pos } = this.state;
    const { checked } = this.props;
    const startPos = checked ? this.$checkedPos : this.$uncheckedPos;
    const mousePos = startPos + clientX - $startX;
    // We need this check to fix a windows glitch where onDrag is triggered onMouseDown in some cases
    if (!$isDragging && clientX !== $startX) {
      this.setState({ $isDragging: true });
    }
    const newPos = Math.min(
      this.$checkedPos,
      Math.max(this.$uncheckedPos, mousePos)
    );
    // Prevent unnecessary rerenders
    if (newPos !== $pos) {
      this.setState({ $pos: newPos });
    }
  }

  $onDragStop(event) {
    const { $pos, $isDragging, $dragStartingTime } = this.state;
    const { checked, onChange, id } = this.props;
    const halfwayCheckpoint = (this.$checkedPos + this.$uncheckedPos) / 2;

    // Simulate clicking the handle
    const timeSinceStart = Date.now() - $dragStartingTime;
    if (!$isDragging || timeSinceStart < 250) {
      onChange(!checked, event, id);
      // Handle dragging from checked position
    } else if (checked) {
      if ($pos > halfwayCheckpoint) {
        this.setState({ $pos: this.$checkedPos });
      } else {
        onChange(false, event, id);
      }
      // Handle dragging from unchecked position
    } else if ($pos < halfwayCheckpoint) {
      this.setState({ $pos: this.$uncheckedPos });
    } else {
      onChange(true, event, id);
    }

    this.setState({ $isDragging: false, $hasOutline: false });
  }

  $onMouseDown(event) {
    event.preventDefault();
    // Ignore right click and scroll
    if (typeof event.button === "number" && event.button !== 0) {
      return;
    }

    this.$onDragStart(event.clientX);
    window.addEventListener("mousemove", this.$onMouseMove);
    window.addEventListener("mouseup", this.$onMouseUp);
  }

  $onMouseMove(event) {
    event.preventDefault();
    this.$onDrag(event.clientX);
  }

  $onMouseUp(event) {
    this.$onDragStop(event);
    window.removeEventListener("mousemove", this.$onMouseMove);
    window.removeEventListener("mouseup", this.$onMouseUp);
  }

  $onTouchStart(event) {
    this.$checkedStateFromDragging = null;
    this.$onDragStart(event.touches[0].clientX);
  }

  $onTouchMove(event) {
    this.$onDrag(event.touches[0].clientX);
  }

  $onTouchEnd(event) {
    event.preventDefault();
    this.$onDragStop(event);
  }

  $onTouchCancel() {
    this.setState({ $hasOutline: false });
  }

  $onInputChange(event) {
    const { onChange, id } = this.props;
    const { checked } = event.target;
    onChange(checked, event, id);
  }

  $setHasOutline() {
    this.setState({ $hasOutline: true });
  }

  $setHasNoOutline() {
    this.setState({ $hasOutline: false });
  }

  $getInputRef(el) {
    this.$inputRef = el;
  }

  $onClick(event) {
    event.preventDefault();

    const { checked, onChange, id } = this.props;
    this.$inputRef.focus();
    onChange(!checked, event, id);
    this.setState({ $hasOutline: false });
  }

  render() {
    const {
      checked,
      disabled,
      className,
      offColor,
      onColor,
      offHandleColor,
      onHandleColor,
      checkedIcon,
      uncheckedIcon,
      boxShadow,
      activeBoxShadow,
      height,
      width,
      id,
      "aria-labelledby": ariaLabelledby,
      "aria-label": ariaLabel
    } = this.props;

    const { $pos, $isDragging, $hasOutline } = this.state;

    const rootStyle = {
      position: "relative",
      display: "inline-block",
      textAlign: "left",
      opacity: disabled ? 0.5 : 1,
      borderRadius: height / 2,
      WebkitTransition: "opacity 0.25s",
      MozTransition: "opacity 0.25s",
      transition: "opacity 0.25s",
      touchAction: "none",
      WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
      WebkitUserSelect: "none",
      MozUserSelect: "none",
      msUserSelect: "none",
      userSelect: "none"
    };

    const backgroundStyle = {
      height,
      width,
      margin: Math.max(0, (this.$handleDiameter - height) / 2),
      position: "relative",
      background: getBackgroundColor(
        $pos,
        this.$checkedPos,
        this.$uncheckedPos,
        offColor,
        onColor
      ),
      borderRadius: height / 2,
      cursor: disabled ? "default" : "pointer",
      WebkitTransition: $isDragging ? null : "background 0.25s",
      MozTransition: $isDragging ? null : "background 0.25s",
      transition: $isDragging ? null : "background 0.25s"
    };

    const checkedIconStyle = {
      height,
      width: Math.min(
        height * 1.5,
        width - (this.$handleDiameter + height) / 2 + 1
      ),
      position: "relative",
      opacity:
        ($pos - this.$uncheckedPos) / (this.$checkedPos - this.$uncheckedPos),
      pointerEvents: "none",
      WebkitTransition: $isDragging ? null : "opacity 0.25s",
      MozTransition: $isDragging ? null : "opacity 0.25s",
      transition: $isDragging ? null : "opacity 0.25s"
    };

    const uncheckedIconStyle = {
      height,
      width: Math.min(
        height * 1.5,
        width - (this.$handleDiameter + height) / 2 + 1
      ),
      position: "absolute",
      opacity:
        1 -
        ($pos - this.$uncheckedPos) / (this.$checkedPos - this.$uncheckedPos),
      right: 0,
      top: 0,
      pointerEvents: "none",
      WebkitTransition: $isDragging ? null : "opacity 0.25s",
      MozTransition: $isDragging ? null : "opacity 0.25s",
      transition: $isDragging ? null : "opacity 0.25s"
    };

    const handleStyle = {
      height: this.$handleDiameter,
      width: this.$handleDiameter,
      background: getBackgroundColor(
        $pos,
        this.$checkedPos,
        this.$uncheckedPos,
        offHandleColor,
        onHandleColor
      ),
      display: "inline-block",
      cursor: disabled ? "default" : "pointer",
      borderRadius: "50%",
      position: "absolute",
      transform: `translateX(${$pos}px)`,
      top: Math.max(0, (height - this.$handleDiameter) / 2),
      outline: 0,
      boxShadow: $hasOutline ? activeBoxShadow : boxShadow,
      border: 0,
      WebkitTransition: $isDragging
        ? null
        : "background-color 0.25s, transform 0.25s, box-shadow 0.15s",
      MozTransition: $isDragging
        ? null
        : "background-color 0.25s, transform 0.25s, box-shadow 0.15s",
      transition: $isDragging
        ? null
        : "background-color 0.25s, transform 0.25s, box-shadow 0.15s"
    };

    const inputStyle = {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: -1,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      width: 1
    };

    return (
      <div className={className} style={rootStyle}>
        <div
          className="react-switch-bg"
          style={backgroundStyle}
          onClick={disabled ? null : this.$onClick}
          onMouseDown={e => e.preventDefault()}
        >
          {checkedIcon && <div style={checkedIconStyle}>{checkedIcon}</div>}
          {uncheckedIcon && (
            <div style={uncheckedIconStyle}>{uncheckedIcon}</div>
          )}
        </div>
        <div
          className="react-switch-handle"
          style={handleStyle}
          onClick={e => e.preventDefault()}
          onMouseDown={disabled ? null : this.$onMouseDown}
          onTouchStart={disabled ? null : this.$onTouchStart}
          onTouchMove={disabled ? null : this.$onTouchMove}
          onTouchEnd={disabled ? null : this.$onTouchEnd}
          onTouchCancel={disabled ? null : this.$onTouchCancel}
        />
        <input
          type="checkbox"
          role="switch"
          id={id}
          checked={checked}
          disabled={disabled}
          tabIndex={disabled ? null : 0}
          onFocus={this.$setHasOutline}
          onBlur={this.$setHasNoOutline}
          onChange={this.$onInputChange}
          aria-labelledby={ariaLabelledby}
          aria-label={ariaLabel}
          style={inputStyle}
          ref={this.$getInputRef}
        />
      </div>
    );
  }
}
ReactSwitch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  offColor: hexColorPropType,
  onColor: hexColorPropType,
  offHandleColor: hexColorPropType,
  onHandleColor: hexColorPropType,
  handleDiameter: PropTypes.number,
  uncheckedIcon: PropTypes.oneOfType([PropTypes.bool, PropTypes.element]),
  checkedIcon: PropTypes.oneOfType([PropTypes.bool, PropTypes.element]),
  boxShadow: PropTypes.string,
  activeBoxShadow: PropTypes.string,
  height: PropTypes.number,
  width: PropTypes.number,
  className: PropTypes.string,
  id: PropTypes.string,
  "aria-labelledby": PropTypes.string,
  "aria-label": PropTypes.string
};

ReactSwitch.defaultProps = {
  disabled: false,
  offColor: "#888",
  onColor: "#080",
  offHandleColor: "#fff",
  onHandleColor: "#fff",
  uncheckedIcon: defaultUncheckedIcon,
  checkedIcon: defaultCheckedIcon,
  boxShadow: null,
  activeBoxShadow: "0 0 2px 3px #3bf",
  height: 28,
  width: 56
};

export default ReactSwitch;
