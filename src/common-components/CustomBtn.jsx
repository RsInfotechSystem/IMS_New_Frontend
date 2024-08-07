"use client";

const CustomBtn = ({ name, onClick, svg, type,style }) => {
  return (
    <button className="custom_button" type={type} onClick={onClick} style={style}>
      <>{svg}</>
      <div className="">{name}</div>
    </button>
  );
};

export default CustomBtn;
