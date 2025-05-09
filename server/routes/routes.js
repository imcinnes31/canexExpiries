import express from "express";

import db from "../db/connection.js";

import { ObjectId } from "mongodb";

import {storeClosedSunday, storeHolidayArray} from "../constants.js"

const router = express.Router();

function getLocalDate() {
  const date1 = new Date();
  const date2 = new Date(date1);
  // const durationInMinutes = date1.getTimezoneOffset();
  // date2.setMinutes(date1.getMinutes() - durationInMinutes)
  date2.setMinutes(date1.getMinutes() - 300);
  const date3 = date2.toISOString().split("T")[0] + "T00:00:00.000+00:00";
  return new Date(date3);
}

function addDays(numDays) {
  return new Date(getLocalDate().getTime() + (numDays * 86400000));
}

router.get("/test/", async (req,res) => {
  let businessDaysPassed = 0;
  let totalDaysPassed = 0;
  while(true) {
      if (!((storeClosedSunday == true && addDays(totalDaysPassed).getDay() == 0) || storeHolidayArray.includes(addDays(totalDaysPassed).toDateString()))) { // Add holidays to this when function made
          businessDaysPassed++;
      }
      totalDaysPassed++;
      if (businessDaysPassed == 1) {
          break;
      }
  }

  let threeDaysAfter = addDays(totalDaysPassed);

  res.send(threeDaysAfter).status(200);

});

// EXPIRY REPORT
router.get("/expiryRecords/:expiryMonth&:expiryYear", async (req, res) => {
  let collection = await db.collection("expiryRecords");
  let result = await collection.aggregate([
  // { 
  //   "$addFields": 
  //   {
  //     "writtenOffAt": {
  //         "$toDate": "$writeOffDate"
  //     }
  //   } 
  // },
    {
      "$match" : 
      {
        $expr: {
          $and: [
            {$eq: [{$year: "$writeOffDate"}, parseInt(req.params.expiryYear)]},
            {$eq: [{$month: "$writeOffDate"}, parseInt(req.params.expiryMonth)]}
          ]
        }
      }
    },
    {
      "$sort" : {
        "writeOffDate": 1
      }
    }
  ]).toArray();
  res.send(result).status(200);
});

// CHECK SECTION*
router.get("/sections/:id", async (req, res) => {
  let collection = await db.collection("storeSections")
  let results = await collection.aggregate([
    {
      "$match": {
        // "_id": new ObjectId(req.params.id)
        "_id": new ObjectId(req.params.id)
      }
    },
    {
      "$project": {
        "_id": 1,
        "section": 1,
        "dateLastChecked": 1,
        "intervalDays": 1,
        "expiryRange": 1,
        "products":              
        {
          "$filter": 
          {
            "input": "$products",
            "cond": {
              "$or": [
              {"$gte": [
                  "$$this.smallUPC", null
              ]},
              {"$eq": [
                "$$this.demoProduct", true
              ]},
            ]
            }
          }
        }
      },
    },
  ]).toArray();
  res.send(results[0]).status(200);
});

// CHECK SECTION*
router.patch("/sections/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
        $set: {
            dateLastChecked: getLocalDate()
        },
    };

    let collection = await db.collection("storeSections");
    let result = await collection.updateOne(query, updates);
    res.send(result).status(200);
  } catch(err) {
    console.error(err);
    res.status(500).send("Error updating record");
  }
});

