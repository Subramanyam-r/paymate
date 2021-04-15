const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const moment = require("moment");

mongoose.connect('mongodb+srv://paymate:' + process.env.MONGOPASSWORD + '@paymate.nxpho.mongodb.net/customersDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});
const customerSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    balance: Number,
});
const transactionSchema = new mongoose.Schema({
    to: String,
    from: String,
    amount: Number,
    moment: String
});

const Customer = mongoose.model('customer', customerSchema);
const Transaction = mongoose.model('transaction', transactionSchema);

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

app.get("/success", (req, res) => {
    res.render("success.ejs", {});
});

app.get("/failure", (req, res) => {
    res.render("failure.ejs", {});
});

app.get("/transactions", (req, res) => {
    Transaction.find({}, (err, docs) => {
        if(err) {
            console.log(err);
        } else {
            res.render("transactions.ejs", {transactions: docs});
        }
    });
});

app.post("/transfer", (req, res) => {
    let customerName = req.body.customerName;

    Customer.find({}, (err, customerDetails) => {
        Customer.findOne({name: customerName}, (err, beneficiaryDetails) => {
            res.render("transferpage.ejs", {customerDetails: customerDetails, beneficiaryDetails: beneficiaryDetails});
        });
    });
});

app.post("/confirmation", (req, res) => {
    let clientUser = req.body.clientUser;
    let beneficiary = req.body.beneficiary;
    let amount = req.body.amount;
    console.log(req.body);
    Customer.findOne({name: beneficiary}, (err, docs) => {
        if(docs.balance >= amount) {
            Customer.findOneAndUpdate({name: beneficiary}, { $inc: { balance: -amount } }, (err, docs) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            });
            Customer.findOneAndUpdate({name: clientUser}, { $inc: { balance: amount } }, (err, docs) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            });

            const newTransaction = new Transaction({
                to: clientUser,
                from: beneficiary,
                amount: amount,
                moment: moment().utcOffset("+05:30").format("DD-MM-YYYY HH:mm:ss [IST]")
            });

            newTransaction.save();
            
            res.redirect("/success");
        } else {
            res.redirect("/failure");
        }
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running is up!");
});