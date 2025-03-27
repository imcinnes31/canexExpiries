export const REACT_APP_API_URL="https://expiries-project-0e679ac0eb2f.herokuapp.com"
// export const REACT_APP_API_URL="http://localhost:5000"

// IN MONGO SHELL, OPEN URL WITHOUT QUOTES
// use canexExpiries

// MONGO SHELL COMMAND TO ADD NEW SECTION:
// db.storeSections.insertOne({_id: ObjectId(),section: "", dateLastChecked: new Date(), intervalDays: 0, expiryRange: 0, products: []});

// MONGO SHELL COMMAND TO ADD NEW PRODUCTS:
// db.storeSections.updateOne({_id: new ObjectId("")},{$push: {products: {productUPC: "",name: "",vendor: "",expiryDates: []}}});