// CHECK SECTION*
router.patch("/products/:productUPC&:expiryDate", async (req, res) => {
  const dateGiven = req.params.expiryDate;
  const dateConverted = dateGiven.substring(0,4) + "-" + dateGiven.substring(4,6) + "-" + dateGiven.substring(6,8) + "T00:00:00.000+00:00";
  try {
    let collection = await db.collection("storeSections");
      // let result = await collection.updateOne({
      //   "products.expiryDates.dateGiven": {
      //     $ne: new Date(moment(dateConverted)).toISOString(true)
      //     // $ne: "2025-02-24T00:00:00.000Z"
      //   },
      //   },
      //   {
      //     $push: {
      //       "products.$[x].expiryDates": {
      //         "dateGiven": new Date(moment(dateConverted)).toISOString(true),
      //         // "dateGiven": "2025-02-24T00:00:00.000Z",
      //         "discounted": false
      //       }
      //     }
      //   },
      //   {
      //     arrayFilters: [
      //       {
      //         "x.productUPC": String(req.params.productUPC)
      //         // "x.productUPC": "068700100734"
      //       }
      //     ]
      //   })

    let result = await collection.updateOne({
      "products":{$elemMatch:{
        "expiryDates.dateGiven": {
          $ne: new Date(dateConverted)
          // $ne: new Date(moment(dateConverted)).toISOString(true)
        },
        "productUPC": String(req.params.productUPC)
      }}
    },{
      $push: {
        "products.$.expiryDates": {
          "dateGiven": new Date(dateConverted),
          // "dateGiven": new Date(moment(dateConverted)).toISOString(true),
          "discounted": false
        }
      }
    })
    res.send(result).status(200);
  } catch(err) {
    console.error(err);
    res.status(500).send("Error updating record.");
  }
});

// CHECK SECTION*
router.get("/products/:productUPC", async (req, res) => {
  let collection = await db.collection("storeSections");
  let results = await collection.aggregate([
    {
      "$unwind": "$products"
    },
    {
      "$match": {
        "products.productUPC": req.params.productUPC
      }
    },
    {
      "$replaceRoot": {
        "newRoot": "$products"
      }
    },
    {
      "$project": {
        "productUPC": 1,
        "name": 1,
      }
    }
  ]).toArray();
  res.send(results).status(200);
});

// CHECK SECTION*
router.post("/sections/:id&:productUPC", async (req, res) => {
  const productDescription = req.body.productDesc + (String(req.body.productSize).length > 0 ? " " + req.body.productSize : "");
  const results = [];
  try {
    let collection = await db.collection("storeSections");
    let result = await collection.updateOne({
      _id: new ObjectId(req.params.id)
    },
    {
      $push: {
        products: {
          productUPC: req.params.productUPC,
          name: productDescription,
          vendor: req.body.productVendor,
          expiryDates: []
        }
      }
    });
    results.push(result); 
    if (req.body.productSmallUPC) {
      let result2 = await collection.updateMany({
        "products":
          {
            $elemMatch:
            {
              "productUPC": String(req.params.productUPC)
            }
          }
      },
      {
        $set: {"products.$.smallUPC": req.body.productSmallUPC},
      });
      results.push(result2);
    }
    res.send(results).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding record");
  }
});

// MAIN MENU*
router.get("/sections/", async (req, res) => {
  let collection = await db.collection("storeSections")
  let results = await collection.aggregate([
    {
      "$project": {
        "section": 1,
        "dateLastChecked": 1,
        "intervalDays": 1,
        "demoSection": 1,
      }
    }
  ]).toArray();
  res.send(results).status(200);
});

