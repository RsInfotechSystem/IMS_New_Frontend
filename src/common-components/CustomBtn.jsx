"use client";

const CustomBtn = ({ name, onClick, svg, type, style, disabled }) => {
  return (
    <button
      className="custom_button"
      type={type}
      onClick={onClick}
      style={style}
      disabled={disabled}
    >
      <>{svg}</>
      <div className="">{name}</div>
    </button>
  );
};

export default CustomBtn;
