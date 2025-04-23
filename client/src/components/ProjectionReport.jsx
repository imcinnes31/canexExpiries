import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {REACT_APP_API_URL} from "../../index.js"

import {nonCreditVendors, addDays, fiveDigitJulianProducts, vendorArray, addDaysToDate, storeClosedSunday, storeHolidays} from "../constants.jsx"
import cross from "../assets/cross.png";

function convertToTodaysDate(dateGiven) {
    const convertDate = new Date(dateGiven);
    convertDate.setMinutes(convertDate.getMinutes() + convertDate.getTimezoneOffset());
    return convertDate;
}

function daysIntoFourJulian(date){
    const dayNumber = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
    return (dayNumber < 100 ? "0" : "") + (dayNumber < 10 ? "0" : "") + String(dayNumber) + String(date.getFullYear() - 2020 - 1);
}

function daysIntoFiveJulian(date){
    const dayNumber = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
    return String(date.getFullYear() - 2000 - 1) + (dayNumber < 100 ? "0" : "") + (dayNumber < 10 ? "0" : "") + String(dayNumber);
}

export default function ProjectionReport() {
    async function soldOutProduct(divID, date) {
        const prodUPC = divID.substring(0,12);
        const productExpiry = date;
        try {
            await fetch(`${REACT_APP_API_URL}/expiries/discounts/${prodUPC}&${productExpiry}`, {
                method: "DELETE",
            });
            const projectionDataFiltered = projectionData;
            for (const x in projectionData) {
                for (const y in projectionData[x].products) {
                    const pullNumbers = [];
                    if (projectionData[x].products[y].productUPC == prodUPC) {
                        pullNumbers.push(y);
                    }
                    for (const z in pullNumbers) {
                        projectionDataFiltered[x].products.splice(pullNumbers[z], 1);
                    }
                }
            }
            const projectionDataReduced = projectionDataFiltered;
            const pullDates = [];
            for (const x in projectionDataFiltered) {
                if (projectionDataFiltered[x].products.length == 0) {
                    pullDates.push(x);
                }
            }
            for (const z in pullDates) {
                projectionDataReduced.splice(pullDates[z], 1);
            }
            setCurrentDelete(null);
            setProjectionData(projectionDataReduced);
        } catch (error) {
          console.error('A problem occurred with your fetch operation: ', error);
          alert("Failed to remove expiry date from product. Please try again.")
        }
    }
        
    function Upcoming(props){
        const convertExpiryDate = convertToTodaysDate(props.product.productExpiry);
        return(
            props.id != currentDelete ?
            <tr id={props.id} className="h-10 border-none">
                <td className={`text-xl border-none pr-3 grow ${props.product.productVendor == "Tim Hortons" ? "text-black" : props.product.discount == true ? "text-blue-700" : nonCreditVendors.includes(props.product.productVendor) ? "text-green-700" : "text-red-600"}`}>{props.product.productName} {fiveDigitJulianProducts.includes(props.product.productUPC) ? "(Lot# " + daysIntoFiveJulian(convertExpiryDate) + ")" : props.product.productVendor == "M&M Food Market" ? "(Lot# " + daysIntoFourJulian(convertExpiryDate) + ")" : props.product.productSection == "Cottage Candy" ? "(Lot# " + daysIntoFiveJulian(convertExpiryDate) + ")" :""} {props.product.discount == true ? " - MARK AS 50% OFF": ""} {props.product.productExpiryNote != null ? " - " + props.product.productExpiryNote : null}</td>
                <td className="border-none w-15 print:hidden"><div className="border border-black bg-red-600 h-10 w-10 p-1" onClick={() => setCurrentDelete(props.id)}><img src={cross}/></div></td>
            </tr>
            :
            <tr id={props.id} className="h-10 border-none bg-red-200">
                <td colSpan="2">
                    <div className="text-center text-lg font-bold m-1">{`Confirm all items of ${props.product.productName} expiring ${convertExpiryDate.toDateString()} ${fiveDigitJulianProducts.includes(props.product.productUPC) ? "(Lot# " + daysIntoFiveJulian(convertExpiryDate) + ")" : props.product.productVendor == "M&M Food Market" ? "(Lot# " + daysIntoFourJulian(convertExpiryDate) + ")" : props.product.productSection == "Cottage Candy" ? "(Lot# " + daysIntoFiveJulian(convertExpiryDate) + ")" :""} are gone?`}</div>
                    <div className="flex">
                        <div className="w-1/2 bg-green-400 font-serif font-bold m-2 text-center border border-black" onClick={() => soldOutProduct(props.id,props.product.productExpiryNumber)}>Confirm</div>
                        <div className="w-1/2 bg-red-400 font-serif font-bold m-2 text-center border border-black" onClick={() => setCurrentDelete(null)}>Cancel</div>
                    </div>
                </td>
            </tr>
            // {/* <div className={`w-85 ${props.product.discount == true ? "text-blue-500" : nonCreditVendors.includes(props.product.productVendor) ? "text-green-700" : "text-red-600"}`}>{props.product.productName} {nonCreditVendors.includes(props.product.productVendor) && props.product.discount == true ? " - mark as 50% off" : null}</div>
            // <div className="w-10 h-10 border border-black bg-red-600 ml-5"></div> */}
        );
    }

    function Discount(props){
        const convertExpiryDate = convertToTodaysDate(props.product.productExpiry);
        return(
            <div>{props.product.productName} {fiveDigitJulianProducts.includes(props.product.productUPC) ? "(Lot# " + daysIntoFiveJulian(convertExpiryDate) + ")" : props.product.productVendor == "M&M Food Market" ? "(Lot# " + daysIntoFourJulian(convertExpiryDate) + ")" : props.product.productSection == "Cottage Candy" ? "(Lot# " + daysIntoFiveJulian(convertExpiryDate) + ")" :""}</div>
        );
    }

    function VendorProduct(props){
        return(
            <div>{props.product.productName}</div>
        );
    }

    function UpcomingDate(props){
        return(
            <div className="break-inside-avoid mb-6">
                <div className="text-2xl underline font-bold font-serif mb-2">{props.name}</div>
                <table className="w-full">
                    <tbody>
                    {
                        props.products.sort((a, b) => a.productVendor.localeCompare(b.productVendor)).sort((a, b) => a.productSection.localeCompare(b.productSection))
                        .map((product) => 
                            <Upcoming 
                                key={product.productUPC + product.productExpiryGroup.replace(" ","")}
                                id={product.productUPC + product.productExpiryGroup.replace(" ","")}
                                product={product}
                            />
                        )
                    }
                    </tbody>
                </table>
            </div>
        );
    }

    function DiscountDate(props){
        return(
            <div className="break-inside-avoid mb-6">
                <div className="text-2xl underline font-bold font-serif mb-2">{props.name}</div>
                {
                    props.products
                    .sort((a, b) => a.productVendor.localeCompare(b.productVendor)).sort((a, b) => a.productSection.localeCompare(b.productSection))
                    .map((product) => 
                        <Discount 
                            key={product.productUPC}
                            product={product}
                        />
                    )
                }
            </div>
        );
    }

    function VendorDate(props){
        return(
            <div className="break-inside-avoid mb-6">
                <div className="text-2xl underline font-bold font-serif mb-2">{props.name}</div>
                {
                    props.products
                    .map((product) => 
                        <VendorProduct 
                            key={product.productUPC}
                            product={product}
                        />
                    )
                }
            </div>
        );
    }

    function upcomingDateList() {
        return projectionData.map((a) => 
            <UpcomingDate 
                key={a.date}
                name={a.date}
                products={a.products}
            />
        );
    }

    function discountsDateList() {
        return projectionData.map((a) => 
            <DiscountDate 
                key={a.date}
                name={a.date}
                products={a.products}
            />
        );
    }

    function vendorDateList() {
        const vendorDataDict = projectionData.filter((product) => 
            {
                const convertedDate = convertToTodaysDate(product.productExpiry);
                return convertedDate <= addDays(currentRange * 7);
            }
        ).filter((product) => product.productVendor == currentVendor)
        .map((product) => {
            const convertDate = convertToTodaysDate(product.productExpiry);
            return { ...product, productExpiryGroup: convertDate.toDateString() }
        });
        const vendorDictDates = Object.groupBy(vendorDataDict, product => product.productExpiryGroup);
        const vendorDict = Object.entries(vendorDictDates).map(([date, values]) => ({ date, "products": values })).sort((a,b) => convertToTodaysDate(a.date).getTime() - convertToTodaysDate(b.date).getTime());
        // if (vendorDict.length > 0 && currentVendor != null) {
            return vendorDict.map((a) => 
                <VendorDate 
                    key={a.date}
                    name={a.date}
                    products={a.products}
                />
            );    
        // } else {
        //     return (
        //         <div className="text-2xl font-bold font-serif mb-2">There are no products for this vendor in this date range.</div>
        //     );
        // }
    }

    const params = useParams();
    const [projectionData, setProjectionData] = useState([]);
    const [currentDelete, setCurrentDelete] = useState(null);
    const [currentVendor, setCurrentVendor] = useState(null);
    const [currentRange, setCurrentRange] = useState(1);

    useEffect(() => {
        async function getProjections() {
            const response = await fetch(`${REACT_APP_API_URL}/expiries/projections/`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                alert("Failed to get report data. Please go back and try again.");
                return;
            }
            const reportData = await response.json();
            switch (params.type) {
                case "upcoming":
                    const storeHolidayArray = Object.keys(storeHolidays);
                    // console.log(storeHolidayArray);
                    const upcomingDiscounts = reportData.filter((product) => {
                        const convertDate = convertToTodaysDate(product.productExpiry);
                        // return convertDate >= addDays(3) && convertDate <= addDays(10);
                        return convertDate >= addDays(2) && convertDate < addDays(9);
                    }).filter((product) => nonCreditVendors.includes(product.productVendor))
                    .map((product) => {
                        const convertExpiryDate = convertToTodaysDate(product.productExpiry);
                        let businessDaysPassed = 0;
                        let totalDaysPassed = 0;
                        let passedDate = convertExpiryDate;
                        while(true) {
                            if (!((storeClosedSunday == true && convertToTodaysDate(passedDate).getDay() == 0) || storeHolidayArray.includes(convertToTodaysDate(passedDate).toDateString()))) { // Add holidays to this when function made
                                businessDaysPassed++;
                            }
                            passedDate = addDaysToDate(passedDate, -1);
                            totalDaysPassed++;
                            if (businessDaysPassed == 3) {
                                break;
                            }
                        }
                        // return { ...product, productExpiryGroup: new Date(convertExpiryDate.getTime() - ((convertExpiryDate.getDay() >= 1 && convertExpiryDate.getDay() <= 3 ? 4 : 3) * 86400000)).toDateString(), discount: true, productExpiryNumber: String(convertExpiryDate.getFullYear() + ("0" + (convertExpiryDate.getMonth() + 1)).slice(-2) + ("0" + convertExpiryDate.getDate()).slice(-2)), productExpiryNote: convertExpiryDate.getDay() == 0 ? "Expires Sunday" : null }
                        return { ...product, productExpiryGroup: new Date(convertExpiryDate.getTime() - ((totalDaysPassed) * 86400000)).toDateString(), discount: true, productExpiryNumber: String(convertExpiryDate.getFullYear() + ("0" + (convertExpiryDate.getMonth() + 1)).slice(-2) + ("0" + convertExpiryDate.getDate()).slice(-2)) }
                        }
                    );
                    const upcomingPulls = reportData.filter((product) => {
                        const convertExpiryDate = convertToTodaysDate(product.productExpiry);
                        // return convertDate < addDays(7);
                        return convertExpiryDate < addDays(7);
                    }).map((product) => {
                        const convertExpiryDate = convertToTodaysDate(product.productExpiry);
                        let businessDaysPassed = 0;
                        let totalDaysPassed = 0;
                        let passedDate = convertExpiryDate;
                        while(true) {
                            if (!((storeClosedSunday == true && convertToTodaysDate(passedDate).getDay() == 0) || storeHolidayArray.includes(convertToTodaysDate(passedDate).toDateString()))) { // Add holidays to this when function made
                                businessDaysPassed++;
                            }
                            passedDate = addDaysToDate(passedDate, 0);
                            totalDaysPassed++;
                            if (businessDaysPassed == 1) {
                                break;
                            }
                        }
                        // return { ...product, productExpiryGroup: new Date(convertExpiryDate.getTime() - ((convertExpiryDate.getDay() >= 1 && convertExpiryDate.getDay() <= 3 ? 4 : 3) * 86400000)).toDateString(), discount: true, productExpiryNumber: String(convertExpiryDate.getFullYear() + ("0" + (convertExpiryDate.getMonth() + 1)).slice(-2) + ("0" + convertExpiryDate.getDate()).slice(-2)), productExpiryNote: convertExpiryDate.getDay() == 0 ? "Expires Sunday" : null }
                        // return { ...product, productExpiryGroup: new Date(convertExpiryDate.getTime() - (totalDaysPassed * 86400000)).toDateString(), discount: true, productExpiryNumber: String(convertExpiryDate.getFullYear() + ("0" + (convertExpiryDate.getMonth() + 1)).slice(-2) + ("0" + convertExpiryDate.getDate()).slice(-2)) }
                        return { ...product, productExpiryNote: convertExpiryDate.getDay() == 0 ? "Expires Sunday" : storeHolidayArray.includes(convertToTodaysDate(convertExpiryDate).toDateString()) ? "Expires " + storeHolidays[convertToTodaysDate(convertExpiryDate).toDateString()]: null, productExpiryGroup: new Date(convertExpiryDate.getTime() - ((totalDaysPassed - 1) * 86400000)).toDateString(), productExpiryNumber: String(convertExpiryDate.getFullYear() + ("0" + (convertExpiryDate.getMonth() + 1)).slice(-2) + ("0" + convertExpiryDate.getDate()).slice(-2)) }
                        }
                    );
                    const upcomingPullsDiscounts = upcomingPulls.concat(upcomingDiscounts);
                    const upcomingDictDates = Object.groupBy(upcomingPullsDiscounts, product => product.productExpiryGroup);
                    const upcomingDict = Object.entries(upcomingDictDates).map(([date, values]) => ({ date, "products": values })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    setProjectionData(upcomingDict);
                    break;
                case "discounts":
                    const discountProducts = reportData.filter((product) => {
                        const convertDate = convertToTodaysDate(product.productExpiry);
                        return convertDate <= addDays(14);
                    }).filter((product) => nonCreditVendors.includes(product.productVendor))
                    .filter((product) => product.productDiscounted == false)
                    .map((product) => {
                        const convertDate = convertToTodaysDate(product.productExpiry);
                        return { ...product, productExpiry: new Date(convertDate.getTime() - ((convertDate.getDay() == 0 ? 1 : 0) * 86400000)).toDateString() }
                        }
                    );
                    const discountDictDates = Object.groupBy(discountProducts, product => product.productExpiry);
                    const discountsDict = Object.entries(discountDictDates).map(([date, values]) => ({ date, "products": values })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    setProjectionData(discountsDict);
                    break;
                case "vendors":
                    const vendorProducts = reportData.filter((product) => {
                        const convertDate = convertToTodaysDate(product.productExpiry);
                        return convertDate <= addDays(28);
                    }).filter((product) => !(nonCreditVendors.includes(product.productVendor)) && product.productVendor != "Tim Hortons")
                    setProjectionData(vendorProducts);
            }
        }
        getProjections();
        return;
    }, []);
    
    return (
        params.type == "upcoming" ?
        <div>
            <div className={"screen:hidden font-bold text-xl pl-1"}>4375 - Winnipeg</div>
            <div className={"font-bold text-xl pl-1"}>Upcoming Pulls and Discounts For</div>
            <div className={"font-bold text-xl pl-1"}>{addDays(0).toDateString()} to {addDays(7).toDateString()}</div>
            <div className={"font-bold text-xl pl-1 pb-3"}>On Products Entered by CANEX Expiry Date Tracker</div>

            <div className={"screen:hidden font-bold text-xl text-black pl-1"}>Legend:</div>
            <div className={"screen:hidden font-bold text-xl text-red-600 pl-1"}>Credit - Do Not Throw Out</div>
            <div className={"screen:hidden font-bold text-xl text-green-700 pl-1"}>Write Off And Dispose Of</div>
            <div className={"screen:hidden font-bold text-xl text-blue-700 pl-1 pb-7"}>Place 50% Off Discount Stickers</div>
            <div className="print:hidden w-15 h-15 p-2 my-2 mx-10 border-2 border-black text-center font-serif text-l font-bold bg-gray-200" onClick={() => window.print()}>Print Report</div>
            {upcomingDateList()}
        </div>
        : params.type == "discounts" ?
        <div>
            <div className={"screen:hidden font-bold text-xl pl-1"}>4375 - Winnipeg</div>
            <div className={"font-bold text-xl pl-1"}>Upcoming Non-Credit Write-Offs For Two Weeks</div>
            <div className={"font-bold text-xl pl-1 pb-7"}>For Products Entered by CANEX Expiry Date Tracker</div>
            <div className="print:hidden w-15 h-15 p-2 my-2 mx-10 border-2 border-black text-center font-serif text-l font-bold bg-gray-200" onClick={() => window.print()}>Print Report</div>
            {discountsDateList()}
        </div>
        : params.type == "vendors" ?
        <div>
            <div className={"screen:hidden font-bold text-xl pl-1"}>4375 - Winnipeg</div>
            {currentVendor != null ?
                <div className={"font-bold text-xl pl-1 pb-3"}>Upcoming Expiries For {currentVendor}, Next {currentRange * 7} Days</div>
            : null }
            <div className="print:hidden">
                <select defaultValue={'DEFAULT'} name="vendorMenu" onChange={(e) => setCurrentVendor(e.target.value)} className="border border-black p-1 rounded-md m-4 text-xl font-bold">
                    <option disabled value="DEFAULT">--Select Product Vendor</option>
                    {vendorArray.filter((vendor) => vendor != "Tim Hortons" && !(nonCreditVendors.includes(vendor))).map(function(option,idx) {
                        return <option key={idx}>{option}</option>;
                    })}
                </select>
            </div>
            <div className="print:hidden pb-5">
                <input className="w-7 h-7" type="radio" id="1Week" name="dateRange" value="1" defaultChecked={currentRange==1} onChange={(e) => setCurrentRange(e.target.value)}/>
                <label className="text-2xl" htmlFor="1Week">1 Week</label><br/>
                <input className="w-7 h-7" type="radio" id="2Weeks" name="dateRange" value="2" onChange={(e) => setCurrentRange(e.target.value)}/>
                <label className="text-2xl" htmlFor="2Weeks">2 Weeks</label><br/>
                <input className="w-7 h-7" type="radio" id="4Weeks" name="dateRange" value="4" onChange={(e) => setCurrentRange(e.target.value)}/>
                <label className="text-2xl" htmlFor="4Weeks">4 Weeks</label>
            </div>
            {currentVendor != null && vendorDateList().length > 0 ?
                <div>
                <div className="print:hidden w-15 h-15 p-2 my-2 mx-10 border-2 border-black text-center font-serif text-l font-bold bg-gray-200" onClick={() => window.print()}>Print Report</div>
                {vendorDateList()}
                </div>
                : currentVendor != null ?
                <div className="text-2xl font-bold font-serif mb-2">There are no products for this vendor in this date range.</div>
                : null
            }
            {/* <div>
                {vendorDateList()}
            </div> */}
        </div>
        : null
    );
}
