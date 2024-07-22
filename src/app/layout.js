import { Inter } from "next/font/google";
// import './globals.css'
// import "../styles/styles.css";
// import "../styles/media.css";
import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/css/bootstrap-icons.css";
// import "sweetalert2/dist/sweetalert2.min.css"; // Import default Swal CSS
// import "../styles/custom-styles.css"; // Import your custom styles CSS
// import "react-datepicker/dist/react-datepicker.css";
import "../styles/global.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Inventory Management",
  description: "Inventory Management next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
