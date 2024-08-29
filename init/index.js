const mongoose = require("mongoose");
const initData = require("./data.js");
const employee = require("../models/employee.js")
let MONGO_URL = "mongodb://127.0.0.1:27017/Kudosware";

main()
.then((res)=>{
    console.log(res);
})
.catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(MONGO_URL);
}


const initDB = async()=>{                             //initialising db//
    await employee.deleteMany({});                     // first empty the db before initilaise//
    initData.data = initData.data.map((obj)=>({
        ...obj,
        owner:'6606423fd4b7ebd8ad6efbc1',
    }));
    await employee.insertMany(initData.data);           // then inserting data to db//
    console.log("data was initialised");
   
}
initDB();
console.log(initData);