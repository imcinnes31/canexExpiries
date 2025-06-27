import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {monthNames, milkProducts, vendorList, addDays, titleCase, fiveDigitJulianProducts} from "../constants.jsx"
import {REACT_APP_API_URL} from "../../index.js"

import moment from "moment";
import cross from "../assets/cross.png";
import tick from "../assets/check.png";

export default function CheckSection() {
    const [currentSection, setCurrentSection] = useState({});
    const [currentUPC, setCurrentUPC] = useState("");
    const [currentProduct, setCurrentProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        productDesc: "",
        productSize: "",
        productSmallUPC: "",
        productVendor: null,
    });
    const [vendors, setVendors] = useState([]);
    const [currentDate, setCurrentDate] = useState(null);
    const [smallUPCProducts, setSmallUPCProducts] = useState([]);

    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        function getVendors() {
            const vendorArray = vendorList.map(vendor => vendor.name);
            setVendors(vendorArray);
        }
        async function getCurrentSection() {
            const response = await fetch(`${REACT_APP_API_URL}/expiries/sections/${params.id}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                alert("Failed to retrieve data. Please try again.")
                return;
            }
            const sectionData = await response.json();
            // const upcomingMonths = [];
            // for (let i = 0; i <= sectionData.expiryRange; i++) {
            //     const currentMonth = addDays(i).getMonth();
            //     const currentYear = addDays(i).getFullYear();
            //     if (!(upcomingMonths.includes(monthNames[currentMonth] + " " + currentYear))) {
            //         upcomingMonths.push(monthNames[currentMonth] + " " + currentYear);
            //     }
            // }
            // sectionData['upcomingMonths'] = upcomingMonths;
            const smallUPCDict = Object.fromEntries(sectionData.products.map(x => [x.smallUPC, x.productUPC]));
            setSmallUPCProducts(smallUPCDict);
            setCurrentSection(sectionData);
        }
        getVendors();
        getCurrentSection();
        return;
    }, []);

    async function checkInput(inputtedValue) {
        const numbers = /^[0-9]+$/;
        if (inputtedValue.length == 8 && inputtedValue.match(numbers)) {
            if (inputtedValue in smallUPCProducts) {
                inputtedValue = smallUPCProducts[inputtedValue];
            }
        }
        if (inputtedValue.length == 12 && inputtedValue.match(numbers)) {
            setCurrentUPC(inputtedValue);
            const response = await fetch(`${REACT_APP_API_URL}/expiries/products/${inputtedValue}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                alert("Failed to retrieve product data. Please try again.");
                setCurrentUPC("");
                return;
            }
            const productData = await response.json();
            setCurrentProduct(productData);
            window.scrollTo(0,0);
        } 
    }

    async function setMilk(givenUPC) {
        setCurrentUPC(givenUPC);
        const response = await fetch(`${REACT_APP_API_URL}/expiries/products/${givenUPC}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            console.error(message);
            alert("Failed to retrieve product data. Please try again.")
            setCurrentUPC("");
            return;
        }
        const productData = await response.json();
        setCurrentProduct(productData);
        window.scrollTo(0,0);
    }

    function cancelInput() {
        setCurrentDate(null);
        setCurrentProduct(null);
        setNewProduct({
            productDesc: "",
            productSize: "",
            productSmallUPC: "",
            productVendor: null,
        });
        window.scrollTo(0,0);
    }

    function updateNew(value) {
        return setNewProduct((prev) => {
            return { ...prev, ...value };
        });
    }

    async function enterNewProduct() {
        if (newProduct.productVendor && newProduct.productDesc.length > 0) {
            const numbers = /^[0-9]+$/;
            const newProductEntered = newProduct;
            newProductEntered.productDesc = titleCase(newProduct.productDesc);
            if (!(newProductEntered.productSmallUPC.length == 8 && newProductEntered.productSmallUPC.match(numbers))) {
                delete newProductEntered.productSmallUPC;
            } else {
                setSmallUPCProducts({
                    ...smallUPCProducts,
                    [newProductEntered.productSmallUPC]: currentUPC
                })
            }
            try {
                await fetch(`${REACT_APP_API_URL}/expiries/sections/${params.id}&${currentUPC}`, {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newProductEntered)
                });
                setNewProduct({
                    productDesc: "",
                    productSize: "",
                    productSmallUPC: "",
                    productVendor: null,
                });
            } catch (error) {
                console.error('A problem occurred with your fetch operation: ', error);
                alert("Failed to add new product. Please try again.")
            } finally {
                const response = await fetch(`${REACT_APP_API_URL}/expiries/products/${currentUPC}`);
                if (!response.ok) {
                    const message = `An error occurred: ${response.statusText}`;
                    console.error(message);
                    alert("Failed to retrieve product data. Please try again.")
                    return;
                }
                const productData = await response.json();
                setCurrentProduct(productData); 
                window.scrollTo(0,0);
            }
        }
    }

    async function enterExpiryDate(dateID) {
        const productUPC = currentUPC;
        const productExprity = dateID == null ? moment().subtract(1, "days").format("YYYYMMDD") : dateID.replace("confirm","");
        try {
            await fetch(`${REACT_APP_API_URL}/expiries/products/${productUPC}&${productExprity}`, {
                method: "PATCH",
            });
        } catch (error) {
            console.error('A problem occurred with your fetch operation: ', error);
            alert("Failed to add expiry date to product. Please try again.");
        } finally {
            setCurrentProduct(null);
            setCurrentDate(null);
            window.scrollTo(0,0);
        }
    }

    async function setNewCheckedDate() {
        try {
            await fetch(`${REACT_APP_API_URL}/expiries/sections/${params.id}`, {
                method: "PATCH",
            });
        } catch (error) {
            console.error('A problem occurred with your fetch operation: ', error);
            alert("Failed to mark section as checked. Please go back and hit Finished Checking Section button again.");
        } finally {
            navigate("/");
        }
    }

    function confirmCurrentDate(dateID, last) {
        if (last == true) {
            document.getElementById("pageBottom").scrollIntoView({behavior: 'smooth'});
        }
        setCurrentDate(dateID);
    }

    function daysIntoJulian(date){
        const dayNumber = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
        return (dayNumber < 100 ? "0" : "") + (dayNumber < 10 ? "0" : "") + String(dayNumber);
    }

    const DateSelect = (props) => (
        <div id={`${props.date.id}`} className="flex">
            {/* <div id={props.date.id} className="bg-green-400 h-10 my-4 pb-1 pt-1 border-2 border-black text-center font-serif text-xl font-bold" onClick={(e) => enterExpiryDate(e.target.id)}>{props.date.name}</div> */}
            <div className={`w-full ${currentDate == props.date.id ? 'animate-horizontalHide' : 'bg-green-400'} h-10 my-4 pb-1 pt-1 border-2 border-black text-center ${props.date.section == "Frozen" || props.date.section == "Cottage Candy" ? 'text-md' : 'text-xl'} font-bold`} onClick={(e) => confirmCurrentDate(props.date.id, props.date.last)}>{props.date.name}</div>
            <div className={`${currentDate == props.date.id ? 'animate-horizontalShow' : 'hidden'} bg-green-400 h-10 my-4 pb-1 pt-1 border-2 border-black text-center font-serif text-xl font-bold`} onClick={(e) => enterExpiryDate(props.date.id)}>
                <div className='flex'>
                    <div>Confirm</div>
                    <div className="w-7 ml-1"><img src={tick}/></div>
                </div>
            </div>
        </div>
    );

    const Milk = (props) => (
        <div id={props.milk.milkUPC} className="bg-yellow-400 h-10 my-4 pb-1 pt-1 border-2 border-black text-center font-serif text-xl font-bold" onClick={() => setMilk(props.milk.milkUPC)}>{props.milk.milkDesc}</div>
    );

    function dateList() {
        const expiryDateList = [];
        const alreadyExpiredDate = addDays(-1);
        expiryDateList.push({
            id: String(alreadyExpiredDate.getFullYear()) + ((alreadyExpiredDate.getMonth() + 1) < 10 ? "0" : "") + String(alreadyExpiredDate.getMonth() + 1) + (alreadyExpiredDate.getDate() < 10 ? "0" : "") + String(alreadyExpiredDate.getDate()),
            name: "Already Expired",
            last: false,
            section: currentSection.section,
            expiryMonth: alreadyExpiredDate.getMonth()
        });
        for (let i = 0; i <= currentSection.expiryRange; i++) {
            const d = addDays(i);
            if (currentSection.section == "Health & Beauty") {
                if (d.getDate() == 1) {
                    expiryDateList.push({
                        id: String(d.getFullYear()) + ((d.getMonth() + 1) < 10 ? "0" : "") + String(d.getMonth() + 1) + (d.getDate() < 10 ? "0" : "") + String(d.getDate()),
                        name: (monthNames[d.getMonth()] + " " + d.getFullYear()) + (currentSection.section == "Cottage Candy" || fiveDigitJulianProducts.includes(currentUPC) ? ` OR ${d.getFullYear() - 2000 - 1}${daysIntoJulian(d)}` : currentSection.section == "Frozen" ? ` OR ${daysIntoJulian(d)}${d.getFullYear() - 2020 - 1}` : ""),
                        last: i == currentSection.expriryRange ? true : false,
                        section: currentSection.section,
                        expiryMonth: d.getMonth()
                    });
                }
            } else {
                expiryDateList.push({
                    id: String(d.getFullYear()) + ((d.getMonth() + 1) < 10 ? "0" : "") + String(d.getMonth() + 1) + (d.getDate() < 10 ? "0" : "") + String(d.getDate()),
                    name: (monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear()) + (currentSection.section == "Cottage Candy" || fiveDigitJulianProducts.includes(currentUPC) ? ` OR ${d.getFullYear() - 2000 - 1}${daysIntoJulian(d)}` : currentSection.section == "Frozen" ? ` OR ${daysIntoJulian(d)}${d.getFullYear() - 2020 - 1}` : ""),
                    last: i == currentSection.expriryRange ? true : false,
                    section: currentSection.section,
                    expiryMonth: d.getMonth()
                });
            }
        }
        return expiryDateList.map((date) => {
            return (
                <DateSelect key={date.id} date={date}/>
            );
        });
    }

    function milkButtons() {
        const milkProductsArray = [
            {
                milkDesc: "Tim's Dispenser Cream",
                milkUPC: "057957101946"
            },
            {
                milkDesc: "Tim's Dispenser Milk",
                milkUPC: "057957101953"
            },
        ];
        for (const x in milkProducts) {
            for (const y in milkProducts[x].products) {
                milkProductsArray.push({milkDesc: milkProducts[x].products[y].longDesc + " " + milkProducts[x].size, milkUPC: milkProducts[x].products[y].productUPC})
            }
        }
        return milkProductsArray.map((milk) => {
            return (
                <Milk key={milk.milkUPC} milk={milk}/>
            );
        });
    }

    return (
        <div className="text-center">
            {currentProduct == null ?
                <div>
                    <div className="text-3xl font-serif pt-4">Current Section:</div>
                    <div className="text-2xl font-serif font-bold">{currentSection.section}</div>
                    <div className="text-2xl font-serif">Check for any products expiring until:</div>
                    {currentSection.section == "Health & Beauty" 
                        ?
                        <div className="text-2xl font-bold">{monthNames[addDays(currentSection.expiryRange).getMonth()] + " " + addDays(currentSection.expiryRange).getFullYear()}</div>
                        :
                        <div className="text-2xl font-bold">{monthNames[addDays(currentSection.expiryRange).getMonth()] + " " + addDays(currentSection.expiryRange).getDate() + " " + addDays(currentSection.expiryRange).getFullYear()}</div>
                    }
                    {/* <div className="text-2xl font-serif">Or any products where the expiry date just states the months of:</div>
                    <div className="text-2xl font-bold">{String(currentSection.upcomingMonths).split(",").join(", ")}</div> */}
                    { currentSection.section == "Frozen" ?
                        <div className="text-xl font-bold">
                            {(new Date().getFullYear()) == (addDays(currentSection.expiryRange).getFullYear()) ?
                                `(On M&M products, the four digit number ending in ${new Date().getFullYear() - 2020 - 1} and the first three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))}.)` 
                            : 
                                `(On M&M products, the four digit number ending in ${new Date().getFullYear() - 2020 - 1} and the first three digits equal to or less than ${new Date().getFullYear() % 4 == 0 ? 366 : 365} OR ending in ${addDays(currentSection.expriryRange).getFullYear() - 2020} and the first three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))})`
                            }
                            <br/>
                            {(new Date().getFullYear()) == (addDays(currentSection.expiryRange).getFullYear()) ?
                                `(Or on rare items, the five digit number beginning with ${new Date().getFullYear() - 2000 - 1} and the last three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))}.)` 
                            : 
                                `(Or on rare items, the five digit number beginning with ${new Date().getFullYear() - 2000 - 1} and the last three digits equal to or less than ${new Date().getFullYear() % 4 == 0 ? 366 : 365} OR beginning with ${addDays(currentSection.expiryRange).getFullYear() - 2000} and the last three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))})`
                            }
                        </div>   
                    : currentSection.section == "Cottage Candy" ?
                        <div className="text-xl font-bold">
                            {(new Date().getFullYear()) == (addDays(currentSection.expiryRange).getFullYear()) ?
                                `(On Cottage Candy, the five digit number beginning with ${new Date().getFullYear() - 2000 - 1} and the last three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))}.)` 
                            : 
                                `(On Cottage Candy, the five digit number beginning with ${new Date().getFullYear() - 2000 - 1} and the last three digits equal to or less than ${new Date().getFullYear() % 4 == 0 ? 366 : 365} OR beginning with ${addDays(currentSection.expiryRange).getFullYear() - 2000} and the last three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))})`
                            }
                        </div>
                    : currentSection.section == "Pastry" ?
                        <div className="text-xl font-bold">
                            {(new Date().getFullYear()) == (addDays(currentSection.expiryRange).getFullYear()) ?
                                `(On some products, the five digit number beginning with ${new Date().getFullYear() - 2000 - 1} and the last three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))}.)` 
                            : 
                                `(On some products, the five digit number beginning with ${new Date().getFullYear() - 2000 - 1} and the last three digits equal to or less than ${new Date().getFullYear() % 4 == 0 ? 366 : 365} OR beginning with ${addDays(currentSection.expiryRange).getFullYear() - 2000} and the last three digits equal to or less than ${daysIntoJulian(addDays(currentSection.expiryRange))})`
                            }
                        </div>
                    : null
                    }
                    <div className="text-xl font-bold pt-4">Input or Scan Product UPC:</div>
                    <input type="number" autoFocus={currentSection.section != "Dairy and Tims"} onInput={(e)=>checkInput(e.target.value)} onPaste={(e)=>checkInput(e.target.value)} className="my-3 text-2xl text-center border border-black rounded-md bg-gray-100"/>
                    {currentSection.section == "Dairy and Tims" ? 
                        <div>
                            <div className="text-center font-serif text-xl font-bold">Or choose a popular milk product:</div>
                            <div>{milkButtons()}</div>
                        </div> 
                    : 
                        null
                    }
                    <div className="bg-gray-300 border border-black m-2 text-xl font-bold py-1" onClick={()=> setNewCheckedDate()}>Finished Checking Section</div>
                </div>
            : currentProduct.length > 0 ?
                <div>
                    <div className="font-serif pt-6 text-xl font-bold">Current Product:</div>
                    <div className="text-xl">{currentProduct[0].name}</div>
                    <div className="flex pb-1 pt-4">
                        <div className="m-auto text-xl basis-64 font-bold">Choose Expiry Date:</div>
                        <div onClick={()=>cancelInput()} className="basis-32 bg-red-400 text-xl text-center font-bold border border-black rounded-lg flow flex py-1 justify-center">
                            <div>Cancel</div>
                            <div className="w-7 ml-1"><img src={cross}/></div>
                        </div>
                    </div>
                    {/* <div className="bg-green-400 h-10 my-4 pb-1 pt-1 border-2 border-black text-center font-serif text-xl font-bold" onClick={(e) => enterExpiryDate(null)}>Already Expired</div> */}
                    <div>{dateList()}</div>
                    <div className="h-10" id="pageBottom"></div>
                </div>
            :
                <div className="pt-6">
                    <div className="font-serif text-2xl">Product with UPC:</div>
                    <div className="text-xl">{currentUPC}</div>
                    <div className="font-serif text-2xl">Is Unknown.</div>
                    <div className="font-serif text-3xl pb-4">Enter Product Info:</div>
                    <div className="justify-items-center">
                        <div className="lg:w-1/2">
                            <div className="flex">
                                <div className="text-l m-auto font-bold lg:w-1/4">Product Name:</div>
                                <input onChange={(e) => updateNew({ productDesc: e.target.value})} type="text" className="px-2 border border-black text-xl lg:w-3/4"/>
                            </div>
                            <div className="flex">
                                <div className="text-l m-auto font-bold lg:w-1/4">Size (Optional):</div>
                                <input onChange={(e) => updateNew({ productSize: e.target.value})} type="text" className="px-2 border border-black text-xl lg:w-3/4"/>
                            </div>
                            <div className="flex">
                                <div className="text-l m-auto font-bold lg:w-1/4">Small UPC (If Exists):</div>
                                <input onChange={(e) => updateNew({ productSmallUPC: e.target.value})} type="text" className="px-2 border border-black text-xl lg:w-3/4"/>
                            </div>        
                        </div> 
                    </div>           
                    <select defaultValue={'DEFAULT'} name="vendorMenu" onChange={(e) => updateNew({ productVendor: e.target.value})} className="border border-black p-1 rounded-md m-4 text-xl font-bold">
                        <option disabled value="DEFAULT">--Select Product Vendor</option>
                        {vendors
                        .filter((vendor) => vendor != "Tim Hortons")
                        .filter((vendor) => vendor != "Farmers Favorite")
                        .filter((vendor) => vendor != "Quality Deli")
                        .map(function(i) {
                            return <option key={i.replace(" ","")}>{i}</option>;
                        })}
                    </select>
                    <div className="flex">
                        <div onClick={() => enterNewProduct()} className={`m-auto mr-0 basis-70 ${(newProduct.productVendor && newProduct.productDesc.length > 0) ? "bg-green-400" : "bg-green-100"} text-xl font-bold border border-black rounded-l-lg flex py-1 text-center justify-center`}>
                            <div>Enter New Product</div>
                            <div className="w-7 ml-1"><img src={tick}/></div>
                        </div>
                        <div onClick={()=>cancelInput()} className="m-auto ml-0 basis-30 bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center">
                            <div>Cancel</div>
                            <div className="w-7 ml-1"><img src={cross}/></div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}