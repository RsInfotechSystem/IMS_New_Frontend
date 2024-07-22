"use client";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SelectBox = ({
  firstOption,
  options = [],
  displayName,
  otherDisplayName,
  value,
  disable = false,
  register,
  errors,
  defaultValue,
  selectedValue,
}) => {
  return (
    <div className="position-relative">
      <select
        {...register}
        className="form-control custom_input"
        disabled={disable}
      >
        <option value="" className="text-secondary text-lowercase">
          {firstOption}
        </option>
        {options?.map((data, index) => {
          return (
            <option
              className="small text-capitalize"
              key={index}
              value={value ? data[value] : data}
              defaultValue={value ? data[value] : data == defaultValue}
              selected={
                value ? data[value] === selectedValue : data === selectedValue
              }
            >
              {otherDisplayName ?
                `${data[displayName]} (${data[otherDisplayName]})`
                :
                displayName ? data[displayName] : data
              }
            </option>
          );
        })}
      </select>
      {errors && <p className="validation_message">{errors.message}</p>}
      <div className="select_box_arrow">
        <FontAwesomeIcon icon={faAngleDown} className="icon" />
      </div>
    </div>
  );
};

export default SelectBox;
