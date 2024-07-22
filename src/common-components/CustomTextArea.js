import React from 'react'

function CustomTextArea({ placeholder, register, errors, disable }) {
    return (
        <>
            <textarea {...register} className="form-control custom_textarea" placeholder={placeholder} disabled={disable} />
            {errors && <p className="validation_message">{errors.message}</p>}
        </>
    )
}

export default CustomTextArea