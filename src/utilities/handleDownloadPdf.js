const { toast } = require("react-toastify");
import html2canvas from "html2canvas";
import jsPDF from 'jspdf'

// function to download html into pdf format
export const handleDownloadPdf = (reference, setModalStates) => {
    const pdfContent = reference.current;
    // Use html2canvas to capture the content of the DOM element
    html2canvas(pdfContent, {
        // You can customize options here if needed
    })
        .then((canvas) => {
            // Create a new jsPDF instance
            const pdf = new jsPDF({
                unit: "in",
                format: "letter",
                orientation: "portrait",
            });
            // Calculate the aspect ratio to fit the content on the PDF
            const ratio = canvas.width / canvas.height;
            const width = 8.5; // Letter size width in inches
            const height = width / ratio;
            // Add the captured canvas to the PDF
            pdf.addImage(
                canvas.toDataURL("image/jpeg", 1.0),
                "JPEG",
                0,
                0,
                width,
                height
            );
            // Save the PDF
            pdf.save("purchase-indent.pdf");
            toast.success("PDF downloaded Successfully!");
            setModalStates((prev) => ({ ...prev, viewPdf: false }));
        })
        .catch((error) => {
            toast.error("Error while downloading PDF:", error);
        });
};