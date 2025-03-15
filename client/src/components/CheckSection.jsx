import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import moment from "moment";

// TODO: put try / catch blocks and if response not ok around fetches

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
const vendorArray = vendorList.map(vendor => vendor.name);

export default function CheckSection() {
    const [currentSection, setCurrentSection] = useState({});
    const [currentUPC, setCurrentUPC] = useState("");
    const [currentProduct, setCurrentProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        productDesc: "",
        productSize: "",
        productVendor: null,
    });

    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function getCurrentSection() {
            const response = await fetch(`http://localhost:5050/record/sections/${params.id}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const sectionData = await response.json();
            setCurrentSection(sectionData);
        }
        getCurrentSection();
        return;
    }, []);

    async function checkInput(inputtedValue) {
        const numbers = /^[0-9]+$/;
        if (inputtedValue.length == 12 && inputtedValue.match(numbers)) {
            setCurrentUPC(inputtedValue);
            const response = await fetch(`http://localhost:5050/record/products/${inputtedValue}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const productData = await response.json();
            setCurrentProduct(productData);
        }
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
            await fetch(`http://localhost:5050/record/sections/${params.id}&${currentUPC}`, {
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
            const response = await fetch(`http://localhost:5050/record/products/${currentUPC}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const productData = await response.json();
            setCurrentProduct(productData);            
        }
    }

    async function enterExpiryDate(dateID) {
        const productUPC = currentUPC;
        const productExprity = dateID == null ? moment().subtract(1, "days").format("YYYYMMDD") : dateID;
        await fetch(`http://localhost:5050/record/products/${productUPC}&${productExprity}`, {
            method: "PATCH",
        });
        setCurrentProduct(null);
    }

    async function setNewCheckedDate() {
        await fetch(`http://localhost:5050/record/sections/${params.id}`, {
            method: "PATCH",
        });
        // TODO: go back to main menu
        navigate("/expiryChecker");
    }

    const DateSelect = (props) => (
        <div id={props.date.id} className="h-20 pt-6 border-2 border-black text-center font-serif text-xl font-bold" onClick={(e) => enterExpiryDate(e.target.id)}>{props.date.name}</div>
      );

    function dateList() {
        const expiryDateList = [];
        for (let i = 0; i <= currentSection.intervalDays; i++) {
            const d = new Date(moment().add(i, "days"));
            expiryDateList.push(
            {
                id: String(d.getFullYear()) + ((d.getMonth() + 1) < 10 ? "0" : "") + String(d.getMonth() + 1) + (d.getDate() < 10 ? "0" : "") + String(d.getDate()),
                name: monthNames[d.getMonth()] + " " + d.getDate() + " ," + d.getFullYear()
            }
            );
        }
        return expiryDateList.map((date) => {
            return (
                <DateSelect key={date.id} date={date}/>
            );
        });
    }

    return (
        <div>
            <h1>{currentSection.section}</h1>
            <h3>{String(moment().add(currentSection.intervalDays, "days").format("MM-DD-YYYY"))}</h3>
            {currentProduct == null ?
                <div>
                    <p>Input product UPC</p>
                    <input type="number" onInput={(e)=>checkInput(e.target.value)} onPaste={(e)=>checkInput(e.target.value)}/>
                    <div onClick={()=> setNewCheckedDate()}>Finished Checking Section</div>
                </div>
            : currentProduct.length > 0 ?
                <div>
                    <p>Choose expiration date</p>
                    <div onClick={()=>cancelInput()}>Cancel</div>
                    <div className="h-20 pt-6 border-2 border-black text-center font-serif text-xl font-bold" onClick={(e) => enterExpiryDate(null)}>Already Expired</div>
                    <div>{dateList()}</div>
                </div>
            :
                <div>
                    <p>Input unknown product info</p>
                    <div onClick={()=>cancelInput()}>Cancel</div>
                    <input type="text" onChange={(e) => updateNew({ productDesc: (e.target.value).trim() })}/>
                    <input type="text" onChange={(e) => updateNew({ productSize: (e.target.value).trim() })}/>
                    <select name="vendorMenu" onChange={(e) => updateNew({ productVendor: e.target.value})}>
                        <option disabled selected>--Select Product Vendor</option>
                        {vendorArray.map(function(i) {
                            return <option key={i.replace(" ","")}>{i}</option>;
                        })}
                    </select>
                    <div onClick={() => enterNewProduct()}>Enter New Product</div>
                </div>
            }
            {/* if current product:
            name of product, cancel button, plus an "already expired" button, then array of date buttons
            if product unknown:
            put alert message, then two text fields, one for name and one for size, then select menu for vendor, then "enter" button and "cancel" button
            else:
            put text field that reacts when 12 digits in, only allow numbers, plus "done checking" button */}
        </div>
    );
}