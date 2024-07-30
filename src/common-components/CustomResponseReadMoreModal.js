import React from 'react';
import Button from './Button';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationTriangle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import CustomBtn from './CustomBtn';


const CustomResponseReadMoreModal = ({ status, message, successHandler, cancelHandler, cancelButton }) => {

  return (
    <>
      <div className="custom_response_handler_modal_wrapper read_more_modal">
        <div className="card">
       
          <div className="card_body">
            {/* <h5 className="card_title">Thank You !</h5> */}
            <p className="card-text">{message}</p>
            <div className="card_button">
              {/* <Button className="button btn-primary"  /> */}
              <CustomBtn   name={cancelButton ? cancelButton : "No"}  onClick={cancelHandler}></CustomBtn>
             
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CustomResponseReadMoreModal
