"use client";

import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dynamic from "next/dynamic";
const Multiselect = dynamic(() => import("multiselect-react-dropdown"), {
  ssr: false,
});

const MultiSelect = ({
  placeholder,
  options = [],
  displayValue,
  selectedValues,
  showCheckbox = false,
  disable = false,
  keepSearchTerm = true,
  onSelect,
  onRemove,
  register,
  errors,
}) => {
  const multiselectStyling = {
    option: {
      // Style for options
      padding: "8px",
      borderBottom: "1px solid #D0D3D9",
      color: "#272727",
      backgroundColor: "#fff",
    },
    chips: {
      background: "#198754",
      color: "#fff",
      borderRadius: "4px",
      margin: "2px",
      padding: "4px 8px",
    },
    chip: {
      marginRight: "2px",
    },
  };
  return (
    <>
      <div className="position-relative">
        <Multiselect
          placeholder={placeholder}
          options={[...options]}
          displayValue={displayValue}
          selectedValues={selectedValues}
          showCheckbox={showCheckbox}
          disable={disable}
          keepSearchTerm={keepSearchTerm}
          onSelect={onSelect}
          onRemove={onRemove}
          style={multiselectStyling}
          {...register}
        />
        {errors && <p className="validation_message">{errors.message}</p>}
        <div className="select_box_arrow">
          <FontAwesomeIcon icon={faAngleDown} className="icon" />
        </div>
      </div>
    </>
  );
};

export default MultiSelect;
