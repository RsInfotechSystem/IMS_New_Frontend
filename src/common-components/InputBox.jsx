import React from "react";

const InputBox = ({
  type,
  placeholder,
  value,
  lefIcon,
  register,
  errors,
  disable,
  className,
  onChange,
  onBlur
}) => {
  return (
    <div className="custom_input_wrapper">
      {lefIcon && <div className="left_icon_wrapper">{lefIcon}</div>}
      <input
        type={type}
        {...register}
        value={value}
        className={`form-control custom_input ${className}`}
        style={{ paddingLeft: lefIcon ? 45 : "auto" }}
        placeholder={placeholder}
        // onChange={onChange}
        onBlur={onBlur}
        disabled={disable}
        onWheel={(e) => {
          e.target.blur();
        }}
      />
      {errors && <p className="validation_message">{errors.message}</p>}
    </div>
  );
};

export default InputBox;
