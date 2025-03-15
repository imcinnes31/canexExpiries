import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

const Pull = (props) => (
        <div>
        {props.params.type == "pulls" ?
            <div id={`${props.product.productUPC}`} onAnimationEnd={()=>props.animationEnds(props.pullID)} className={`${props.pullMenuValue.clicked == true ? 'animate-hide' : ''}`}>
            <div id={`productName${props.product.productUPC}`}>
                {props.product.productName}
            </div>
            <div>
                {props.product.productSection}
            </div>
    
            <div>
                {/* <div>{props.product.productExpiry}</div>
                <div>{props.product.productExpiry > new Date().toISOString(true) == true ? "TRUE" : "FALSE" }</div>
                <div>{props.product.productVendor}</div>
                <div>{nonCreditVendors.includes(props.product.productVendor) ? "TRUE" : "FALSE"}</div> */}

                {nonCreditVendors.includes(props.product.productVendor) ?
                    <div>
                        <label htmlFor="pullNumberMenu">Number to pull:</label>
                        <select name="pullNumberMenu" id={`numberPull${props.product.productUPC}`} onChange={(e) => props.setPullNumber(e)}>
                            {Array.from(Array(10), (e, i) => {
                                return <option key={i}>{i}</option>
                            })}
                        </select>
                        <div id={`pullProduct${props.product.productUPC}`} className={`${props.pullMenuValue.amount > 0 ? 'bg-green-400' : 'bg-green-100'}`} {...(props.pullMenuValue.amount > 0 ? { onClick: () => {props.deleteProduct(props.pullID, true)}} : {})}>Pull</div>
                    </div>
                :
                    <div id={`pullProduct${props.product.productUPC}`} className='bg-green-400' onClick={() => props.deleteProduct(props.pullID,false)}>Pull</div>
                }
                <div className="bg-red-400" onClick={() => props.deleteProduct(props.pullID,false)}>Sold Out</div>
            </div>
            </div>
        :
            nonCreditVendors.includes(props.product.productVendor) ?
            <div id={`${props.product.productUPC}${new Date(props.product.productExpiry).toISOString().split('T')[0].replaceAll("-","")}`} onAnimationEnd={()=>props.animationEnds(props.pullID)} className={`${props.pullMenuValue.clicked == true ? 'animate-hide' : ''}`}>
            <div id={`productName${props.product.productUPC}${new Date(props.product.productExpiry).toISOString().split('T')[0].replaceAll("-","")}`}>
                {props.product.productName}
            </div>
            <div>
                {props.product.productSection}
            </div>
                <div>
                    {"Expires " + monthNames[new Date(props.product.productExpiry).getMonth()] + " " + new Date(props.product.productExpiry).getDate() + " " + props.product.productUPC}
                    <div>
                        <div className="bg-green-400" onClick={() => props.discountProduct(props.pullID,props.product.productExpiry)}>Stickered</div>
                        <div className="bg-red-400" onClick={() => props.soldOutProduct(props.pullID,props.product.productExpiry)}>Sold Out</div>
                    </div>
                </div>
                </div>
            : null
        }
    </div>
);

