const express = require("express");
const bodyParser = require("body-parser");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");

const app = express();

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        "AZ8mAURC-IEkNDbIG_aRPvoApnpHQNnb7QrUrls79RT6Uhon42hN_y26NDE2Xef-8LBx92sCU91rVweA",
    client_secret:
        "EJYJc4U8xO3LIei9sVTYyMf3DnsQVqRrSiCm-SxOvtMe8vvmycCOWPdffPhmpi7sPYvexyEhCaKcE1QW"
});

app.post('/api/pru/', function (req, res) {

    console.log(req.body);
    app.get("/", (req, res) => {
        // console.log("_____________________________", req.params)
        res.render("index");
    });

    app.get("/paypal", (reqe, res) => {
        let create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://192.168.1.171:3000/success", //Ponga su localhost o host en la nube
                "cancel_url": "http://192.168.1.171:3000/cancel"   //Ponga su localhost o host en la nube
            },
            "transactions": [
                {
                    "item_list": {
                        "items": [
                            {
                                "name": req.body.name,
                                "sku": req.body.sku,
                                "price": req.body.price,
                                "currency": req.body.currency,
                                "quantity": req.body.quantity
                            }
                        ]
                    },
                    "amount": {
                        "currency": req.body.currency,
                        "total": "100.00"
                    },
                    "description": "Descripcion de la compra."
                }
            ]
        };


        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                console.log("Create Payment Response");
                console.log(payment);
                res.redirect(payment.links[1].href);
            }
        });
    });

});

//app.post("/api/Paypal", (req, res) => {

// app.get("/", (req, res) => {
//     console.log("_____________________________", req.params)
//     res.render("index");
// });

// app.get("/paypal", (req, res) => {
//     let create_payment_json = {
//         "intent": "sale",
//         "payer": {
//             "payment_method": "paypal"
//         },
//         "redirect_urls": {
//             "return_url": "http://192.168.1.171:3000/success", //Ponga su localhost o host en la nube
//             "cancel_url": "http://192.168.1.171:3000/cancel"   //Ponga su localhost o host en la nube
//         },
//         "transactions": [
//             {
//                 "item_list": {
//                     "items": [
//                         {
//                             "name": "item",
//                             "sku": "item",
//                             "price": "100.00",
//                             "currency": "MXN",
//                             "quantity": "1"
//                         }
//                     ]
//                 },
//                 "amount": {
//                     "currency": "MXN",
//                     "total": "100.00"
//                 },
//                 "description": "Descripcion de la compra."
//             }
//         ]
//     };


//     paypal.payment.create(create_payment_json, function (error, payment) {
//         if (error) {
//             throw error;
//         } else {
//             console.log("Create Payment Response");
//             console.log(payment);
//             res.redirect(payment.links[1].href);
//         }
//     });
// });
//});




app.get("/success", (req, res) => {
    // res.send("Success");
    let PayerID = req.query.PayerID;
    let paymentId = req.query.paymentId;
    let execute_payment_json = {
        "payer_id": PayerID,
        "transactions": [
            {
                "amount": {
                    "currency": "MXN",
                    "total": "100.00"
                }
            }
        ]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.render("success");
        }
    });
});

app.get("/cancel", (req, res) => {
    res.render("cancel");
});

app.listen(3000, () => {
    console.log("Server is running");
});