// ALERT LIST*
// MAIN MENU*
router.get("/discounts/", async (req, res) => {
  let businessDaysPassed = 0;
  let totalDaysPassed = 0;
  while(true) {
      if (!((storeClosedSunday == true && addDays(totalDaysPassed).getDay() == 0) || storeHolidayArray.includes(addDays(totalDaysPassed).toDateString()))) { // Add holidays to this when function made
          businessDaysPassed++;
      }
      totalDaysPassed++;
      if (businessDaysPassed == 3) {
          break;
      }
  }

  // let threeDaysAfter = addDays(totalDaysPassed - 1);
  let threeDaysAfter = addDays(totalDaysPassed);

  // let threeDaysAfter = new Date(moment().add(3, "days").format("MM-DD-YYYY")).toISOString(true);
  let collection = await db.collection("storeSections");
  let results = await collection.aggregate([
    {
      $unwind: "$products"
    },
    {
      $unwind: "$products.expiryDates"
    },
    {
      "$match": {
        $expr: {
          $lte: [
            "$products.expiryDates.dateGiven",
            threeDaysAfter
            // new Date(moment("$products.expiryDates.dateGiven").format("MM-DD-YYYY")),
            // new Date(moment(threeDaysAfter).format("MM-DD-YYYY"))
            // ISODate("$products.expiryDates.dateGiven"),
            // ISODate(threeDaysAfter)
          ]
        }
      }
    },
    {
      "$match": {
        $expr: {
          $gte: [
            "$products.expiryDates.dateGiven",
            // new Date(moment().format("MM-DD-YYYY")).toISOString(true)
            getLocalDate()
            
            // new Date(moment("$products.expiryDates.dateGiven").format("MM-DD-YYYY")),
            // new Date(moment().format("MM-DD-YYYY"))
            // ISODate("$products.expiryDates.dateGiven"),
            // ISODate(moment())
          ]
        }
      }
    },
    {
      "$match": {
        "products.expiryDates.discounted": false
      }
    },
    {
      "$project": {
        _id: 0,
        productUPC: "$products.productUPC",
        productName: "$products.name",
        productVendor: "$products.vendor",
        productExpiry: "$products.expiryDates.dateGiven",
        productSection: "$section"
      }
    },
    {
      "$sort":{
        "productSection": 1
      }
    }
  ]).toArray();
  res.send(results).status(200);
});

// ALERT LIST*
// MAIN MENU*
router.get("/products/", async (req, res) => {
  let businessDaysPassed = 0;
  let totalDaysPassed = 0;
  while(true) {
      if (!((storeClosedSunday == true && addDays(totalDaysPassed).getDay() == 0) || storeHolidayArray.includes(addDays(totalDaysPassed).toDateString()))) { // Add holidays to this when function made
          businessDaysPassed++;
      }
      totalDaysPassed++;
      if (businessDaysPassed == 1) {
          break;
      }
  }

  let collection = await db.collection("storeSections");
  let results = await collection.aggregate([
    {
      $unwind: "$products"
    },
    {
      $unwind: "$products.expiryDates"
    },
    {
      "$match": {
        $expr: {
          $lte: 
          [
            "$products.expiryDates.dateGiven",
            // addDays(totalDaysPassed - 2)
            addDays(totalDaysPassed - 1)
            // new Date(moment().format("MM-DD-YYYY"))
          ]
        }
      }
    },
    {
      $group: {
        _id: {
          productUPC: "$products.productUPC",
          productName: "$products.name",
          productVendor: "$products.vendor",
          productSection: "$section",
        },
      }
    },
    {
      "$project": {
        _id: 0,
        productUPC: "$_id.productUPC",
        productName: "$_id.productName",
        productVendor: "$_id.productVendor",
        productSection: "$_id.productSection",
        currentDate: getLocalDate()
      }
    },
    // {
    //   "$project": {
    //     productUPC: "$products.productUPC",
    //     productName: "$products.name",
    //     productVendor: "$products.vendor",
    //     productSection: "$section",
    //     productExpiry: "$products.expiryDates.dateGiven",
    //   }
    // },    
    {
      "$sort":{
        "productSection": 1
      }
    }
  ]).toArray();
  res.send(results).status(200);
});

// ALERT LIST*
router.patch("/discounts/:productUPC&:productExpiry", async (req, res) => {
  try {
    let collection = await db.collection("storeSections");
    let result = await collection.updateMany({},
    {
      "$set": {
        "products.$[x].expiryDates.$[y].discounted": true
      }
    },
    {
      "arrayFilters": [
        {
          "x.productUPC": req.params.productUPC
        },
        {
          "y.dateGiven": {
            "$eq": new Date(req.params.productExpiry.substring(0,4) + "-" + req.params.productExpiry.substring(4,6) + "-" + req.params.productExpiry.substring(6,8))
          },
          "y.discounted": false
        }
      ]
    });
    res.send(result).status(200);
  } catch(err) {
    console.error(err);
    res.status(500).send("Error updating record.");
  }
});

