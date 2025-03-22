import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div className="w-full p-6">
    {/* <div className="w-full p-6 bg-[url('./assets/ExpiryForm3.png')]"> */}
      <Navbar />
      <Outlet />
    </div>
  );
};
export default App
