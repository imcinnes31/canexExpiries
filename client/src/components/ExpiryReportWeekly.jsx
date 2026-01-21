import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {monthNames, milkProducts} from "../constants.jsx"
import canexLogo from "../assets/canex.png";
import {REACT_APP_API_URL} from "../../index.js"

export default function ExpiryReportWeekly() {
    const params = useParams();
    const [milkReport, setMilkReport] = useState({});
    const [nonMilkReport, setNonMilkReport] = useState([]);
    const [reportLoaded, setReportLoaded] = useState(false);

    useEffect(() => {
        async function getReport() {
            window.scrollTo(0,0);
            const weekID = params.reportDate;
            const response = await fetch(`${REACT_APP_API_URL}/expiries/expiryRecords/${weekID}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                console.error(message);
                alert("Failed to get report data. Please go back and try again.");
                return;
            }
            const reportData = await response.json();
            const filteredReportData = reportData.filter((report) => !(report.demoRecord == true))
            for (const x in filteredReportData) {
                const responseProduct = await fetch(`${REACT_APP_API_URL}/expiries/products/${filteredReportData[x].productUPC}`);
                if (!responseProduct.ok) {
                    const message = `An error occurred: ${response.statusText}`;
                    console.error(message);
                    alert("Failed to get report data. Please go back and try again.");
                    return;
                }
                const productData = await responseProduct.json();
                filteredReportData[x].productName = productData[0].name;
            }
            const milkProductsArray = [].concat.apply([], milkProducts.map(type => type.products)).map(product => product.productUPC);
            const milkData = Object.fromEntries((Object.values(
                (filteredReportData.filter(item => milkProductsArray.includes(item["productUPC"]))).reduce((agg, prod) => {
                    if (agg[prod.productUPC] === undefined) agg[prod.productUPC] = { prodUPC: prod.productUPC, sumQuantity: 0 }
                    agg[prod.productUPC].sumQuantity += +prod.amount
                    return agg;
                }, {})
            )).map(product => [product.prodUPC, product.sumQuantity]));
            setMilkReport(milkData);
            // const nonMilkData = filteredReportData.filter(item => !(milkProductsArray.includes(item["productUPC"])));
            
            const nonMilkData = Object.fromEntries((Object.values(
                (filteredReportData.filter(item => !(milkProductsArray.includes(item["productUPC"]))).reduce((agg, prod) => {
                    if (agg[prod.productUPC] === undefined) agg[prod.productUPC] = { prodUPC: prod.productUPC, sumQuantity: 0 }
                    agg[prod.productUPC].sumQuantity += +prod.amount
                    return agg;
                }, {})
            ))).map(product => [product.prodUPC, product.sumQuantity]));
            
            setNonMilkReport(nonMilkData);
            setReportLoaded(true);
        }
        getReport();
        return;
    }, []);

    function NonMilkProduct(props) {
        return (
            <tr className="h-[25px]">
                <td className={'border-none leading-none'}></td>
                <td className={'text-center text-xs leading-none'}>{props.product.productName}</td>
                <td className={'text-center text-base leading-none'}>{props.product.productUPC}</td>
                <td className={'text-center text-base font-bold leading-none'}>{props.product.amount}</td>
                <td className={'text-center text-base leading-none'}>Expired</td>
            </tr>
        );
    }

    function MilkProduct(props){
        return(
            <tr className={`${props.groupIndex == 0 ? 'bg-green-100' : props.groupIndex == 1 ? 'bg-blue-100' : props.groupIndex == 2 ? 'bg-orange-100' : 'bg-red-200'} h-[26px]`}>
                {props.productIndex == 0 ? 
                    <td className={'text-center border-none'} rowSpan={props.totalProducts}>{props.productSize}</td> 
                : null}
                <td className={'text-center text-base leading-none'}>{props.currentProduct.desc}</td>
                <td className={'text-center text-base leading-none'}>{props.currentProduct.productUPC}</td>
                <td className={'text-center font-bold text-base leading-none'}>{milkReport[props.currentProduct.productUPC] > 0 ? milkReport[props.currentProduct.productUPC] : null}</td>
                <td className={'text-center text-base text-base leading-none leading-none'}>{milkReport[props.currentProduct.productUPC] > 0 ? "Expired" : null}</td>
            </tr>
        );
    }

    function MilkGroup(props){
        return(
            <div>
                <table className={`w-full`}>
                    <tbody>
                        <tr className={`${props.groupIndex > 0 ? "invisible" : ""} h-[27px]`}>
                            <th className={'w-[8.75%] bg-white'}></th>
                            <th className={'w-[12.75%] bg-white'}></th>
                            <th className={`w-[20.75%] ${props.groupIndex == 0 ? "border-black border-2" : ""} bg-gray-100 text-xl font-normal leading-none`}>UPC</th>
                            <th className={`w-[45.50%] ${props.groupIndex == 0 ? "border-black border-2" : ""} bg-gray-100 text-xl font-normal leading-none`}>Qty</th>
                            <th className={`w-[12.25%] ${props.groupIndex == 0 ? "border-black border-2" : ""} bg-gray-100 text-xl font-normal leading-none`}>Reason</th>
                        </tr> 
                        {
                            props.products.map((product,index) => 
                                <MilkProduct 
                                    key={product.productUPC}
                                    productUPC={product.productUPC}
                                    productSize={props.sizeDesc}
                                    productIndex={index}
                                    groupIndex={props.groupIndex}
                                    totalProducts={props.products.length}
                                    currentProduct={milkProducts[props.groupIndex].products[index]}
                                />
                            )
                        }
                    </tbody>
                </table>
            </div>
        );
    }

    function milkGroups() {  
        return milkProducts.map((group,index) =>
            <MilkGroup 
                key={group.size}
                sizeDesc={group.size}
                products={group.products}
                groupIndex={index}
            />
        ); 
    }

    function nonMilkGroups() {  
        return nonMilkReport.map((product, index) =>
            <NonMilkProduct 
                key={product._id}
                product={product}
                index={index}
            />
        ); 
    }
    
    return (
        <div>
            <div className={"screen:hidden text-xl pl-1"}>4375 - Winnipeg</div>
            <div className={"screen:hidden text-xl pl-1"}>Store Spoilage log - {monthNames[parseInt(params.reportDate.substring(0,2)) - 1]} {params.reportDate.substring(2,4)} to {monthNames[parseInt(params.reportDate.substring(8,10)) - 1]} {params.reportDate.substring(10,12)}</div>
            <div className={"screen:hidden text-xl pl-1"}>On Products Entered by CANEX Expiry Date Tracker</div>
            {reportLoaded == true ?
                <div className="print:hidden w-15 h-15 p-2 my-2 mx-10 border-2 border-black text-center font-serif text-l font-bold bg-gray-200" onClick={() => window.print()}>Print Report</div>
            : 
                <div className="mt-10 justify-items-center">        
                    <div className="h-50 w-80 overflow-hidden relative"><img className="print:hidden animate-load" src={canexLogo}/></div>
                    <div className="h-50 text-3xl text-center font-bold">Loading...</div>
                </div>
            }
            <div className="print:hidden h-3 font-serif font-bold text-center text-lg">{monthNames[parseInt(params.reportDate.substring(0,2)) - 1]} {parseInt(params.reportDate.substring(2,4))}, {params.reportDate.substring(4,8)} to {monthNames[parseInt(params.reportDate.substring(8,10)) - 1]} {parseInt(params.reportDate.substring(10,12))}, {params.reportDate.substring(12,16)}</div>
            <div className="pt-[24px]">
                {milkGroups()}
            </div>
            <table className={'w-full'}>
                <tbody>
                    <tr className={"invisible h-[24px]"}>
                        <th className={'w-[8.75%]'}>0</th>
                        <th className={'w-[33.50%]'}>0</th>
                        <th className={`w-[35.50%]`}>0</th>
                        <th className={`w-[10.00%]`}>0</th>
                        <th className={`w-[12.25%]`}>0</th>
                    </tr>
                    <tr className="h-[25px]">
                        <th className={'w-[8.75%] invisible'}></th>
                        <th className={'w-[33.50%] bg-gray-100 border-2 border-black text-xl font-normal leading-none'}>Item Description</th>
                        <th className={'w-[35.50%] bg-gray-100 border-2 border-black text-xl font-normal leading-none'}>UPC</th>
                        <th className={'w-[10.00%] bg-gray-100 border-2 border-black text-xl font-normal leading-none'}>Qty</th>
                        <th className={'w-[12.25%] bg-gray-100 border-2 border-black text-xl font-normal leading-none'}>Reason</th>
                    </tr>
                    {nonMilkGroups()}
                </tbody>
            </table>
        </div>
    );
}
