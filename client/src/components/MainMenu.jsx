import { useState, useEffect } from "react";

export default function MainMenu() {
    const [pulls, setPulls] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [sections, setSections] = useState([]);

      useEffect(() => {
        async function getPulls() {
          const response = await fetch(`http://localhost:5050/record/products/`);
          if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            console.error(message);
            return;
          }
          const pullsData = await response.json();
          setPulls(pullsData);
        }
        async function getDiscounts() {
            const response = await fetch(`http://localhost:5050/record/discounts/`);
            if (!response.ok) {
              const message = `An error occurred: ${response.statusText}`;
              console.error(message);
              return;
            }
            const discountsData = await response.json();
            setDiscounts(discountsData);
        }
        async function getSections() {
            const response = await fetch(`http://localhost:5050/record/sections/`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const sectionsData = await response.json();
            setSections(sectionsData);
        }
        getPulls();
        getDiscounts();
        getSections();
        return;
      }, []);

      const Check = (props) => (
        <div id={props.key} className={`h-20 pt-6 border-2 border-black text-center font-serif text-xl font-bold ${!props.section.needsChecking ? 'bg-green-400' : 'animate-flash'}`}>{props.section.section}</div>
      );

      function sectionList() {
        return sections.map((section) => {
          return (
            <Check key={section._id} section={section} />
          );
        });
      }
    
    return (
        <div className="pt-4 text-center">
            <a href="javascript:void(0);"><div className={`w-90 h-10 p-2 mb-4 border-2 border-black text-center font-serif text-xl font-bold ${pulls.length == 0 ? 'bg-green-400' : 'animate-flash'}`}>{pulls.length == 0 ? "No Products to Pull" : "Products to Pull"}</div></a>
            <a href="javascript:void(0);"><div className={`w-90 h-10 p-2 mb-4 border-2 border-black text-center font-serif text-xl font-bold ${discounts.length == 0 ? 'bg-green-400' : 'animate-flash'}`}>{discounts.length == 0 ? "No Products to Discount" : "Products to Mark as 50% Off"}</div></a>
            <h1 className="text-3xl pb-4">Store Sections</h1>
            <div className="grid grid-cols-2 gap-4">
                {sectionList()}
            </div>
        </div>
    );
}