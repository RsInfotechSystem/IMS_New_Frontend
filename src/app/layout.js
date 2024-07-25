import { Suspense } from "react";
import { Inter } from "next/font/google";
import "@/styles/global.css";
import "@/styles/mediaQuery.css";
import 'bootstrap/dist/css/bootstrap.min.css'
// datepicker css 
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SBM",
  description: "Seasonable Bussiness Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/images/favicon.png" type="image/x-icon" />
      </head>
      <body className={inter.className}>
        <Suspense>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
