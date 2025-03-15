import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import moment from "moment";

// TODO: get rid of all console logs
// TODO: put try / catch blocks and if response not ok around fetches
// TODO: get rid of annoying error messages
// TODO: see if animations can be synched

export default function MainMenu() {
    const [pulls, setPulls] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [sections, setSections] = useState([]);

    const navigate = useNavigate();

    // TODO: put these arrays in separate file
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
  ];

  const vendorList = [
    {
        name: "Direct Plus",
        credit: true
    },
    {
        name: "Lumsden Brothers",
        credit: true
    },
    {
        name: "Coca-Cola",
        credit: false
    },
    {
        name: "Pepsi",
        credit: false
    },
    {
        name: "Saputo",
        credit: false
    },
];

const nonCreditVendors = vendorList.filter(vendor => vendor.credit == false).map(vendor => vendor.name);

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
            const filteredDiscountData = discountsData.filter((product) => nonCreditVendors.includes(product['productVendor']));
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
        async function deleteOldRecords() {
          const response = await fetch(`http://localhost:5050/record/expiryRecords`, {
            method: "DELETE",
          });
          if (!response.ok) {
              const message = `An error occurred: ${response.statusText}`;
              console.error(message);
              return;
          }
        }
        deleteOldRecords();
        getPulls();
        getDiscounts();
        getSections();
        return;
      }, []);

      const Check = (props) => (
        <div id={props.section._id} className={`h-20 pt-6 border-2 border-black text-center font-serif text-xl font-bold ${!props.section.needsChecking ? 'bg-green-400' : 'animate-flash'}`} onClick={props.section.needsChecking ? ()=>goToCheckPage(props.section._id) : null}>{props.section.section}</div>
      );

      const Month = (props) => (
        <div id={props.month.id} className="h-20 pt-6 border-2 border-black text-center font-serif text-xl font-bold">{props.month.name} onClick={()=>getMonthlyReport(props.month.id)}</div>
      );

      function goToCheckPage(sectionID) {
        navigate(`/expiryChecker/check/${sectionID}`);
      }

      function sectionList() {
        return sections.map((section) => {
          return (
            <Check key={section._id} section={section} />
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
      // TODO: go to page with montly report
    }
    
    return (
        <div className="pt-4 text-center">
            <a href={pulls.length > 0 ? "expiryChecker/alert/pulls" : null}><div className={`w-90 h-10 p-2 mb-4 border-2 border-black text-center font-serif text-xl font-bold ${pulls.length == 0 ? 'bg-green-400' : 'animate-flash'}`}>{pulls.length == 0 ? "No Products to Pull" : "Products to Pull"}</div></a>
            <a href={discounts.length > 0 ? "expiryChecker/alert/discounts" : null}><div className={`w-90 h-10 p-2 mb-4 border-2 border-black text-center font-serif text-xl font-bold ${discounts.length == 0 ? 'bg-green-400' : 'animate-flash'}`}>{discounts.length == 0 ? "No Products to Discount" : "Products to Mark as 50% Off"}</div></a>
            <h1 className="text-3xl pb-4">Store Sections</h1>
            <div className="grid grid-cols-2 gap-4">
                {sectionList()}
            </div>
            <h3 className="text-xl pb-4">Monthly Write Off Reports</h3>
            <div className="">
                {reportList()}
            </div>
        </div>
    );
}