import React from 'react';
import Button from './Button';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationTriangle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";


const CustomResponseHandlerModal = ({ status, message, successHandler, cancelHandler }) => {

  return (
    <>
      <div className="custom_response_handler_modal_wrapper">
        <div className="card">
          <div className="modal_header_icon">
            {status === "success" && <FontAwesomeIcon icon={faCheckCircle} color="green" />}
            {status === "warning" && <FontAwesomeIcon icon={faExclamationTriangle} color="orange" />}
            {status === "error" && <FontAwesomeIcon icon={faTimesCircle} color="red" />}
          </div>
          <div className="card_body">
            {/* <h5 className="card_title">Thank You !</h5> */}
            <p className="card-text">{message}</p>
            <div className="card_button">
              <Button name="No" className="button btn-primary" onClick={cancelHandler} />
              <Button name="Yes" className="button btn-primary" onClick={successHandler} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CustomResponseHandlerModal