// ALERT LIST*DEMO
router.patch("/discountsDemo/:productUPC&:productExpiry", async (req, res) => {
  try {
    let collection = await db.collection("storeSections");
    let result = await collection.updateMany({},
    {
      "$set": {
        "products.$[x].expiryDates.$[y].demoDiscounted": true
      }
    },
    {
      "arrayFilters": [
        {
          "x.productUPC": req.params.productUPC
        },
        {
          "y.dateGiven": {
            "$eq": new Date(req.params.productExpiry.substring(0,4) + "-" + req.params.productExpiry.substring(4,6) + "-" + req.params.productExpiry.substring(6,8))
          },
          "y.discounted": false
        }
      ]
    });
    res.send(result).status(200);
  } catch(err) {
    console.error(err);
    res.status(500).send("Error updating record.");
  }
});

// ALERT LIST*
// v1
// router.delete("/products/:productUPC", async (req, res) => {
//   try {
//       let collection = await db.collection("storeSections");

//     let businessDaysPassed = 0;
//     let totalDaysPassed = 0;
//     while(true) {
//         if (!((storeClosedSunday == true && addDays(totalDaysPassed).getDay() == 0) || storeHolidayArray.includes(addDays(totalDaysPassed).toDateString()))) { // Add holidays to this when function made
//             businessDaysPassed++;
//         }
//         totalDaysPassed++;
//         if (businessDaysPassed == 1) {
//             break;
//         }
//     }

//     let result = await collection.updateMany({
//     "products":{$elemMatch:{
//       "expiryDates.dateGiven": {
//         // "$lte": addDays(totalDaysPassed - 2)
//         "$lte": addDays(totalDaysPassed - 1)
//           // "$lte": new Date(moment().format("MM-DD-YYYY")).toISOString("true")
//           },
//       "productUPC": String(req.params.productUPC)
//       }}
//     },
//     {
//       $pull: {
//         "products.$.expiryDates": {
//           "dateGiven": {
//             // "$lte": new Date(moment().format("MM-DD-YYYY"))
//             "$lte": addDays(totalDaysPassed - 1)
//             // "$lte": new Date(moment().format("MM-DD-YYYY")).toISOString("true")
//           }
//         }
//       }
//     });
//     result['expiryRangeLTE'] = addDays(totalDaysPassed - 1);
//     res.send(result).status(200);
//   } catch(err) {
//     console.error(err);
//     res.status(500).send("Error updating record.");
//   }
// });
// v2
router.delete("/products/:productUPC&:productExpiry", async (req, res) => {
  //convert expiry date string given into date object
  const expiryDateConverted = new Date(req.params.productExpiry.substring(0,4) + "-" + req.params.productExpiry.substring(4,6) + "-" + req.params.productExpiry.substring(6,8))
  try {
    let collection = await db.collection("storeSections");

    let result = await collection.updateMany({
    //look for product with that upc, and any "date given" less than or equal to expiry date in parameter
    "products":{$elemMatch:{
      "expiryDates.dateGiven": {
        "$lte": expiryDateConverted
          },
      "productUPC": String(req.params.productUPC)
      }}
    },
    {
      //remove the expiry date object from the expiry dates array
      $pull: {
        "products.$.expiryDates": {
          "dateGiven": {
            "$lte": expiryDateConverted
          }
        }
      }
    });
    res.send(result).status(200);
  } catch(err) {
    console.error(err);
    res.status(500).send("Error updating record.");
  }
});

// ALERT LIST*DEMO
// v1
// router.delete("/productsDemo/:productUPC", async (req, res) => {
//   try {
//       let collection = await db.collection("storeSections");

//     let businessDaysPassed = 0;
//     let totalDaysPassed = 0;
//     while(true) {
//         if (!((storeClosedSunday == true && addDays(totalDaysPassed).getDay() == 0) || storeHolidayArray.includes(addDays(totalDaysPassed).toDateString()))) { // Add holidays to this when function made
//             businessDaysPassed++;
//         }
//         totalDaysPassed++;
//         if (businessDaysPassed == 1) {
//             break;
//         }
//     }

