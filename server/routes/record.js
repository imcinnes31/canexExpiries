import express from "express";

import db from "../db/connection.js";

import { ObjectId } from "mongodb";

import moment from "moment";

const router = express.Router();

const creditVendors = ["Saputo","Coca-Cola","Pepsi-Cola"];

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
            "needsChecking": 1
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
                dateLastChecked: moment().toISOString(true)
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
    try {
        let collection = await db.collection("storeSections");
        let result = await collection.updateOne({
            "products.expiryDates.dateGiven": {
              $ne: moment(req.params.expiryDate).toISOString(true)
            }
          },
          {
            $push: {
              "products.$[x].expiryDates": {
                "dateGiven": moment(req.params.expiryDate).toISOString(true),
                "discounted": false
              }
            }
          },
          {
            arrayFilters: [
              {
                "x.productUPC": req.params.productUPC
              }
            ]
          })
          
        res.send(result).status(200);
    } catch(err) {
        console.error(err);
        res.status(500).send("Error updating record.");
    }
});

router.get("/discounts/", async (req, res) => {
    let threeDaysFromNow = moment().add(3, "days").toISOString(true);
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
                threeDaysFromNow
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
          "$group": {
            "_id": "$products.productUPC",
            "productName": {
              "$addToSet": "$products.name"
            }
          }
        },
        {
          "$project": {
            _id: 0,
            productUPC: "$_id",
            productName: {
              "$first": "$productName"
            }
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
            "$products.expiryDates.dateGiven",
            moment().toISOString(true)
          ]
        }
      }
    },
    {
      "$group": {
        "_id": "$products.productUPC",
        "productName": {
          "$addToSet": "$products.name"
        }
      }
    },
    {
      "$project": {
        _id: 0,
        productUPC: "$_id",
        productName: {
          "$first": "$productName"
        }
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
        let threeDaysFromNow = moment().add(3, "days").toISOString(true);
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

router.delete("/discounts/:productUPC", async (req, res) => {
    try {
        let collection = await db.collection("storeSections");
        let result = await collection.updateOne({},
            {
              $pull: {
                "products.$[x].expiryDates": {
                  "dateGiven": {
                    "$lte": moment().toISOString(true)
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

router.get("/", async (req, res) => {
    let collection = await db.collection("records");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
});

router.get("/:id", async (req, res) => {
    let collection = await db.collection("records");
    let query = { _id: new ObjectId(req.params.id)};
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
});

router.post("/", async (req, res) => {
    try {
        let newDocument = {
            name: req.body.name,
            position: req.body.position,
            level: req.body.level,
        };
        let collection = await db.collection("records");
        let result = await collection.insertOne(newDocument);
        res.send(result).status(204);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding record");
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const updates = {
            $set: {
                name: req.body.name,
                position: req.body.position,
                level: req.body.level,
            },
        };

        let collection = await db.collection("records");
        let result = await collection.updateOne(query, updates);
        res.send(result).status(200);
    } catch(err) {
        console.error(err);
        res.status(500).send("Error updating record");
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };

        const collection = db.collection("records");
        let result = await collection.deleteOne(query);

        res.send(result).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting record");
    }
});

export default router;