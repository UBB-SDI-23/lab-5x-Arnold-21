import { toast } from "react-toastify"

function ToasterError(message) {
    toast.error(message, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        });
}

export default ToasterError