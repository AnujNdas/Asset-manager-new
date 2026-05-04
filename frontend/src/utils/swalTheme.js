// utils/swalTheme.js
import Swal from "sweetalert2";

const ThemedSwal = Swal.mixin({
  background: "#222831",
  color: "#DFD0B8",
  confirmButtonColor: "#DFD0B8",
  cancelButtonColor: "#393E46",
  customClass: {
    popup: "swal-popup-dark",
    title: "swal-title-dark",
    htmlContainer: "swal-text-dark",
  }
});

export default ThemedSwal;