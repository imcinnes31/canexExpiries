import { NavLink, useLocation } from "react-router-dom";
import canexLogo from "../assets/canex.png";

export default function Navbar() {
  return (
    <div>
    <div className="flex flex-row justify-end print:hidden">      
      {useLocation().pathname == "/canexExpiries/" ? null : <NavLink className="text-xl underline decoration-blue-400 text-blue-400" to="/canexExpiries/">Main Menu</NavLink>}
    </div>
      <img className="w-60 print:hidden" src={canexLogo}/>
      <div className="flex flex-row justify-end print:hidden">      
        <h5 className="font-serif text-2xl">Expiry Date Checker</h5>
      </div>
    </div>
  );
}