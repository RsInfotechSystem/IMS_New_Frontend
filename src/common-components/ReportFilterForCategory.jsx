"use client";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SelectBox from "./Select";
import CustomBtn from "./CustomBtn";
import { useEffect, useState } from "react";
import { getCategory } from "@/services/commonApis";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

function ReportFilterForCategory({ setModalStates, apiCall, filter, setFilter }) {
  const [categoryList, setCategoryList] = useState([]);
  const router = useRouter();
  const { register, handleSubmit, setValue } = useForm();

  const handleCategory = (id) => {
    setFilter((pre) => ({ ...pre, categoryId: id }));
  };

  async function initialApiCall() {
    const categories = await getCategory();
    setCategoryList(categories);

    if (filter.categoryId) {
      handleCategory(filter.categoryId);
    }

    setValue("categoryId", filter?.categoryId ?? "");
  }

  async function submit(values) {
    try {
        // const payload = {
        //     categoryId: values.categoryId,
        //   };
      setFilter(values.categoryId);
    //   console.log(payload,"sssssssss");
      await apiCall(values.categoryId);
    //   reset(); 
      setModalStates((pre) => ({ filter: false }));
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    initialApiCall();
  }, []);

  return (
    <div className="form_modal_wrapper">
      <div className="form_modal" style={{ width: "55%" }}>
        <div className="form_modal_header">
          <h5 className="title">Filter by Category</h5>
          <FontAwesomeIcon
            icon={faCircleXmark}
            onClick={() => setModalStates((prev) => ({ ...prev, filter: false }))}
            className="close_modal_icon"
          />
        </div>
        <div className="form_modal_body">
          <div className="row">
            <div className="input_wrapper col-lg-4">
              <label>Category</label>
              <SelectBox
                options={categoryList}
                firstOption="Select Category"
                displayName={"name"}
                value={"_id"}
                register={{
                  ...register("categoryId"),
                }}
                selectedValue={filter?.categoryId ?? ""}
                onChange={(e) => handleCategory(e.target.value)}
              />
            </div>
          </div>
          <div className="form_button_wrapper mt-2">
            <CustomBtn name={"apply"} onClick={handleSubmit(submit)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportFilterForCategory;
