import express from "express";

import db from "../db/connection.js";

import { ObjectId } from "mongodb";

import moment from "moment";

const router = express.Router();

const creditVendors = ["Saputo","Coca-Cola","Pepsi-Cola"];

router.get("/test/", async (req,res) => {
  // console.log(new Date(moment().format("MM-DD-YYYY")).toISOString(true));
  // console.log(new Date(moment("2025-02-13").format("MM-DD-YYYY")).toISOString(true));
  const date1 = new Date(moment().format("MM-DD-YYYY")).toISOString(true);
  const date2 = new Date(moment("2025-02-13").format("MM-DD-YYYY")).toISOString(true);
  console.log(new Date("2025-02-13").toISOString(true));
  // console.log(date1 < date2);
  // console.log(date1 > date2);
});

router.get("/sections/", async (req, res) => {
    let collection = await db.collection("storeSections")
    let results = await collection.aggregate([
      {
        "$addFields": {
          "needsChecking": {
            "$cond": {
              "if": {
                $lte: [
                  "$dateLastChecked",
                  {
                    $dateSubtract: {
                      startDate: new Date(),
                      unit: "day",
                      amount: "$intervalDays"
                    }
                  }
                ]
              },
              "then": true,
              "else": false
            }
          }
        }
      },
      {
        "$project": {
          "section": 1,
          "dateLastChecked": 1,
          "intervalDays": 1,
          "needsChecking": 1,
        }
      }
    ]).toArray();
    res.send(results).status(200);
});

router.get("/sections/:id", async (req, res) => {
  let collection = await db.collection("storeSections")
  let results = await collection.aggregate([
    {
      "$match": {
        "_id": new ObjectId(req.params.id)
      }
    },
    {
      "$project": {
        "_id": 1,
        "section": 1,
      }
    }
  ]).toArray();
res.send(results).status(200);
});

router.patch("/sections/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const updates = {
            $set: {
                dateLastChecked: new Date(moment().format("MM-DD-YYYY")).toISOString(true)
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

router.patch("/products/:productUPC&:expiryDate", async (req, res) => {
  const dateGiven = req.params.expiryDate;
  const dateConverted = dateGiven.substring(0,4) + "-" + dateGiven.substring(4,6) + "-" + dateGiven.substring(6,8);
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
                   $ne: new Date(moment(dateConverted)).toISOString(true)
                   },
                "productUPC": String(req.params.productUPC)
                }}
         },{
            $push: {
              "products.$.expiryDates": {
                "dateGiven": new Date(moment(dateConverted)).toISOString(true),
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

router.get("/discounts/", async (req, res) => {
    // let threeDaysAfter = moment("2025-02-05").add(3, "days").toISOString(true);
    let threeDaysAfter = new Date(moment().add(3, "days").format("MM-DD-YYYY")).toISOString(true);
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
              // "$products.expiryDates.dateGiven",
              // threeDaysAfter
              new Date(moment("$products.expiryDates.dateGiven")).toISOString("true"),
              new Date(moment(threeDaysAfter)).toISOString("true")
            ]
          }
        }
      },
      {
        "$match": {
          $expr: {
            $gt: [
              // "$products.expiryDates.dateGiven",
              // moment().toISOString(true)
              moment(new Date("$products.expiryDates.dateGiven")).toISOString("true"),
              new Date(moment().format("MM-DD-YYYY")).toISOString("true")
            ]
          }
        }
      },
      {
        "$match": {
          "products.vendor": {
            $in: creditVendors
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
          expiryDate: "$products.expiryDates.dateGiven"
        }
      },
      {
        "$sort":{
          "productUPC": 1
        }
      }
    ]).toArray();
    res.send(results).status(200);
});

router.get("/products/", async (req, res) => {
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
            // "$products.expiryDates.dateGiven",
            // moment().toISOString(true)
            moment(new Date("$products.expiryDates.dateGiven")).toISOString("true"),
            new Date(moment().format("MM-DD-YYYY")).toISOString("true")
          ]
        }
      }
    },
    {
      "$project": {
        _id: 0,
        productUPC: "$products.productUPC",
        productName: "$products.name",
        productExpiry: "$products.expiryDates.dateGiven"
      }
    },
    {
      "$sort":{
        "productUPC": 1
      }
    }
  ]).toArray();
  res.send(results).status(200);
});

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

