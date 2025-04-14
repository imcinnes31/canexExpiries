import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";

import {monthNames, nonCreditVendors} from "../constants.jsx"
import {REACT_APP_API_URL} from "../../index.js"

import cross from "../assets/cross.png";
import tick from "../assets/check.png";

const Pull = (props) => (
    <div>
        <div>
            {props.params.type == "pulls" ?
                <div id={`${props.product.productUPC}`}>
                    <div id={`${props.product.productUPC}info`} onAnimationEnd={()=>props.alertAnimationEnd(props.pullID)} className={`bg-gray-100 p-2 m-3 border border-gray-400 rounded-sm ${props.pullMenuValue.clicked == true && props.currentConfirm != props.pullID ? 'animate-hide' : props.currentConfirm == props.pullID ? 'hidden' : ''}`}>
                        <div id={`productName${props.product.productUPC}`} className="bg-white text-center p-1 font-bold text-xl">
                            {props.product.productName}
                        </div>
                        <div className="grid grid-cols-2">
                            <div className="bg-white border border-black text-center font-serif font-bold text-l">
                                {props.product.productSection}
                            </div>
                            <div className="bg-white border border-black text-center text-l tracking-wide">
                                {props.product.productUPC}
                            </div>
                        </div>
                        <div>
                            {nonCreditVendors.includes(props.product.productVendor) ?
                                <div className="flex w-full pt-2">
                                    <div className="border border-black rounded-l-lg text-xl font-bold bg-gray-300 text-center basis-64 m-auto py-1">Pull Amt:</div>
                                    <select name="pullNumberMenu" id={`numberPull${props.product.productUPC}`} onChange={(e) => props.setPullNumber(e)} className="text-xl basis-24 font-bold border border-black">
                                        {Array.from(Array(50), (e, i) => {
                                            return <option key={i}>{i}</option>
                                        })}
                                    </select>
                                    <div id={`pullProduct${props.product.productUPC}`} className={`${props.pullMenuValue.amount > 0 ? 'bg-green-400' : 'bg-green-100'} text-xl basis-48 font-bold border border-black flex py-1 justify-center`} {...(props.pullMenuValue.amount > 0 ? { onClick: () => {props.deleteProduct(props.pullID, true)}} : {})}><div className="">Pull</div><div className="w-7 ml-1"><img src={tick}/></div></div>
                                    <div className="bg-red-400 basis-24 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center" onClick={() => props.setCurrentConfirm(props.pullID)}><div className="w-7"><img src={cross}/></div></div>
                                </div>
                            :
                                <div>
                                    <div className="text-center text-xl font-bold font-serif p-1">{props.product.productVendor == "Tim Hortons" ? "Dispose" : "Credit Product"}</div>
                                    <div className="grid grid-cols-2">
                                        <div id={`pullProduct${props.product.productUPC}`} className='bg-green-400 text-xl font-bold border border-black rounded-l-lg flex py-1 justify-center' onClick={() => props.deleteProduct(props.pullID,false)}><div className="">Pull</div><div className="w-7 ml-1"><img src={tick}/></div></div>
                                        <div className="bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center" onClick={() => props.deleteProduct(props.pullID,false)}><div className="">Sold Out</div><div className="w-7 ml-1"><img src={cross}/></div></div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    <div id={`${props.product.productUPC}confirm`} onAnimationEnd={()=>props.alertAnimationEnd(props.pullID)} className={`bg-red-100 p-2 m-3 border border-gray-400 rounded-sm ${props.pullMenuValue.clicked == true && props.currentConfirm == props.pullID ? 'animate-hide' : props.currentConfirm != props.pullID ? 'hidden': ''}`}>
                        <div id={`productName${props.product.productUPC}`} className="bg-red-200 text-center p-1 font-bold text-lg">
                            Mark All Items of {props.product.productName} ({props.product.productUPC}) as Sold Out?
                        </div>
                        <div className="grid grid-cols-2 p-1">
                            <div className="bg-green-400 text-xl font-bold border border-black rounded-l-lg flex py-1 justify-center" onClick={() => props.deleteProduct(props.pullID)}>
                                <div className="">Confirm</div>
                                <div className="w-7 ml-1"><img src={tick}/></div>
                            </div>
                            <div className="bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center" onClick={() => props.cancelCurrentConfirm()}>
                                <div className="">Cancel</div>
                                <div className="w-7 ml-1"><img src={cross}/></div>
                            </div>
                        </div>
                    </div>
                </div>
            : props.params.type == "discounts" ?
                <div id={`${props.product.productUPC}${new Date(props.product.productExpiry).toISOString().split('T')[0].replaceAll("-","")}`}>
                    <div id={`${props.product.productUPC}${new Date(props.product.productExpiry).toISOString().split('T')[0].replaceAll("-","")}info`} onAnimationEnd={()=>props.alertAnimationEnd(props.pullID)} className={`bg-gray-100 p-2 m-3 border border-gray-400 rounded-sm ${props.pullMenuValue.clicked == true && props.currentConfirm != props.pullID ? 'animate-hide' : props.currentConfirm == props.pullID ? 'hidden' : ''}`}>
                        <div id={`productName${props.product.productUPC}${new Date(props.product.productExpiry).toISOString().split('T')[0].replaceAll("-","")}`} className="bg-white text-center p-1 font-bold text-xl">
                            {props.product.productName}
                        </div>
                        <div className="grid grid-cols-2">
                            <div className="bg-white border border-black text-center font-serif font-bold text-l">
                                {props.product.productSection}
                            </div>
                            <div className="bg-white border border-black text-center text-l tracking-wide">
                                {props.product.productUPC}
                            </div>
                        </div>
                        <div className="text-center text-xl font-bold font-serif p-1">
                            {"Expires " + monthNames[parseInt(props.product.productExpiry.substring(5,7)) - 1] + " " + parseInt(props.product.productExpiry.substring(8,10))}
                        </div>
                        <div className="grid grid-cols-2 p-1">
                            <div className="bg-green-400 text-xl font-bold border border-black rounded-l-lg flex py-1 justify-center" onClick={() => props.discountProduct(props.pullID,props.product.productExpiry)}>
                                <div className="">Stickered</div>
                                <div className="w-7 ml-1"><img src={tick}/></div>
                            </div>
                            <div className="bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center" onClick={() => props.setCurrentConfirm(props.pullID)}>
                                <div className="">Sold Out</div>
                                <div className="w-7 ml-1"><img src={cross}/></div>
                            </div>
                        </div>
                    </div>
                    <div id={`${props.product.productUPC}confirm`} onAnimationEnd={()=>props.alertAnimationEnd(props.pullID)} className={`bg-red-100 p-2 m-3 border border-gray-400 rounded-sm ${props.pullMenuValue.clicked == true && props.currentConfirm == props.pullID ? 'animate-hide' : props.currentConfirm != props.pullID ? 'hidden': ''}`}>
                        <div id={`productName${props.product.productUPC}`} className="bg-red-200 text-center p-1 font-bold text-xl">
                            Mark All Items of {props.product.productName} ({props.product.productUPC}), Expiring {monthNames[parseInt(props.product.productExpiry.substring(5,7)) - 1]} {parseInt(props.product.productExpiry.substring(8,10))}, as Sold Out?
                        </div>
                        <div className="grid grid-cols-2 p-1">
                            <div className="bg-green-400 text-xl font-bold border border-black rounded-l-lg flex py-1 justify-center" onClick={() => props.soldOutProduct(props.pullID)}>
                                <div className="">Confirm</div>
                                <div className="w-7 ml-1"><img src={tick}/></div>
                            </div>
                            <div className="bg-red-400 text-xl text-center font-bold border border-black rounded-r-lg flex py-1 justify-center" onClick={() => props.cancelCurrentConfirm()}>
                                <div className="">Cancel</div>
                                <div className="w-7 ml-1"><img src={cross}/></div>
                            </div>
                        </div>
                    </div>
                </div>
            : "Error "}
        </div>
    </div>
);

function pullList(products, setProducts, pullAmounts, setPullAmounts, setProductsLength, productsLength, setCurrentConfirm, currentConfirm, params) {   
     
    function cancelCurrentConfirm() {
        setCurrentConfirm(null);
    }

    function setPullNumber(e) {
        const currentPull = pullAmounts[e.target.id.replace("numberPull","")];
        currentPull['amount'] = parseInt(e.target.value);
        setPullAmounts(currentPulls => ({...currentPulls, [e.target.id.replace("numberPull","")]: currentPull}));
    }

    async function deleteProduct(divID, recording = null) {
        if (recording == true) {
            try {
                await fetch(`${REACT_APP_API_URL}/expiries/expiryRecords/${divID}&${pullAmounts[divID]['amount']}`, {
                    method: "POST",
                });
            } catch (error) {
              console.error('A problem occurred with your fetch operation: ', error);
              alert("Failed to add written off product to record. Please write it manually.")
            }
        }

        const prodUPC = divID.substring(0,12);
        try {
            await fetch(`${REACT_APP_API_URL}/expiries/products/${prodUPC}`, {
                method: "DELETE",
            });
            const currentPull = pullAmounts[divID];
            currentPull['clicked'] = true;
            setPullAmounts(currentPulls => ({...currentPulls, [divID]: currentPull}));
        } catch (error) {
          console.error('A problem occurred with your fetch operation: ', error);
          alert("Failed to remove expiry date from product. Please try again.")
        }
    } 

    async function soldOutProduct(divID) {
        const currentPull = pullAmounts[divID];
        currentPull['clicked'] = true;
        const prodUPC = divID.substring(0,12);
        const productExpiry = divID.substring(12,20);
        // console.log(productExpiry);
        try {
            await fetch(`${REACT_APP_API_URL}/expiries/discounts/${prodUPC}&${productExpiry}`, {
                method: "DELETE",
            });
            setPullAmounts(currentPulls => ({...currentPulls, [divID]: currentPull})); 
        } catch (error) {
          console.error('A problem occurred with your fetch operation: ', error);
          alert("Failed to remove expiry date from product. Please try again.")
        }
    }

    async function discountProduct(divID) {
        const prodUPC = divID.substring(0,12);
        const prodExpiry = divID.substring(12,20);
        try {
            await fetch(`${REACT_APP_API_URL}/expiries/discounts/${prodUPC}&${prodExpiry}`, {
                method: "PATCH",
            });
            const currentPull = pullAmounts[divID];
            currentPull['clicked'] = true;
            setPullAmounts(currentPulls => ({...currentPulls, [divID]: currentPull}));
        } catch (error) {
            console.error('A problem occurred with your fetch operation: ', error);
            alert("Failed to mark product as discounted. Please try again.")
        }
    }

    function alertAnimationEnd(productID) {
        const newProducts = products.filter((pl) => pl.productUPC !== productID.substring(0,12));
        setProductsLength(newProducts.length);
        setProducts(newProducts);
    }

    useEffect(() => {
        async function getPulls() {
            const response = params.type == "pulls" ? 
                await fetch(`${REACT_APP_API_URL}/expiries/products/`) : 
                params.type == "discounts" ? 
                await fetch(`${REACT_APP_API_URL}/expiries/discounts/`) : null;
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                alert("Failed to retrieve data. Please try again.")
                return;
            }
            const productData = await response.json();
            const initialPullAmounts = [];
            if (params.type == "discounts") {
                const filteredProductData = productData.filter((product) => nonCreditVendors.includes(product.productVendor))
                setProductsLength(filteredProductData.length);
                for (const x in productData) {
                    initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")] = {};
                    initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")]['amount'] = 0;
                    initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")]['clicked'] = false;
                    initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")]['name'] = productData[x].productName;
                }
                setProducts(filteredProductData);
            } else if (params.type == "pulls") {
                setProductsLength(productData.length);
                for (const x in productData) {
                    initialPullAmounts[productData[x].productUPC] = {};
                    initialPullAmounts[productData[x].productUPC]['amount'] = 0;
                    initialPullAmounts[productData[x].productUPC]['clicked'] = false;
                    initialPullAmounts[productData[x].productUPC]['name'] = productData[x].productName;
                }
                setProducts(productData);
            }
            setPullAmounts(initialPullAmounts);
        }
        getPulls();
        // console.log(products);
        return;
    }, []);

    return products.map((product) => {
        const pullID = params.type == "discounts" ? product.productUPC + (new Date(product.productExpiry).toISOString().split('T')[0].replaceAll("-","")) : product.productUPC;
        return (
            <Pull
                pullID={pullID}
                product={product}
                deleteProduct={deleteProduct}
                discountProduct={() => discountProduct(pullID)}
                soldOutProduct={() => soldOutProduct(pullID)}
                currentConfirm={currentConfirm}
                setCurrentConfirm={() => setCurrentConfirm(pullID)}
                setPullNumber={(e) => setPullNumber(e)}
                cancelCurrentConfirm={cancelCurrentConfirm}
                alertAnimationEnd={() => alertAnimationEnd(pullID)}
                pullMenuValue = {pullAmounts[pullID]}
                params={params}
                key={pullID}
            />
        );
    });
}

