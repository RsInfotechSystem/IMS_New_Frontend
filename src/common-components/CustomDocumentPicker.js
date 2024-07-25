
import { getServerUrl } from '@/services/communication';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';

function CustomDocumentPicker({ label, name, fileUrl, register, errors }) {
    return (
        <>
            <div className="document_picker_wrapper">
                <h6>{label}</h6>
                <label htmlFor={label}>
                    <div className="document_picker">
                        <input accept="image/*,.png" type="file" {...register} className="d-none" id={label} />
                        {
                            ![null, undefined, ""].includes(fileUrl) ?
                                <>
                                    <Image alt={name} width={200} height={200} src={typeof fileUrl === "object" ? URL.createObjectURL(fileUrl) : `${getServerUrl()}/getFiles/${fileUrl}`} />
                                    <p>{name?.split(".")[0]?.slice(0, 10)}.{name?.split(".")[1]}</p>
                                </> :
                                <FontAwesomeIcon icon={faCirclePlus} className="icon fontAwesome_icon" />

                        }
                    </div>
                </label>
            </div>
            {errors && <p className="validation_message">{errors.message}</p>}
        </>
    )


}

export default CustomDocumentPicker