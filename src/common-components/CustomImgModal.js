"use client"
import { getServerUrl } from '@/services/communication'
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'


function CustomImgModal({ url, setModalImageStates }) {

    return (
        <>
            <div className="form_modal_wrapper">
                <div className="form_modal">

                    <div className="form_modal_header">
                        <h5 className="title"></h5>
                        <FontAwesomeIcon icon={faCircleXmark} onClick={() => setModalImageStates((prev) => ({ ...prev, showImg: false, url: "" }))} className="close_modal_icon" />
                    </div>
                    <div className="form_modal_body">
                        <Image src={`${getServerUrl()}/getFiles/${url}`} height={400}  alt="sbm" width={100} style={{width:"100%"}} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default CustomImgModal