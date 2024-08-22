import React from 'react'
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-regular-svg-icons';

function CustomDateInput({ onChange, value, maxDate, disable, errorState, errorMessage, minDate }) {
    return (
        <>
            <DatePicker
                disableCalendar={disable}
                onChange={onChange}
                value={value}
                clearIcon={null}
                dayPlaceholder={"dd"}
                monthPlaceholder={"mm"}
                yearPlaceholder={"yyyy"}
                minDate={new Date()}
                // maxDate={![undefined, null, ""]?.includes(maxDate) ? new Date(maxDate) : new Date()}
                calendarIcon={<div className="input_calender_icon_wrapper"><FontAwesomeIcon icon={faCalendarDays} className="calender_icon" /></div>}
            />
            {errorState && <p className="validation_message">{errorMessage}</p>}
        </>
    )
}

export default CustomDateInput