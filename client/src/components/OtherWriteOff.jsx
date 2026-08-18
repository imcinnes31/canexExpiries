import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {vendorList, titleCase} from "../constants.jsx"
import {REACT_APP_API_URL} from "../../index.js"

import Barcode from 'react-barcode';
import cross from "../assets/cross.png";
import tick from "../assets/check.png";

export default function OtherWriteOff() {
    const [sections, setSections] = useState({});
    const [sectionSelect, setSectionSelect] = useState(null);
    const [reason, setReason] = useState(null);
    const [amount, setAmount] = useState(0);
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
    const [smallAlert, setSmallAlert] = useState(null);

    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        function getVendors() {
            setVendors(vendorList);
        }
        async function getSectionNames() {
            const response = await fetch(`${REACT_APP_API_URL}/expiries/sections/`); 
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                alert("Failed to retrieve data. Please try again.")
                return;
            }
            const sectionData = await response.json();

            const filteredSectionData = 
                sectionData.filter(section => section.sectionNumber > 0).sort((a, b) => a.sectionNumber - b.sectionNumber);

            setSections(filteredSectionData);
        }
        getVendors();
        getSectionNames();
        return;
    }, []);

    async function checkInput(inputtedValue) {
        const numbers = /^[0-9]+$/;
        if (inputtedValue.length == 8 && inputtedValue.match(numbers)) {
            if (inputtedValue in smallUPCProducts) {
                inputtedValue = smallUPCProducts[inputtedValue];
            } else {
                setSmallAlert("If you are currently entering a small barcode, it is not recognized. Bring it to Product Lookup and find the full UPC and enter it.")
            }
        } else {
            setSmallAlert(null);
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

    function cancelInput() {
        setCurrentProduct(null);
        setSectionSelect(null);
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
        if (sectionSelect && newProduct.productVendor && newProduct.productDesc.length > 0) {
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
                await fetch(`${REACT_APP_API_URL}/expiries/sections/${sectionSelect}&${currentUPC}`, {
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
                setSectionSelect(null);
                setReason(null);
                setAmount(0);
                setCurrentProduct(productData); 
                window.scrollTo(0,0);
            }
        }
    }

    async function writeOffProduct() {
        if (reason && amount > 0) {
            try {
                await fetch(`${REACT_APP_API_URL}/expiries/expiryRecords/${currentUPC}&${amount}&${reason}`, {
                    method: "POST",
                });
            } catch (error) {
                console.error('A problem occurred with your fetch operation: ', error);
                console.error(error);
                alert("Failed to write off product. Please try again.")
            } finally {
                setCurrentProduct(null);
                setReason(null);
                setAmount(0);
            }
        }
    }


    const nonCreditVendors = vendorList.filter(vendor => vendor.credit == false).map(vendor => vendor.name);
    return (
        <div className="text-center">
            {currentProduct == null ?
                <div>
                    <div className="text-3xl font-serif pt-4">Other Write Offs</div>
                    <div>
                        <div className="text-xl font-bold pt-4">Input or Scan Product UPC:</div>
                        <input type="text" inputmmode="numeric" pattern="[0-9]*" autoFocus onInput={(e)=>checkInput(e.target.value)} onPaste={(e)=>checkInput(e.target.value)} className="my-3 text-2xl text-center border border-black rounded-md bg-gray-100"/>
                        <div className="text-lg text-red-600 font-bold py-1">{smallAlert}</div>
                    </div>
                </div>
            : currentProduct.length > 0 ?
                <div>
                    <div className="font-serif pt-6 text-xl font-bold">Current Product:</div>
                    <div className="text-xl">{currentProduct[0].name}</div>
                    <div>
                        { nonCreditVendors.includes(currentProduct[0].vendor) ?
                            <div>
                                <div>
                                    <select defaultValue={'DEFAULT'} name="reasonMenu" onChange={(e) => setReason(e.target.value)} className={`${reason ? 'border-2 border-black' : 'border-2 border-red-500'} p-1 rounded-md m-4 text-xl font-bold`}>
                                        <option disabled value={'DEFAULT'}>--Select Write Off Reason</option>
                                        <option value="damaged">Damaged</option>
                                        <option value="store">Store Use</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                                <div className="flex m-2 justify-center">
                                    <div className="text-lg font-bold mx-2">Write Off Amount:</div>
                                    <select name="writeOffAmount" value={amount} onChange={(e) => setAmount(e.target.value)} className={`${amount > 0 ? 'border-2 border-black' : 'border-2 border-red-500'} text-xl basis-24 font-bold rounded-md`}>
                                        {Array.from(Array(50), (e, i) => {
                                            return <option key={i}>{i}</option>
                                        })}
                                    </select>
                                </div>
                                <div className="flex">
                                    <div onClick={() => writeOffProduct()} className={`m-auto mr-0 basis-70 ${(reason && amount > 0) ? "bg-green-400" : "bg-green-100"} text-xl font-bold border border-black rounded-l-lg flex py-1 text-center justify-center`}>
                                        <div>Write Off Product</div>
                                        <div className="w-7 ml-1"><img src={tick}/></div>
                                    </div>
                                    <div onClick={() => {setCurrentProduct(null);setReason(null)}} className="m-auto ml-0 basis-30 bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center">
                                        <div>Cancel</div>
                                        <div className="w-7 ml-1"><img src={cross}/></div>
                                    </div>
                                </div>
                            </div>
                        :
                            <div className="justify-center">
                                <div className="text-lg font-bold text-red-600 mt-4">This product cannot be written off for store use. If damaged or expired, place all of the product in the back for the vendor to pick up.</div>  
                                <div onClick={() => setCurrentProduct(null)} className="mx-auto my-2 w-1/4 basis-30 bg-red-400 text-xl text-center font-bold border border-black rounded-lg flex py-1 justify-center">
                                    <div>Back</div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            :
                <div className="pt-6">
                    <div className="font-serif text-2xl">Unknown product with UPC:</div>
                    <div className="justify-items-center">
                        <Barcode 
                            value={currentUPC} 
                            format="CODE128" 
                            width={2} 
                            height={75}
                            displayValue={true}
                        />
                    </div>
                    <div className="font-serif text-3xl pb-4">Scan Barcode in Product Lookup and Enter Info:</div>
                    <div className="justify-items-center">
                        <div className="lg:w-1/2">
                            <div className="flex">
                                <div className="text-l m-auto font-bold lg:w-1/4">Product Name:</div>
                                <input onChange={(e) => updateNew({ productDesc: e.target.value})} type="text" placeholder="Enter Product Name" className={`${newProduct.productDesc ? 'border-2 border-black' : 'border-2 border-red-500'} px-2 text-xl lg:w-3/4`}/>
                            </div>
                            <div className="flex">
                                <div className="text-l m-auto font-bold lg:w-1/4">Size (Optional):</div>
                                <input onChange={(e) => updateNew({ productSize: e.target.value})} type="text" className="px-2 border-2 border-black text-xl lg:w-3/4"/>
                            </div>
                            <div className="flex">
                                <div className="text-l m-auto font-bold lg:w-1/4">Small UPC (If Exists):</div>
                                <input onChange={(e) => updateNew({ productSmallUPC: e.target.value})} type="text" className="px-2 border-2 border-black text-xl lg:w-3/4"/>
                            </div>
                        </div> 
                    </div>
                    <div className="flex flex-col">
                        <select defaultValue={'DEFAULT'} name="vendorMenu" onChange={(e) => updateNew({ productVendor: e.target.value})} className={`${newProduct.productVendor ? 'border-2 border-black' : 'border-2 border-red-500'} p-1 rounded-md mx-4 my-2 text-xl font-bold`}>
                            <option disabled value="DEFAULT">--Select Product Vendor</option>
                            {vendors
                            // .filter((vendor) => vendor != "Tim Hortons")
                            // .filter((vendor) => vendor != "Farmers Favorite")
                            // .filter((vendor) => vendor != "Quality Deli")
                            .map(function(vendor) {
                                return <option key={vendor.name.replace(" ","")}>{vendor.name}</option>;
                            })}
                        </select>
                        <select defaultValue={'DEFAULT'} onChange={(e) => setSectionSelect(e.target.value)} className={`${sectionSelect ? 'border-2 border-black' : 'border-2 border-red-500'} p-1 rounded-md mx-4 my-2 text-xl font-bold`}>
                            <option disabled value="DEFAULT">--Select Product Section</option>
                            {Object.entries(sections).map(([key, value]) => (
                                <option key={key} id={value._id} value={value._id}>{value.section}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex">
                        <div onClick={() => enterNewProduct()} className={`m-auto mr-0 basis-70 ${(newProduct.productVendor && sectionSelect && newProduct.productDesc.length > 0) ? "bg-green-400" : "bg-green-100"} text-xl font-bold border border-black rounded-l-lg flex py-1 text-center justify-center`}>
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