export default function AlertList() {
    const params = useParams();
    const [products, setProducts] = useState([]);
    const [pullAmounts, setPullAmounts] = useState([]);
    const [productsLength, setProductsLength] = useState(null);
    const [currentConfirm, setCurrentConfirm] = useState(null);

    return (
        <div>
            <div>           
                {productsLength > 0 ?
                    <div className="font-bold text-center text-xl pt-2">
                    {
                        params.type == "pulls" ? 
                            "Products to Pull" : 
                        params.type == "discounts" ? 
                            "Products to Mark as 50% off":
                            "Error"
                    }
                    </div>
                : null
                }
                <div>
                    {
                        params.type == "pulls" || params.type == "discounts" ? 
                            pullList(products, setProducts, pullAmounts, setPullAmounts, setProductsLength, productsLength, setCurrentConfirm, currentConfirm, params) :
                            "Error"
                    }
                </div>
            </div>
            {productsLength == 0 ?
                <div className="text-2xl text-center font-bold font-serif my-4">No product left to {params.type == "pulls" ? 'pull' : params.type == "discounts" ? 'discount' : ''}. <NavLink className="text-2xl font-serif font-bold underline decoration-blue-400 text-blue-400" to="/">Click here</NavLink> to return to Main Menu.</div>
            : null
            }
        </div>
    );
}