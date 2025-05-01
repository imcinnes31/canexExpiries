import { NavLink, useLocation } from "react-router-dom";

export default function Footer() {
    return (
      <div>
        <div className="flex flex-row justify-center print:hidden">      
          {useLocation().pathname == "/" ? null : <NavLink className="text-xl underline decoration-blue-400 text-blue-400" to="/">Main Menu</NavLink>}
        </div>
        <div className="text-xl font-bold text-center font-serif pt-10 print:hidden">
          ©2025 Ian McInnes, "Shock" Productions
        </div>
      </div>
    );
  }