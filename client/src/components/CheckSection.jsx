import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {monthNames, milkProducts, vendorList, addDays} from "../constants.jsx"
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
        productVendor: null,
    });
    const [vendors, setVendors] = useState([]);
    const [currentDate, setCurrentDate] = useState(null);

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
                return;
            }
            const sectionData = await response.json();
            setCurrentSection(sectionData);
        }
        getVendors();
        getCurrentSection();
        return;
    }, []);

    async function checkInput(inputtedValue) {
        const numbers = /^[0-9]+$/;
        if (inputtedValue.length == 12 && inputtedValue.match(numbers)) {
            setCurrentUPC(inputtedValue);
            const response = await fetch(`${REACT_APP_API_URL}/expiries/products/${inputtedValue}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const productData = await response.json();
            setCurrentProduct(productData);
        }
    }

    async function setMilk(givenUPC) {
        setCurrentUPC(givenUPC);
        const response = await fetch(`${REACT_APP_API_URL}/expiries/products/${givenUPC}`);
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            console.error(message);
            return;
        }
        const productData = await response.json();
        setCurrentProduct(productData);
        window.scrollTo(0,0);
    }

    function cancelInput() {
        setCurrentProduct(null);
        setNewProduct({
            productDesc: "",
            productSize: "",
            productVendor: null,
        });
    }

    function updateNew(value) {
        return setNewProduct((prev) => {
            return { ...prev, ...value };
        });
    }

    async function enterNewProduct() {
        if (newProduct.productVendor && newProduct.productDesc.length > 0) {
            try {
                await fetch(`${REACT_APP_API_URL}/expiries/sections/${params.id}&${currentUPC}`, {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newProduct)
                });
                setNewProduct({
                    productDesc: "",
                    productSize: "",
                    productVendor: null,
                });
            } catch (error) {
                console.error('A problem occurred with your fetch operation: ', error);
            } finally {
                const response = await fetch(`${REACT_APP_API_URL}/expiries/products/${currentUPC}`);
                if (!response.ok) {
                    const message = `An error occurred: ${response.statusText}`;
                    console.error(message);
                    return;
                }
                const productData = await response.json();
                setCurrentProduct(productData); 
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
        } finally {
            navigate("/");
        }
    }

    function confirmCurrentDate(dateID) {
        setCurrentDate(dateID);
    }

    function daysIntoYear(date){
        const dayNumber = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
        return (dayNumber < 100 ? "0" : "") + (dayNumber < 10 ? "0" : "") + String(dayNumber);
    }

    const DateSelect = (props) => (
        <div id={`${props.date.id}`} className="flex">
            {/* <div id={props.date.id} className="bg-green-400 h-10 my-4 pb-1 pt-1 border-2 border-black text-center font-serif text-xl font-bold" onClick={(e) => enterExpiryDate(e.target.id)}>{props.date.name}</div> */}
            <div className={`w-full ${currentDate == props.date.id ? 'animate-horizontalHide' : 'bg-green-400'} h-10 my-4 pb-1 pt-1 border-2 border-black text-center font-serif text-xl font-bold`} onClick={(e) => confirmCurrentDate(props.date.id)}>{props.date.name}</div>
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
        for (let i = -1; i <= currentSection.expiryRange; i++) {
            const d = addDays(i);
            expiryDateList.push({
                id: String(d.getFullYear()) + ((d.getMonth() + 1) < 10 ? "0" : "") + String(d.getMonth() + 1) + (d.getDate() < 10 ? "0" : "") + String(d.getDate()),
                name: i == - 1 ? "Already Expired" : (monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear())
            });
        }
        return expiryDateList.map((date) => {
            return (
                <DateSelect key={date.id} date={date}/>
            );
        });
    }

    function milkButtons() {
        const milkProductsArray = [];
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
                    <div className="text-2xl font-bold">{monthNames[addDays(currentSection.expiryRange).getMonth()] + " " + addDays(currentSection.expiryRange).getDate() + " " + addDays(currentSection.expiryRange).getFullYear()}</div>
                    { currentSection.section == "Frozen" ?
                        <div className="text-lg">
                            {(new Date().getFullYear()) == (addDays(currentSection.expiryRange).getFullYear()) ?
                                `(On M&M products, the four digit number ending in ${new Date().getFullYear() - 2020} and the first three digits equal to or less than ${daysIntoYear(addDays(currentSection.intervalDays))}.)` 
                            : 
                                `(On M&M products, the four digit number ending in ${new Date().getFullYear() - 2020} and the first three digits equal to or less than ${new Date().getFullYear() % 4 == 0 ? 366 : 365} OR ending in ${addDays(currentSection.intervalDays).getFullYear() - 2020} and the first three digits equal to or less than ${daysIntoYear(addDays(currentSection.intervalDays))})`
                            }
                        </div>
                    :
                        null
                    }
                    <div className="text-xl font-bold pt-4">Input or Scan Product UPC:</div>
                    <input type="number" autoFocus={currentSection.section != "Dairy"} onInput={(e)=>checkInput(e.target.value)} onPaste={(e)=>checkInput(e.target.value)} className="my-3 text-2xl text-center border border-black rounded-md bg-gray-100"/>
                    {currentSection.section == "Dairy" ? 
                        <div>
                            <div className="text-center font-serif text-xl font-bold">Or choose milk product:</div>
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
                </div>
            :
                <div className="pt-6">
                    <div className="font-serif text-2xl">Product with UPC:</div>
                    <div className="text-xl">{currentUPC}</div>
                    <div className="font-serif text-2xl">Is Unknown.</div>
                    <div className="font-serif text-3xl pb-4">Enter Product Info:</div>
                    <div className="flex">
                        <div className="text-l m-auto font-bold">Product Name:</div>
                        <input type="text" onChange={(e) => updateNew({ productDesc: (e.target.value).trim() })} className="border border-black text-l"/>
                    </div>
                    <div className="flex">
                        <div className="text-l m-auto font-bold">Size (Optional):</div>
                        <input type="text" onChange={(e) => updateNew({ productSize: (e.target.value).trim() })} className="border border-black text-l"/>
                    </div>
                    <select defaultValue={'DEFAULT'} name="vendorMenu" onChange={(e) => updateNew({ productVendor: e.target.value})} className="border border-black p-1 rounded-md m-4 text-xl font-bold">
                        <option disabled value="DEFAULT">--Select Product Vendor</option>
                        {vendors.map(function(i) {
                            return <option key={i.replace(" ","")}>{i}</option>;
                        })}
                    </select>
                    <div className="flex">
                        <div onClick={() => enterNewProduct()} className="m-auto basis-70 bg-green-400 text-xl font-bold border border-black rounded-l-lg flex py-1 text-center justify-center">
                            <div>Enter New Product</div>
                            <div className="w-7 ml-1"><img src={tick}/></div>
                        </div>
                        <div onClick={()=>cancelInput()} className="m-auto basis-30 bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center">
                            <div>Cancel</div>
                            <div className="w-7 ml-1"><img src={cross}/></div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}