function pullList(products, setProducts, pullAmounts, setPullAmounts, params) {    
    function setPullNumber(e) {
        const currentPull = pullAmounts[e.target.id.replace("numberPull","")];
        currentPull['amount'] = parseInt(e.target.value);
        setPullAmounts(currentPulls => ({...currentPulls, [e.target.id.replace("numberPull","")]: currentPull}));
    }

    // TODO: add new "deleteDiscount" function which calls discount delete route

    async function deleteProduct(divID, recording = null) {
        if (recording == true) {
            await fetch(`http://localhost:5050/record/expiryRecords/${pullAmounts[divID]['name'].replace("%", "%25")}&${pullAmounts[divID]['amount']}`, {
                method: "POST",
            });
        }
        const currentPull = pullAmounts[divID];
        currentPull['clicked'] = true;
        // TODO: set "sold out" button to call this function
        // TODO: create then call API to delete product DONE
        const prodUPC = divID.substring(0,12);
        await fetch(`http://localhost:5050/record/products/${prodUPC}`, {
            method: "DELETE",
        });
        setPullAmounts(currentPulls => ({...currentPulls, [divID]: currentPull}));
    } 

    async function soldOutProduct(divID,productExpiry) {
        const currentPull = pullAmounts[divID];
        currentPull['clicked'] = true;
        const prodUPC = divID.substring(0,12);
        await fetch(`http://localhost:5050/record/discounts/${prodUPC}&${productExpiry}`, {
            method: "DELETE",
        });
        setPullAmounts(currentPulls => ({...currentPulls, [divID]: currentPull})); 
    }

    async function discountProduct(divID) {
        const currentPull = pullAmounts[divID];
        currentPull['clicked'] = true;
        const prodUPC = divID.substring(0,12);
        await fetch(`http://localhost:5050/record/discounts/${prodUPC}`, {
            method: "PATCH",
        });
        setPullAmounts(currentPulls => ({...currentPulls, [divID]: currentPull}));
    }

    function alertAnimationEnd(productID) {
        const newProducts = products.filter((pl) => pl.productUPC !== productID.substring(0,12));
        setProducts(newProducts);
        // TODO: erase product from product state DONE
    }

      useEffect(() => {
        async function getPulls() {
          const response = params.type == "pulls" ? 
            await fetch(`http://localhost:5050/record/products/`) : 
            params.type == "discounts" ? 
            await fetch(`http://localhost:5050/record/discounts/`) : null;
          if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            console.error(message);
            return;
          }
          const productData = await response.json();
        //   console.log(productData);
          const initialPullAmounts = {};
          if (params.type == "discounts") {
            for (const x in productData) {
                initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")] = {};
                initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")]['amount'] = 0;
                initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")]['clicked'] = false;
                initialPullAmounts[productData[x].productUPC + new Date(productData[x].productExpiry).toISOString().split('T')[0].replaceAll("-","")]['name'] = productData[x].productName;
              }
    
          } else if (params.type == "pulls") {
            // console.log(productData);
            for (const x in productData) {
                initialPullAmounts[productData[x].productUPC] = {};
                initialPullAmounts[productData[x].productUPC]['amount'] = 0;
                initialPullAmounts[productData[x].productUPC]['clicked'] = false;
                initialPullAmounts[productData[x].productUPC]['name'] = productData[x].productName;
              }
    
          }
          setPullAmounts(initialPullAmounts);
          setProducts(productData);
        }
        getPulls();
        return;
      }, []);    // TODO: remove this to only happen once DONE

    return products.map((product) => {
        const pullID = params.type == "discounts" ? product.productUPC + (new Date(product.productExpiry).toISOString().split('T')[0].replaceAll("-","")) : product.productUPC;
        return (
        <Pull
            pullID={pullID}
            product={product}
            deleteProduct={deleteProduct}
            discountProduct={() => discountProduct(pullID)}
            soldOutProduct={() => soldOutProduct(pullID,product.productExpiry)}
            setPullNumber={(e) => setPullNumber(e)}
            animationEnds={() => alertAnimationEnd(pullID)}
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
    const [pullAmounts, setPullAmounts] = useState({});
    // TODO: add pullNumber and setPullNumber useState DONE

    return (
        <div>
            <div className="font-bold">
                {
                    params.type == "pulls" ? 
                        "Products to Pull" : 
                    params.type == "discounts" ? 
                        "Products to Mark as 50% off":
                        "Error"
                }
            </div>
            <div>
                {
                    params.type == "pulls" || params.type == "discounts" ? 
                        pullList(products, setProducts, pullAmounts, setPullAmounts, params) :
                        "Error"
                }
            </div>
        </div>
    );
}