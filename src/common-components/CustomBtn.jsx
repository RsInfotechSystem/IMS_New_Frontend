"use client";

const CustomBtn = ({ name, onClick, svg, type }) => {
  return (
    <button className="custom_button" type={type} onClick={onClick}>
      <>{svg}</>
      <div className="">{name}</div>
    </button>
  );
};

export default CustomBtn;
