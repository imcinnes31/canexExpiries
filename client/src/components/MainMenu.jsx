import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {monthNames, vendorList} from "../constants.jsx"

import moment from "moment";

export default function MainMenu() {
  const [pulls, setPulls] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [sections, setSections] = useState([]);
  const [flashes, setFlashes] = useState([]);
  const [nonCredits, setNonCredits] = useState([]);

  const navigate = useNavigate();

  function getFlashAnimate(component) {
    console.log(flashes[component]);
    return flashes[component];
  }

  useEffect(() => {
    function getNonCredits() {
      const nonCreditVendors = vendorList.filter(vendor => vendor.credit == false).map(vendor => vendor.name);
      setNonCredits(nonCreditVendors);
    }

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
      const filteredDiscountData = discountsData.filter((product) => nonCredits.includes(product['productVendor']));
      setDiscounts(filteredDiscountData);
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
      
    async function getFlashes() {
      const flashAlerts = {};
      flashAlerts['productsPull'] = pulls.length > 0;
      flashAlerts['productsDiscount'] = discounts.length > 0;
      for (const x in sections) {
        flashAlerts[sections[x]['_id']] = sections[x]['needsChecking'];
      }
      setFlashes(flashAlerts);
    }
      
    async function deleteOldRecords() {
      const response = await fetch(`http://localhost:5050/record/expiryRecords`, {
        method: "DELETE",
      });
    }

    deleteOldRecords();
    getNonCredits();
    getPulls();
    getDiscounts();
    getSections();
    getFlashes();
    return;

  }, []);

  const Check = (props) => (
    <div id={props.section._id} className={`h-20 pt-6 border-2 border-black text-center font-serif text-xl font-bold ${props.flashes[props.section._id] == true ? 'animate-flash' : 'bg-green-400'}`} onClick={()=>goToCheckPage(props.section._id)}>{props.section.section}</div>
  );

  const Month = (props) => (
    <div id={props.month.id} className="w-90 h-15 p-2 mb-4 border-2 border-black text-center font-serif text-l font-bold bg-yellow-300" onClick={()=>getMonthlyReport(props.month.id)}>{props.month.name}</div>
  );

  function goToCheckPage(sectionID) {
    navigate(`/expiryChecker/check/${sectionID}`);
  }

  function sectionList() {
    return sections.map((section) => {
      return (
        <Check key={section._id} section={section} flashes={flashes} />
      );
    });
  }

  function reportList() {
    const monthList = [];
    for (let i = 0; i <= 12; i++) {
      const d = new Date(moment().subtract(i, "month"));
      monthList.push(
        {
          id: ((d.getMonth() + 1) < 10 ? "0" : "") + String(d.getMonth() + 1) + String(d.getFullYear()),
          name: monthNames[d.getMonth()] + " " + d.getFullYear()
        }
      );
    }
    return monthList.map((month) => {
      return (
        <Month key={month.id} month={month} />
      );
    });
  }

  function getMonthlyReport(monthID) {
    navigate(`/expiryChecker/report/${monthID}`);
  }
  
  return (
    <div className="pt-4 text-center">
      <a href={pulls.length > 0 ? "/expiryChecker/alert/pulls" : null}>
        <div className={`w-90 h-10 p-2 mb-4 border-2 border-black text-center font-serif text-xl font-bold ${flashes['productsPull'] == true ? 'animate-flash' : 'bg-green-400'}`}>{pulls.length == 0 ? "No Products to Pull" : "Products to Pull"}</div>
      </a>
      <a href={discounts.length > 0 ? "/expiryChecker/alert/discounts" : null}>
        <div className={`w-90 h-10 p-2 mb-4 border-2 border-black text-center font-serif text-xl font-bold ${flashes['productsDiscount'] == true ? 'animate-flash' : 'bg-green-400'}`}>{discounts.length == 0 ? "No Products to Discount" : "Products to Mark as 50% Off"}</div>
      </a>
      <h1 className="text-3xl pb-4">Store Sections</h1>
      <div className="grid grid-cols-2 gap-4 pb-4">
          {sectionList()}
      </div>
      <h3 className="text-2xl pb-4">Monthly Write Off Reports</h3>
      <div className="">
          {reportList()}
      </div>
    </div>
  );
}