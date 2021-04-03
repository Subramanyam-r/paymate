const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
mongoose.connect('mongodb+srv://paymate:process.env.MONGOPASSWORD@paymate.nxpho.mongodb.net/customersDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
const customerSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    balance: Number,
});

const Customer = mongoose.model('customer', customerSchema);

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view-engine', 'ejs');

app.get("/", (req, res) => {
    res.render("home.ejs", {});
});

app.get("/customers", (req, res) => {

    Customer.find({}, (err, docs) => {
        res.render("customerlist.ejs", {customerList: docs});
    });

});

app.get("/customers/:id", (req, res) => {
    Customer.findById(req.params.id, (err, docs) => {
        if(docs) {
            if(req.params.pay == "pay") {
                console.log("Itz pay!");
            }
            res.render("viewcustomer.ejs", {customerDetails: docs});
        } else {
            console.log("No docs");
        }
    });
});

app.post("/transfer", (req, res) => {
    let customerName = req.body.customerName;

    Customer.find({}, (err, docs) => {
        res.render("transferpage.ejs", {customerDetails: docs, beneficiary: customerName});
    });
});

app.post("/confirmation", (req, res) => {
    let clientUser = req.body.clientUser;
    let beneficiary = req.body.beneficiary;
    let amount = req.body.amount;

    Customer.findOneAndUpdate({name: clientUser}, { $inc: { balance: -amount } }, (err, docs) => {
        if(err) {
            console.log(err);
        } else {
            console.log(docs);
        }
    });
    Customer.findOneAndUpdate({name: beneficiary}, { $inc: { balance: amount } }, (err, docs) => {
        if(err) {
            console.log(err);
        } else {
            console.log(docs);
        }
    });
    
    res.redirect("/customers");
});

app.listen(3000, () => {
    console.log("Server running is up!");
});