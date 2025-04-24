import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";

import {monthNames, nonCreditVendors, storeHolidays, storeClosedSunday, addDaysToDate} from "../constants.jsx"
import canexLogo from "../assets/canex.png";
import {REACT_APP_API_URL} from "../../index.js"

function convertIntoTodaysDate(date) {
  const convertDate = new Date(date);
  convertDate.setMinutes(convertDate.getMinutes() + convertDate.getTimezoneOffset());
  return convertDate;
}

export default function MainMenu() {
  const [pulls, setPulls] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [sections, setSections] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    async function getPulls() {
      const response = await fetch(`${REACT_APP_API_URL}/expiries/products/`);
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        alert("Failed to retrieve pulls data. Please reload.");
        return;
      }
      const pullsData = await response.json();
      setPulls(pullsData);
    }
      
    async function getDiscounts() {
      const response = await fetch(`${REACT_APP_API_URL}/expiries/discounts/`);
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        console.error(message);
        alert("Failed to retrieve discounts data. Please reload.");
        return;
      }
      const discountsData = await response.json();
      const filteredDiscountData = discountsData.filter((product) => nonCreditVendors.includes(product['productVendor']));
      setDiscounts(filteredDiscountData);
    }

    async function getSections() {
      const response = await fetch(`${REACT_APP_API_URL}/expiries/sections/`);
      if (!response.ok) {
          const message = `An error occurred: ${response.statusText}`;
          console.error(message);
          alert("Failed to retrieve sections data. Please reload.");
          return;
      }
      const sectionsData = await response.json();
      const filteredSectionsData = sectionsData.filter((section) => !(section.demoSection == true));
      setSections(filteredSectionsData);
    }

    async function getUpcomingPulls() {
        const response = await fetch(`${REACT_APP_API_URL}/expiries/upcoming/`); 
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            console.error(message);
            alert("Failed to retrieve data. Please try again.")
            return;
        }
        const productData = await response.json();
        const storeHolidayArray = Object.keys(storeHolidays);
        let businessDaysPassed = 0;
        let totalDaysPassed = 0;
        let passedDate = new Date();
        while(true) {
            if (!((storeClosedSunday == true && new Date(passedDate).getDay() == 0) || storeHolidayArray.includes(new Date(passedDate).toDateString()))) {
                businessDaysPassed++;
            }
            passedDate = addDaysToDate(passedDate, 1);
            totalDaysPassed++;
            if (businessDaysPassed == 1) {
                break;
            }
        }
        const filteredProductData = 
        Object.entries(Object.groupBy(productData
        .filter((product) => convertIntoTodaysDate(product.productExpiry).getTime() <= new Date().getTime() )
        .map((product) => {
            return { ...product, productDiscountStatus: convertIntoTodaysDate(product.productExpiry).getTime() == (convertIntoTodaysDate(new Date().toISOString().split("T")[0])).getTime() ? "match" : "overdue" }
            }
        ), product => product.productUPC)).map(([k, v]) => ({ "products": v.sort((a,b) => convertIntoTodaysDate(b.productExpiry).getTime() - convertIntoTodaysDate(a.productExpiry).getTime())[0] }))
        .map(c => c.products).map((d) => {
            return { ...d, productDiscountStatus: convertIntoTodaysDate(d.productExpiry).getTime() == (convertIntoTodaysDate(new Date().toISOString().split("T")[0])).getTime() ? "match" : "overdue" }
            }
        )
        setPulls(filteredProductData);           
      }
      
      async function getUpcomingDiscounts() {
        const response = await fetch(`${REACT_APP_API_URL}/expiries/upcoming/`); 
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            console.error(message);
            alert("Failed to retrieve data. Please try again.")
            return;
        }
        const productData = await response.json();
        const storeHolidayArray = Object.keys(storeHolidays);
        let businessDaysPassed = 0;
        let totalDaysPassed = 0;
        let passedDate = new Date();
            while(true) {
                if (!((storeClosedSunday == true && new Date(passedDate).getDay() == 0) || storeHolidayArray.includes(new Date(passedDate).toDateString()))) {
                    businessDaysPassed++;
                }
                passedDate = addDaysToDate(passedDate, 1);
                totalDaysPassed++;
                if (businessDaysPassed == 3) {
                    break;
                }
            }
        const filteredProductData = 
        productData.filter((product) => nonCreditVendors.includes(product.productVendor))
        .filter((product) => product.productDiscounted == false)
        .map((product) => {
            return { ...product, productDiscountDate: (convertIntoTodaysDate(addDaysToDate(product.productExpiry,(-1 * totalDaysPassed))).toISOString().split("T")[0]) + "T00:00:00.000Z" }
            }
        )
        .filter((product) => convertIntoTodaysDate(product.productDiscountDate).getTime() <= convertIntoTodaysDate(new Date().toISOString().split("T")[0] + "T00:00:00.000Z").getTime() )
        .filter((product) => convertIntoTodaysDate(product.productExpiry).getTime() >= convertIntoTodaysDate(new Date().toISOString().split("T")[0] + "T00:00:00.000Z").getTime() )
        .map((product) => {
            return { ...product, productDiscountStatus: convertIntoTodaysDate(product.productDiscountDate).getTime() == (convertIntoTodaysDate(new Date().toISOString().split("T")[0])).getTime() ? "match" : "overdue" }
            }
        )
        setDiscounts(filteredProductData);
    }
      
    // function getFlashes() {
    //   const flashAlerts = {};
    //   flashAlerts['productsPull'] = pulls.length > 0;
    //   flashAlerts['productsDiscount'] = discounts.length > 0;
    //   for (const x in sections) {
    //     flashAlerts[sections[x]['_id']] = sections[x]['needsChecking'];
    //   }
    //   setFlashes(flashAlerts);
    // }
      
    async function deleteOldRecords() {
      const response = await fetch(`${REACT_APP_API_URL}/expiries/expiryRecords`, {
        method: "DELETE",
      });
    }

    deleteOldRecords();
    // getPulls();
    // getDiscounts();
    getUpcomingPulls();
    getUpcomingDiscounts();
    getSections();
    return;

  }, []);

  const Check = (props) => (
    <div id={props.section._id} className={`h-20 items-center ${props.section.section.length > 12 ? "pt-3" : "pt-6"} border-2 border-black text-center font-serif text-xl font-bold ${props.section.needsChecking == true ? 'animate-flash' : ''} ${props.section.needsChecking ? "bg-red-400" : "bg-green-400"}`} onClick={()=>goToCheckPage(props.section._id)}>{props.section.section}</div>
  );

  const Month = (props) => (
    <div id={props.month.id} className="w-90 h-15 p-2 mb-4 border-2 border-black text-center font-serif text-l font-bold bg-yellow-300" onClick={()=>getMonthlyReport(props.month.id)}>{props.month.name}</div>
  );

  function goToCheckPage(sectionID) {
    navigate(`/check/${sectionID}`);
  }

  function sectionList() {
    return sections.map((section) => {
      return (
        <Check 
          key={section._id} 
          section={section} 
          // flashes={flashes} 
        />
      );
    });
  }

  function subtractMonth(date, months) {
    let d = date.getDate();
    date.setMonth(date.getMonth() - months);
    if (date.getDate() != d) {
      date.setDate(0);
    }
    return date;
  }

  function reportList() {
    const monthList = [];
    for (let i = 0; i <= 12; i++) {
      let d = new Date();
      // if (d.getMonth() - i < 0) {
      //   d.setMonth(d.getMonth() + 12 - i);
      //   d.setFullYear(d.getFullYear() - 1);
      // } else {
      //   d.setMonth(d.getMonth() - i);
      // }
      d = subtractMonth(d,i);
      if (d.getFullYear() > 2025 || (d.getFullYear() == 2025 && (d.getMonth() + 1) >= 3)) {
        monthList.push(
          {
            id: ((d.getMonth() + 1) < 10 ? "0" : "") + String(d.getMonth() + 1) + String(d.getFullYear()),
            name: monthNames[d.getMonth()] + " " + d.getFullYear()
          }
        );
      }
    }
    return monthList.map((month) => {
      return (
        <Month key={month.id} month={month} />
      );
    });
  }

  function getMonthlyReport(monthID) {
    navigate(`/report/${monthID}`);
  }
  
  return (
    <div>
      {sections.length > 0 ?
        <div className="pt-4 text-center">
          <NavLink to={pulls.length > 0 ? "alert/pulls" : null}>
            <div className={`w-90 h-10 p-2 mb-4 border-2 border-black text-center font-serif text-xl font-bold ${pulls.length > 0 == true ? 'animate-flash' : ''} ${pulls.length > 0 ? "bg-red-400" : "bg-green-400"}`}>{pulls.length == 0 ? "No Products to Pull" : "Products to Pull"}</div>
          </NavLink>
          <NavLink to={discounts.length > 0 ? "alert/discounts" : null}>
            <div className={`w-90 h-10 p-2 mb-4 border-2 border-black text-center font-serif text-xl font-bold ${discounts.length > 0 == true ? 'animate-flash' : ''} ${discounts.length > 0 ? "bg-red-400" : "bg-green-400"}`}>{discounts.length == 0 ? "No Products to Discount" : "Products to Mark as 50% Off"}</div>
          </NavLink>
          <div className="px-3 py-2 bg-gray-200 border border-black">
            <h1 className="text-3xl pb-4">Store Sections</h1>
              <div className="grid grid-cols-2 gap-4 pb-4">
                  {sectionList()}
              </div>
          </div>
          <div className="pt-4">
            <h3 className="text-2xl pb-4">Monthly Write Off Reports</h3>
            <div className="">
                {reportList()}
            </div>
          </div>
          <div className="pt-4">
            <h3 className="text-2xl pb-4">Projection Reports</h3>
            <div className="">
              <div className="w-90 h-15 p-2 mb-4 border-2 border-black text-center font-serif text-l font-bold bg-blue-300" onClick={()=>navigate(`/projections/upcoming`)}>Pulls & Discounts For Next 7 Days</div>
              <div className="w-90 h-15 p-2 mb-4 border-2 border-black text-center font-serif text-l font-bold bg-blue-300" onClick={()=>navigate(`/projections/discounts`)}>Non-Credit Pulls - Next Two Weeks</div>
              <div className="w-90 h-15 p-2 mb-4 border-2 border-black text-center font-serif text-l font-bold bg-blue-300" onClick={()=>navigate(`/projections/vendors`)}>Upcoming Expiries By Vendor</div>
            </div>
          </div>
        </div>
      : 
        <div className="mt-10 justify-items-center">        
          <div className="h-50 w-80 overflow-hidden relative"><img className="print:hidden animate-load" src={canexLogo}/></div>
          <div className="h-50 text-3xl text-center font-bold">Loading...</div>
        </div>

      }
    </div>
  );
}