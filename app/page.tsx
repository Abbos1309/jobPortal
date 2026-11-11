import { ToastContainer } from "react-toastify";
import Advice from "./_components/Advice";
import Footer from "./_components/Footer";
import Journey from "./_components/Journey";
import Main from "./_components/Main";
import Navbar from "./_components/Navbar";
import Opportunity from "./_components/Oppurtinity";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} closeOnClick={true} />
      <Navbar/>
      <Main/>
      <Advice/>
      <Opportunity/>
      <Journey/>
      <Footer/>
    </div>
  );
}
