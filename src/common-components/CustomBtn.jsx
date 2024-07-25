"use client";

const CustomBtn = ({ name, onClick, svg }) => {
  return (
    <button className="custom_button" onClick={onClick}>
      <>{svg}</>
      <div className="">{name}</div>
    </button>
  );
};

export default CustomBtn;