//     let result = await collection.updateMany({},
//         {
//           "$set": {
//             "products.$[x].expiryDates.$[y].demoPulled": true
//           }
//         },
//         {
//           "arrayFilters": [
//             {
//               "x.productUPC": req.params.productUPC
//             },
//             {
//               "y.dateGiven": {
//                 "$lte": addDays(totalDaysPassed - 1)
//               },
//             }
//           ]
//         })
//     res.send(result).status(200);

//   } catch(err) {
//     console.error(err);
//     res.status(500).send("Error updating record.");
//   }
// });
// v2
router.delete("/productsDemo/:productUPC&:productExpiry", async (req, res) => {
  const expiryDateConverted = new Date(req.params.productExpiry.substring(0,4) + "-" + req.params.productExpiry.substring(4,6) + "-" + req.params.productExpiry.substring(6,8))
  try {
    let collection = await db.collection("storeSections");

    let result = await collection.updateMany({},
        {
          "$set": {
            "products.$[x].expiryDates.$[y].demoPulled": true
          }
        },
        {
          "arrayFilters": [
            {
              "x.productUPC": req.params.productUPC
            },
            {
              "y.dateGiven": {
                "$lte": expiryDateConverted
              },
            }
          ]
        })
    res.send(result).status(200);

  } catch(err) {
    console.error(err);
    res.status(500).send("Error updating record.");
  }
});

// ALERT LIST*
router.delete("/discounts/:productUPC&:productExpiry", async (req, res) => {
    try {
    let collection = await db.collection("storeSections");
    let result = await collection.updateMany(
      {
        "products":{$elemMatch:{
          "expiryDates.dateGiven": {
              "$eq": new Date(req.params.productExpiry.substring(0,4) + "-" + req.params.productExpiry.substring(4,6) + "-" + req.params.productExpiry.substring(6,8))
              },
          "productUPC": String(req.params.productUPC)
          }}
        },
        {
          $pull: {
            "products.$.expiryDates": {
              "dateGiven": {
                "$eq": new Date(req.params.productExpiry.substring(0,4) + "-" + req.params.productExpiry.substring(4,6) + "-" + req.params.productExpiry.substring(6,8))
              }
            }
          }
        }
    // {
    //   $pull: {
    //     "products.$[x].expiryDates": {
    //       "dateGiven": {
    //         // "$eq": new Date(moment(req.params.productExpiry).format("MM-DD-YYYY")).toISOString(true)
    //         "$eq": new Date(req.params.productExpiry.substring(0,4) + "-" + req.params.productExpiry.substring(4,6) + "-" + req.params.productExpiry.substring(6,8))
    //       }
    //     }
    //   }
    // },
    // {
    //   arrayFilters: [
    //     {
    //       "x.productUPC": req.params.productUPC
    //     }
    //   ]
    // }
    );
    res.send(result).status(200);
  } catch(err) {
      console.error(err);
      res.status(500).send("Error updating record.");
  }
});

// ALERT LIST*DEMO
router.delete("/discountsDemo/:productUPC&:productExpiry", async (req, res) => {
  try {
    let collection = await db.collection("storeSections");

    let result = await collection.updateMany({},
      {
        "$set": {
          "products.$[x].expiryDates.$[y].demoPulled": true
        }
      },
      {
        "arrayFilters": [
          {
            "x.productUPC": req.params.productUPC
          },
          {
            "y.dateGiven": {
              "$eq": new Date(req.params.productExpiry.substring(0,4) + "-" + req.params.productExpiry.substring(4,6) + "-" + req.params.productExpiry.substring(6,8))
            },
          }
        ]
      });
      res.send(result).status(200);

  } catch(err) {
      console.error(err);
      res.status(500).send("Error updating record.");
  }
});