router.patch("/discounts/:productUPC", async (req, res) => {
    try {
        let threeDaysFromNow = new Date(moment().add(3, "days").format("MM-DD-YYYY")).toISOString(true);
        let collection = await db.collection("storeSections");
        let result = await collection.updateOne({},
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
                    "$lte": threeDaysFromNow
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

router.delete("/products/:productUPC", async (req, res) => {
  try {
      let collection = await db.collection("storeSections");
      // let result = await collection.updateOne({},
      // {
      //   $pull: {
      //     "products.$[x].expiryDates": {
      //       "dateGiven": {
      //         "$lte": new Date(moment().format("MM-DD-YYYY")).toISOString(true)
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
      // });

      let result = await collection.updateOne({
        "products":{$elemMatch:{
          "expiryDates.dateGiven": {
              $lte: new Date(moment().format("MM-DD-YYYY")).toISOString("true")
              },
          "productUPC": String(req.params.productUPC)
          }}
        },
        {
          $pull: {
            "products.$.expiryDates": {
              "dateGiven": {
                "$lte": new Date(moment().format("MM-DD-YYYY")).toISOString("true")
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

router.delete("/discounts/:productUPC", async (req, res) => {
    try {
        let collection = await db.collection("storeSections");
        let result = await collection.updateOne({},
            {
              $pull: {
                "products.$[x].expiryDates": {
                  "dateGiven": {
                    "$lte": new Date(moment().format("MM-DD-YYYY")).toISOString(true)
                  }
                }
              }
            },
            {
              arrayFilters: [
                {
                  "x.productUPC": req.params.productUPC
                }
              ]
            });
            res.send(result).status(200);
    } catch(err) {
        console.error(err);
        res.status(500).send("Error updating record.");
    }
});

router.post("/sections/:id", async (req, res) => {
    try {
        let collection = await db.collection("records");
        let result = await collection.updateOne({
            _id: new ObjectId(req.params.id)
          },
          {
            $push: {
              products: {
                productUPC: req.body.productUPC,
                name: req.body.productName,
                vendor: req.body.productVendor,
                expiryDates: []
              }
            }
          });
        res.send(result).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding record");
    }
});

// APIs from Employee List

// router.get("/", async (req, res) => {
//     let collection = await db.collection("records");
//     let results = await collection.find({}).toArray();
//     res.send(results).status(200);
// });

// router.get("/:id", async (req, res) => {
//     let collection = await db.collection("records");
//     let query = { _id: new ObjectId(req.params.id)};
//     let result = await collection.findOne(query);

//     if (!result) res.send("Not found").status(404);
//     else res.send(result).status(200);
// });

// router.post("/", async (req, res) => {
//     try {
//         let newDocument = {
//             name: req.body.name,
//             position: req.body.position,
//             level: req.body.level,
//         };
//         let collection = await db.collection("records");
//         let result = await collection.insertOne(newDocument);
//         res.send(result).status(204);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Error adding record");
//     }
// });

// router.patch("/:id", async (req, res) => {
//     try {
//         const query = { _id: new ObjectId(req.params.id) };
//         const updates = {
//             $set: {
//                 name: req.body.name,
//                 position: req.body.position,
//                 level: req.body.level,
//             },
//         };

//         let collection = await db.collection("records");
//         let result = await collection.updateOne(query, updates);
//         res.send(result).status(200);
//     } catch(err) {
//         console.error(err);
//         res.status(500).send("Error updating record");
//     }
// });

// router.delete("/:id", async (req, res) => {
//     try {
//         const query = { _id: new ObjectId(req.params.id) };

//         const collection = db.collection("records");
//         let result = await collection.deleteOne(query);

//         res.send(result).status(200);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Error deleting record");
//     }
// });

export default router;