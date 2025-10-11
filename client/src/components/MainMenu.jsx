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

    async function getUpcoming() {
        const response = await fetch(`${REACT_APP_API_URL}/expiries/upcoming/`); 
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            console.error(message);
            alert("Failed to retrieve data. Please try again.")
            return;
        }
        const productData = await response.json();
        const storeHolidayArray = Object.keys(storeHolidays);

        // NEW PULLS AND DISCOUNTS CHECK
        let passedDate2 = new Date(new Date().toDateString());
        passedDate2 = addDaysToDate(passedDate2,1);
        while (true) {
            if ((storeClosedSunday == true && new Date(passedDate2).getDay() == 0) || storeHolidayArray.includes(new Date(passedDate2).toDateString())) {
                passedDate2 = addDaysToDate(passedDate2,1);
            } else {
                break;
            }
        }
        passedDate2 = addDaysToDate(passedDate2,-1);

        const pullData = 
        Object.entries(
            Object.groupBy(
                productData
                .filter((product) => !(product.demoProduct == true))
                .filter((product) => convertIntoTodaysDate(product.productExpiry) <= new Date(passedDate2))
                // .map((product) => {console.log(product); return{...product}})
                , product => product.productUPC
            )
        )
        .map(([k, v]) => ({ "products": v.sort((b,a) => new Date(a.productPullDate).getTime() - new Date(b.productPullDate).getTime())[0] }))
        .map((date) => date.products)

        const discountData = 
        productData.filter((product) => nonCreditVendors.includes(product.productVendor))
        .filter((product) => !(product.demoProduct == true))
        .filter((product) => product.productDiscounted == false)
        .map((product) => 
            {
                let businessDaysPassed3 = 0;
                while (true) {
                    if (convertIntoTodaysDate(addDaysToDate(product.productExpiry,businessDaysPassed3 * -1)).getDay() == 0 || storeHolidayArray.includes(convertIntoTodaysDate(addDaysToDate(product.productExpiry,businessDaysPassed3 * -1)).toDateString())) {
                        businessDaysPassed3++;
                    } else {
                        break;
                    }
                }
                for (let i = 0; i < 3; i++) {
                    while(true) {
                        businessDaysPassed3++;
                        if (!(convertIntoTodaysDate(addDaysToDate(product.productExpiry,businessDaysPassed3 * -1)).getDay() == 0 || storeHolidayArray.includes(convertIntoTodaysDate(addDaysToDate(product.productExpiry,businessDaysPassed3 * -1)).toDateString()))) {
                            break;
                        }
                    }
                }
                return {...product, productDiscountDate: convertIntoTodaysDate(addDaysToDate(product.productExpiry,businessDaysPassed3 * -1))}
            }
        )
        .filter((product) => new Date(product.productDiscountDate).getTime() <= new Date(new Date().toDateString()).getTime() )
        .map((product) => {
            return { ...product, productDiscountStatus: new Date(product.productDiscountDate).getTime() == new Date(new Date().toDateString()).getTime() ? "match" : "overdue" }
            }
        )
        // .map((product) => {console.log(product);return {...product}})

        // OLD PULLS AND DISCOUNTS CHECK
        // let businessDaysPassed = 0;
        // let passedDate = new Date(new Date().toDateString());
        // let totalDaysPassedPulls = ((storeClosedSunday == true && new Date(passedDate).getDay() == 0) || storeHolidayArray.includes(new Date(passedDate).toDateString())) ? -1 : 0;
        // let totalDaysPassedDiscounts = ((storeClosedSunday == true && new Date(passedDate).getDay() == 0) || storeHolidayArray.includes(new Date(passedDate).toDateString())) ? -1 : 0;
        // while(true) {
        //     passedDate = addDaysToDate(passedDate, 1);
        //     if (!((storeClosedSunday == true && new Date(passedDate).getDay() == 0) || storeHolidayArray.includes(new Date(passedDate).toDateString()))) {
        //         businessDaysPassed++;
        //     }
        //     totalDaysPassedDiscounts++;
        //     if (businessDaysPassed < 1) {
        //       totalDaysPassedPulls++;
        //     }
        //     if (businessDaysPassed == 4) {  // WAS 3
        //         break;
        //     }
        // }
        // totalDaysPassedDiscounts--; // NEW

        // const discountData = 
        // productData.filter((product) => nonCreditVendors.includes(product.productVendor))
        // .filter((product) => product.productDiscounted == false)
        // .filter((product) => !(product.demoProduct == true))
        // .map((product) => {
        //     return { ...product, productDiscountDate: convertIntoTodaysDate(addDaysToDate(product.productExpiry,(-1 * totalDaysPassedDiscounts))).toDateString() }
        //     }
        // )
        // .filter((product) => new Date(product.productDiscountDate).getTime() <= new Date(new Date().toDateString()).getTime() )
        // .filter((product) => convertIntoTodaysDate(product.productExpiry).getTime() >= new Date(new Date().toDateString()).getTime() )

        // const pullData =
        // Object.entries(
        //     Object.groupBy(
        //         productData
        //         .filter((product) => !(product.demoProduct == true))
        //         .map((product) => {
        //             return { ...product, productPullDate: convertIntoTodaysDate(addDaysToDate(product.productExpiry,(-1 * totalDaysPassedPulls))).toDateString() }
        //             }
        //         )
        //         .filter((product) => new Date(product.productPullDate).getTime() <= new Date(new Date().toDateString()).getTime() )
        //         , product => product.productUPC
        //     )
        // )
        // .map(([k, v]) => ({ "products": v.sort((a,b) => new Date(a.productPullDate).getTime() - new Date(b.productPullDate).getTime())[0] }))
        // .map((date) => date.products)

        setPulls(pullData);
        setDiscounts(discountData);
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
      // await fetch(`${REACT_APP_API_URL}/expiries/expiryRecords`, {
      //   method: "DELETE",
      // });

      try {
        await fetch(`${REACT_APP_API_URL}/expiries/expiryRecords`, {
          method: "DELETE",
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('A problem occurred with your fetch operation: ', error);
        alert("Failed to remove old records. Please try again.")
      }
    }

    // deleteOldRecords();
    // getPulls();
    // getDiscounts();
    getUpcoming();
    getSections();
    return;

  }, []);

  const Check = (props) => (
    <div id={props.section._id} className={`h-30 items-center ${props.section.section.length > 12 ? "pt-3 pb-3 lg:pt-3" : "pt-6 pb-6 lg:pt-3 lg:pb-3"} pb-3 border-2 border-black text-center font-serif text-xl font-bold ${props.section.needsChecking == true ? 'animate-flash' : ''} ${props.section.needsChecking ? "bg-red-400" : "bg-green-400"}`} onClick={()=>goToCheckPage(props.section._id)}>
      <div>{props.section.section}</div>
      <div className="text-sm">
        {props.section.needsChecking
        ? "Last Check Due:"
        : "Next Check:"
        }
      </div>
      <div className="text-sm">
        {props.section.nextCheckDate.toDateString().split(' ').slice(1).join(' ')}
      </div>
    </div>
  );

  const Month = (props) => (
    <div id={props.month.id} className="w-90 h-15 p-2 mb-4 border-2 border-black text-center font-serif text-l font-bold bg-orange-300" onClick={()=>getMonthlyReport(props.month.id)}>{props.month.name}</div>
  );

  const Week = (props) => (
    <div id={props.week.id} className="w-90 h-15 p-2 mb-4 border-2 border-black text-center font-serif text-l font-bold bg-yellow-300" onClick={()=>getWeeklyReport(props.week.id)}>{props.week.name}</div>
  );

  function goToCheckPage(sectionID) {
    navigate(`/check/${sectionID}`);
  }

  function sectionList() {
    const storeHolidayArray = Object.keys(storeHolidays);
    return sections
    .map((section) => { 
      const lastCheckDate = convertIntoTodaysDate(section.dateLastChecked);
      let nextCheckDate = null;
      if (section._id == "6795e982c4e5586be7dc5bfc") {
        let daysPassed = 1;
        while (true) {
          if (convertIntoTodaysDate(addDaysToDate(section.dateLastChecked,daysPassed)).getDay() == 3) {
            break;
          } else {
            daysPassed++;
          }
        }
        nextCheckDate = convertIntoTodaysDate(addDaysToDate(section.dateLastChecked,daysPassed));
      } else {
        nextCheckDate = convertIntoTodaysDate(addDaysToDate(section.dateLastChecked,section.intervalDays));
      }
      while(true) {
        if (!((storeClosedSunday == true && new Date(nextCheckDate).getDay() == 0) || storeHolidayArray.includes(new Date(nextCheckDate).toDateString()))) {
          break;
        }
        nextCheckDate = new Date(addDaysToDate(nextCheckDate,-1));
      }
      const needsChecking = nextCheckDate <= new Date();
      return {...section, lastCheckDate: lastCheckDate, nextCheckDate: nextCheckDate, needsChecking: needsChecking}
    })
    .map((section) => {
      return (
        <Check 
          key={section._id} 
          section={section} 
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

  function weeklyReportList() {
    const weekList = [];
    let d = new Date();
    let limitDateReached = false;

    // Do this 52 times:
    // If current day is Sunday
    // 	only have name as current (month, day, year)
    // Else
    // 	have last name as that (month, day, year)
    // 	go back until day is sunday
    // 	have first name as that (month, day, year)
    // 	separate them by dashes
    // Go back one day

    for (let i = 0; i < 52; i++) {
      let weekName = monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
      let weekID = ((d.getMonth() + 1) < 10 ? "0" : "") + String(d.getMonth() + 1) + String((d.getDate()) < 10 ? "0" : "") + String(d.getDate()) + String(d.getFullYear());
      if (d.getDay() != 0) {
        while(true) {
          d = new Date(addDaysToDate(d,-1));
          if (d.getMonth() == 3 && d.getDate() == 1 && d.getFullYear() == 2025) {
            limitDateReached = true;
            weekName = "Apr 1, 2025 - " + weekName;
            weekID = "04012025" + weekID;
            break;
          }
          if (d.getDay() == 0) {
            weekName = monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + " - " + weekName;
            weekID = ((d.getMonth() + 1) < 10 ? "0" : "") + String(d.getMonth() + 1) + String((d.getDate()) < 10 ? "0" : "") + String(d.getDate()) + String(d.getFullYear()) + weekID;
            break;
          }
        }
      } else {
        weekID = "" + weekID + weekID;
      }
      weekList.push(
        {
          id: weekID,
          name: weekName
        }
      );
      if (limitDateReached) {
        break;
      }
      d = new Date(addDaysToDate(d,-1));
    }
    return weekList.map((week) => {
      return (
        <Week key={week.id} week={week} />
      );
    });
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

  function getWeeklyReport(weekID) {
    navigate(`/weekReport/${weekID}`);
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
            <h3 className="text-2xl pb-4">Projection Reports</h3>
            <div className="">
              <div className="w-90 h-15 p-2 mb-4 border-2 border-black text-center font-serif text-l font-bold bg-blue-300" onClick={()=>navigate(`/projections/upcoming`)}>Pulls & Discounts For This Week</div>
              <div className="w-90 h-15 p-2 mb-4 border-2 border-black text-center font-serif text-l font-bold bg-blue-300" onClick={()=>navigate(`/projections/discounts`)}>Non-Credit Pulls - Next Two Weeks</div>
              <div className="w-90 h-15 p-2 mb-4 border-2 border-black text-center font-serif text-l font-bold bg-blue-300" onClick={()=>navigate(`/projections/vendors`)}>Upcoming Expiries By Vendor</div>
            </div>
          </div>
          <div className="pt-4">
            <h3 className="text-2xl pb-4">Monthly Write Off Reports</h3>
            <div className="">
                {reportList()}
            </div>
          </div>
          <div className="pt-4">
            <h3 className="text-2xl pb-4">Weekly Write Off Reports</h3>
            <div className="">
                {weeklyReportList()}
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