// ALERT LIST*
router.post("/expiryRecords/:productUPC&:productAmount", async (req, res) => {
  try {
    let collection = await db.collection("expiryRecords");
    let result = await collection.insertOne({
        productUPC: req.params.productUPC,
        amount: req.params.productAmount,
        writeOffDate: getLocalDate()
    });
    res.send(result).status(200);
  } catch(err) {
    console.error(err);
    res.status(500).send("Error making record");
  }
});

// ALERT LIST*DEMO
router.post("/expiryRecordsDemo/:productUPC&:productAmount", async (req, res) => {
  try {
    let collection = await db.collection("expiryRecords");
    let result = await collection.insertOne({
        productUPC: req.params.productUPC,
        amount: req.params.productAmount,
        demoRecord: true,
        writeOffDate: getLocalDate()
    });
    res.send(result).status(200);
  } catch(err) {
    console.error(err);
    res.status(500).send("Error making record");
  }
});

// MAIN MENU*
router.delete("/expiryRecords", async (req, res) => {
  const twelveMonthsAgoYear = getLocalDate().getFullYear() - 1;
  const twelveMonthsAgoMonth = getLocalDate().getMonth();
  try {
    let collection = await db.collection("expiryRecords");
    let result = await collection.deleteMany( { writeOffDate : {"$lt" : new Date(twelveMonthsAgoYear, twelveMonthsAgoMonth, 1) } })
    // let result = await collection.deleteMany(
    //   {"$lt": ["$writeOffDate", new Date(twelveMonthsAgoYear,twelveMonthsAgoMonth,1).toISOString(true)]},
    // );
    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting record");
  }
});

// PROJECT REPORT
router.get("/projections", async (req, res) => {
  let fourWeeksLater = addDays(28);
  let collection = await db.collection("storeSections");
  let results = await collection.aggregate([
    {
      $unwind: "$products"
    },
    {
      $unwind: "$products.expiryDates"
    },
    {
      "$match": {
        $expr: {
          $lte: [
            "$products.expiryDates.dateGiven",
            fourWeeksLater
          ]
        }
      }
    },
    {
      "$match": {
        $expr: {
          $gte: [
            "$products.expiryDates.dateGiven",
            getLocalDate()
          ]
        }
      }
    },
    {
      "$project": {
        _id: 0,
        productName: "$products.name",
        productUPC: "$products.productUPC",
        productVendor: "$products.vendor",
        productExpiry: "$products.expiryDates.dateGiven",
        productDiscounted: "$products.expiryDates.discounted",
        productSection: "$section",
        demoProduct: "$products.demoProduct",
        demoPulled: "$products.expiryDates.demoPulled",
        demoDiscounted: "$products.expiryDates.demoDiscounted",
      }
    },
    {
      "$sort":{
        "productExpiry": 1,
        "productSection": 1
      }
    }
  ]).toArray();
  // const newResults = Object.groupBy(results, product => {
  //   const convertDate = product.productExpiry;
  //   convertDate.setMinutes(convertDate.getMinutes() + 300)
  //   return convertDate;
  // });
  res.send(results).status(200);
});

// NEW ROUTE FOR PRODUCTS
router.get("/upcoming", async (req, res) => {
  let collection = await db.collection("storeSections");
  let results = await collection.aggregate([
    {
      $unwind: "$products"
    },
    {
      $unwind: "$products.expiryDates"
    },
    {
      "$match": {
        $expr: {
          $lte: [
            "$products.expiryDates.dateGiven",
            addDays(7)
          ]
        }
      }
    },
    {
      "$project": {
        _id: 0,
        productUPC: "$products.productUPC",
        productName: "$products.name",
        productVendor: "$products.vendor",
        productExpiry: "$products.expiryDates.dateGiven",
        productDiscounted: "$products.expiryDates.discounted",
        productSection: "$section",
        demoProduct: "$products.demoProduct",
        demoPulled: "$products.expiryDates.demoPulled",
        demoDiscounted: "$products.expiryDates.demoDiscounted",
      }
    },
    {
      "$sort":{
        "productExpiry": 1,
        "productSection": 1
      }
    }
  ]).toArray();
  res.send(results).status(200);
});


export default router;