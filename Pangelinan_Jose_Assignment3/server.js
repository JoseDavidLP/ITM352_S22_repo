/*
Jose Pangelinan
Assignment 3
June 8, 2022
This is the server for store app 
most of the code came from assignment 2 code but has been change a lot based on the needs of my website (see comments)

used for: 
   displaying products for beer whiskey and wine (6 products each)
   give users session and cart where data is stored till checkout
   track users login/logout -- will be personalized for every user
   some features include:
   login/logout/register/change data/
   cart checkout/cart update/ add to cart/ 
*/

//load product data
var express = require('express');
var fs = require('fs')
//file system module (login & registration)
const qs = require('querystring');
var app = express();
var products_data = require(__dirname + '/products.json');
//E3.js LAB 15 COOKIE and sessions
//this will give the users cookies and defined the sessions
// this will encrypt the cookies so that no one can pose and a different user
// all encrypted data is unique
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
var session = require('express-session');
app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));
//nodemailer 
var nodemailer = require('nodemailer');
//user data file
var filename = 'user_data.json';
//store the data from purchase 
var qty_data_obj = {};

if (fs.existsSync(filename)) {
   var data = fs.readFileSync(filename, 'utf-8');
   var users = JSON.parse(data);
} else {
   console.log(`${filename} doesn't exist :(`);
}

//To access inputted data
app.use(express.urlencoded({ extended: true }));

//data validation tool
function isNonNegInt(q, returnErrors = false) {
   //If returnErrors is true, array of errors is returned
    //others return true if q is a non-neg int.
   errors = []; // assume no errors
   if (q == '') q = 0  //blank means 0
   if (Number(q) != q) errors.push('<font color="red">Not a number</font>'); //check if value is a number
   if (q < 0) errors.push('<font color="red">Negative value</font>'); // Check if it is non-negative
   if (parseInt(q) != q) errors.push('<font color="red">Not an integer</font>'); // Check if it is an integer

   return returnErrors ? errors : (errors.length == 0);
}

//UPDATED from meeting with prof port
//adds req and res functions
//allows for the server to get lastpage to redirect user to after successful login/register/update information
app.all('*', function (request, response, next) {
   console.log(`Got a ${request.method} to path ${request.path}`);
   // need to initialize an object to store the cart in the session.
   //this will give the user a cart if there is none
   if(typeof request.session.cart == 'undefined') {  
      request.session.cart = {}; //empty cart
    } 
    //code from office sessions with PROF PORT
      var backURL=request.header('referer') || "/"; // sets backURL to previouos page if page does not include "login", "update_info", "newpw", "regist"
      if (backURL.includes("login") == false && backURL.includes("regist") == false && backURL.includes("newpw") == false && backURL.includes("update_info") == false) {
         request.session.lastpage = backURL;
      }
      console.log(request.session.lastpage,backURL ); // check to see if working and ITS GOOD!

   next();
});

//gets product data
app.post("/get_products_data", function (request, response) {
   response.json(products_data);
});

/* ------------------ADD TO CART ------------------------------ADD TO CART-----------------------------------------ADD TO CART-------------------------------ADD TO CART----------------------------- */
app.post("/add_to_cart", function(request, response) {
    console.log(request.body);
    let params = new URLSearchParams(request.body);
    // changs body into variables for easy use
    var product_key = request.body['products_key'];
    var quantity_submit = request.body['quantity'];
    // errors is set to 0
    var errors = {};
    // this validates the quantities
    // This checks for whether it passes the isNonNegInt or if we have enough quantities for their order
    for (i in products_data[product_key]) {
        let q = quantity_submit[i];
        if (isNonNegInt(q) == false) {
            errors[`quantity[${i}]`] = `${q} is not a valid quantity!`;
        } else {
            if (q > products_data[product_key][i]['quantity_available']) {
                errors[`quantity[${i}]`] = `We don't ${q} in stock!`;
            }
        }
    }
    if (Object.keys(errors).length === 0) {
      if (typeof request.session.cart == 'undefined') {
          //gives user a cart
          request.session.cart = {};
      }
      if (typeof request.session.cart[product_key] == 'undefined') {
          // sets the array values to 0 for all products
          request.session.cart[product_key] = new Array(quantity_submit.length).fill(0);
      }
      for (i in request.session.cart[product_key]) {
          //this gives the array the values of each data 0,0,0,0,0, -> 0,1,1,0,0 like this
          request.session.cart[product_key][i] += Number(quantity_submit[i]);
      }
  } else {
      // if there are errors it will be sent back
      params.append('qty_data', JSON.stringify(request.body));
      params.append('qty_errors', JSON.stringify(errors));
  }
   console.log(request.session);
   response.redirect(`display_products.html?products_key=${product_key}`);
   
});

/* ------------------SAVING SESSION ------------------------------SAVING SESSION-------------------------------------------------SAVING SESSION--------------------------------SAVING SESSION---------- */
// This will be used when ever a site needs to get info from the session like the cart or username
app.get("/session_data.js", function (request, response, next) {
   response.type('.js');
   // gives user shopping cart if there isnt any
   if (typeof request.session.cart == 'undefined') {
       request.session.cart = {};
   }

   // declare the username, email, cart and keeps the data in 1 variable under sessions string
   var session_str = `var user_name = ${JSON.stringify(request.session.name)}; var user_email = ${JSON.stringify(request.session.email)}; var cart_data = ${JSON.stringify(request.session.cart)};`;
   // send the client the session string just created
   response.send(session_str);
})


/* ------------------GET CART ----------------------------------GET CART---------------------------GET CART------------------------------------GET CART---------------GET CART------------------- */
//get cart from workshop and code examples
app.post("/get_cart", function (request, response) {
   response.json(request.session.cart);

});


//ASK ABOUT THIS//ASK ABOUT THIS//ASK ABOUT THIS//ASK ABOUT THIS//ASK ABOUT THIS//ASK ABOUT THIS//ASK ABOUT THIS//ASK ABOUT THIS//ASK ABOUT THIS//ASK ABOUT THIS
/* ------------------CART UPDATE -----------------------------CART UPDATE--------------------------------------CART UPDATE-------------------------------------------CART UPDATE------------------- */
//alows user to update the cart from the cart page so user does not need to go back and fourth when adding products to their cart
app.post("/cart_update", function (request, response, next) {
   console.log(request.body);
  
           request.session.cart = request.body.cart_update;
       
   console.log(request.session); //check to see if this works 
   response.redirect("./cart.html");
})



/* ------------------ CHECKOUT  --------------------------------------------- CHECKOUT --------------------------------- CHECKOUT ----------------------- CHECKOUT ----------------------------- */
//cart checkout, mostely from example codes and meeting with prof port

app.post("/cart_checkout", function (request, response) {
   var user_info= JSON.parse(request.cookies["user_info"]);
  // Generate HTML invoice string / this is just to keep the webpage consistant in all pages
  // if user is not logged in the checkout button will not show and you are unable to checkout
  if (user_info["name"] == 'undefined') {
   console.log(`username NOT found`);
   response.redirect('/cart.html?NotLoggedIn');
} else {
console.log(`found a username`);//test to see if it is working
console.log(user_info["name"]);//test to see if it is working

//takes the last session cart and subtracts the quantity from each product from the quantity_availiable
//updates quantity_availiable to last_cart which is the true inventory value after checking out 
var last_cart = request.session.cart;
    for (product_key in products_data) {
        for ( i = 0; i < products_data[product_key].length; i++) {
            // from here, if the brand is not a part of the cart, it'll just continue and update any that do
            if (typeof last_cart[product_key] == 'undefined') continue;{
                var last_qty = last_cart[product_key][i];
                products_data[product_key][i]['quantity_available'] -= last_qty;
            }
        }
    };
//this is the invoice that will be sent through email
var invoice_str = `<span style="display: flex; font-size: large; color: black; justify-content: center; text-align: center;">Thank you for your order ${user_info["name"]}!</span><br><table border="2px">
<thead>
    <th>
        Product
    </th>
    <th>
        Quantity
    </th>
    <th>
        Price
    </th>
    <th>
        Extended Price
    </th>
</thead>`;
var shopping_cart = request.session.cart;
let subtotal = 0;
console.log(user_info["name"])
// need to get total from qs
// having trouble with getting shopping cart total from the cart itself
let params = new URLSearchParams(request.query);

if (params.has('total')) {
    var total = params.get('total');
}
console.log(total);
let total_quantity = total;

for (product_key in products_data) {
    for (i = 0; i < products_data[product_key].length; i++) {
        if (typeof shopping_cart[product_key] == 'undefined') continue;
        qty = shopping_cart[product_key][i];
        if (qty > 0) {
            extended_price = products_data[product_key][i]['price'] * qty;
            subtotal = subtotal + extended_price;
            invoice_str += `<tr>
            <td>
                ${products_data[product_key][i]['name']}
            </td>
            <td>
            ${qty}
            </td>
            <td>
                $${products_data[product_key][i]['price']}
            </td>
            <td>$${extended_price.toFixed(2)}</td>
        </tr>`;
        }
    }
}

 //Tax @4.5%
 var tax_rate = .045;
 var sales_tax = tax_rate * subtotal;

 //SHIPPING
 var shipping;
 if (subtotal > 500) {
     shipping = 0;
 } else if (subtotal >= 0 && subtotal < 150) {
     shipping = 10;
 } else {
     shipping = 15;
 }

 //Calculate Grand total
 var grand_total = subtotal + sales_tax + shipping;

    invoice_str += `<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
    <tr><td class="text-right"><strong>Subtotal</strong><td>&nbsp;</td></td><td>&nbsp;</td><td><strong>$${subtotal.toFixed(2)}</strong></td></tr> 
    
    <tr><td class="text-right"><strong>HI Sales Tax @ 4.5%</strong><td>&nbsp;</td></td><td>&nbsp;</td><td><strong>$${sales_tax.toFixed(2)}</strong></td></tr> 
    <tr><td class="text-right"><strong>Shipping</strong><td>&nbsp;</td></td><td>&nbsp;</td><td><strong>$${shipping.toFixed(2)}</strong></td></tr>
    <tr><td class="text-right"><strong>Grand Total</strong><td>&nbsp;</td></td><td>&nbsp;</td><td><strong>$${grand_total.toFixed(2)}</strong></td></tr>
    
    </table>`;
    
  // Set up mail server. Only will work on UH Network due to security restrictions
  // got this code from assignment3 examples
    var transporter = nodemailer.createTransport({
      host: "mail.hawaii.edu",
      port: 25,
      secure: false, // use TLS
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      }
    });
  
    var user_email = user_info["email"];
    var mailOptions = {
      from: 'jdlp@hawaii.edu',
      to: user_email,
      subject: 'Water Of Life invoice',
      html: invoice_str
    };
    console.log(user_email);
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        invoice_str += '<br>There was an error and your invoice could not be emailed';
      } else {
        invoice_str += `<br>Your invoice was mailed to ${user_email}`;
      }
      response.redirect(`./invoice.html`);
    });
}
  });
  /* ------------------EXIT INVOICE FORM------------------------------------EXIT INVOICE FORM-----------------------------------EXIT INVOICE FORM---------------------------------EXIT INVOICE FORM----------------- */
//when user exits invoice the session will clear, 
//the cart will reset, 
//and you will be redirected to HOME page.
//BUT you will still be signed in
  app.post("/exitinvoice", function (request, response) {
   console.log('got the exit');
   request.session.cart = {};
   console.log(request.session.cart);
   response.redirect('./index.html');
})
  

/* ------------------LOGIN FORM---------------------LOGIN FORM-----------------------------LOGIN FORM-----------------------------LOGIN FORM---------------------------------LOGIN FORM--------------------------------- */
// taken from my assignment 2 where the code was inspired by https://github.com/youngtsx
app.post("/process_login", function (request, response) { 
   var errors = {};
   //login form info from post
   var user_email = request.body['email'].toLowerCase();
   var the_password = request.body['password']
   var login_username = request.body['name']
   //check if username exists, then if entered password matches, lab 13 ex3-4
   if (typeof users[user_email] != 'undefined') {
      //check if entered password = the stored password
      if (users[user_email].password == the_password) {
         //if matches then...
         qty_data_obj['email'] = user_email;
         qty_data_obj['fullname'] = users[user_email].name;
          //Gets variable for cookie to display username on pages and sets it into variable user_info
          var user_info = { "email": user_email, "name": qty_data_obj['fullname'], };
          //Gives cookie a expiration time and will hold user info for 30 minutes
          response.cookie('user_info', JSON.stringify(user_info), { maxAge: 30 * 60 * 1000 });
         //redirects to last page where user came from
         let params = new URLSearchParams(qty_data_obj);
         console.log(user_info);
  response.redirect(request.session.lastpage);

         return;
      } else {
         //output password doesnt match
         errors['login_err'] = `Wrong Password`;
      }
   } else {
      //output email doesn't exist
      errors['login_err'] = `Wrong Email`;
   }
   //redirect to login with error message
   let params = new URLSearchParams(errors);
   params.append('email', user_email); //put username into params
   response.redirect(`./login.html?`);
});

/* ------------------LOGOUT FORM--------------------------LOGOUT FORM-----------------------------------LOGOUT FORM-----------------------------------LOGOUT FORM------------------------------------------- */
// taken from my assignment 2 where the code was inspired by https://github.com/youngtsx
app.get("/logout", function (request, response) { 
   var user_info = request.cookies["user_info"]; //turns data from the cookie into a variable 
   console.log(JSON.stringify(user_info));
   if (user_info != undefined) {
       var username = user_info["name"]; 
       request.session.destroy(); // destroys the previous session
       logout_msg = `<script>alert('You have logged out! Log back in to continue shopping.'); location.href="./index.html";</script>`; //redirects to index, start of store
       response.clearCookie('user_info'); //destroys cookie user information when logout
       response.send(logout_msg); //if logged out, send message to user from 2 lines above
       request.session.destroy(); // when loggoed out, destroy the session
       
//if no user is logged in, 
//display error message 
//& redirect to home page
   } else { 
       logouterror_msg = `<script>alert("You are not logged in."); location.href="./index.html";</script>`;
       response.send(logouterror_msg);

   }
});

/*----------------REGISTRATION PAGE---------------------------REGISTRATION PAGE----------------------------REGISTRATION PAGE------------------------------------------REGISTRATION PAGE------------------------*/
//process all registration requests
//if there are 0 errors then redirect to
// all data goes through validation before getting passed through
// taken from my assignment 2 where the code was inspired by https://github.com/youngtsx
app.post("/register", function (request, response) {
   //starts with 0 errors
   var registration_errors = {};
   //gets email input and turns to variable
   var reg_email = request.body['email'].toLowerCase();

   //check email fomatting
   if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(request.body.email) == false) {
      registration_errors['email'] = `Please enter a valid email`;
      //if there is no input for email send error
   } else if (reg_email.length == 0) {
      registration_errors['email'] = `Enter an email`;
   }

   //if email is already registered send error
   if (typeof users[reg_email] != 'undefined') {
      registration_errors['email'] = `This email has already been registered`;
   }

   //if password is greater than 8 characters then continue
   if (request.body.password.length < 8) {
      registration_errors['password'] = `Minimum 8 characters`;
      //if there is no input for password send error
   } else if (request.body.password.length == 0) { 
      registration_errors['password'] = `Enter a password`;
   }

   //if password matches then continue, if not send error
   if (request.body['password'] != request.body['repeat_password']) {
      registration_errors['repeat_password'] = `The passwords do not match`;
   }

   //full name validation
   if (/^[A-Za-z, ]+$/.test(request.body['fullname'])) {
      //check if the fullname is correct   
   } else {
      registration_errors['fullname'] = `Please enter your full name`;
   }
   //check if fullname is less than 30 characters
   if (request.body['fullname'].length > 30) {
      registration_errors['fullname'] = `Please enter less than 30 characters`;
   }

   //assignment 2 code examples
   //save new registration data to user_data.json in a string
   if (Object.keys(registration_errors).length == 0) {
      console.log('no registration errors')//store user data in json file
      users[reg_email] = {};
      users[reg_email].password = request.body.password;
      users[reg_email].name = request.body.fullname;

      fs.writeFileSync(filename, JSON.stringify(users), "utf-8");

      qty_data_obj['email'] = reg_email;
      qty_data_obj['fullname'] = users[reg_email]['fullname'];
      let params = new URLSearchParams(qty_data_obj);
      response.redirect(request.session.lastpage); //all good! => to last page
   } else {// if there is an error send them back to registration page with errors
      request.body['registration_errors'] = JSON.stringify(registration_errors);
      let params = new URLSearchParams(request.body);
      response.redirect("./registration.html?" + params.toString());
   }
});

/* -------------Changing user's data --------------------------Changing user's data-----------------Changing user's data------------------------------------Changing user's data----------------------------------------------*/
//FIXED ASSIGNMENT 2 ERROR (SEE BELOW)
// fixed any issues and updated to meet my website requirements
// users can change passwords for security
// all data goes through validation before getting passed through
// taken from my assignment 2 where the code was inspired by https://github.com/youngtsx
app.post("/newpw", function (request, response) { 
   var reseterrors = {};

   let login_email = request.body['email'].toLowerCase();
   let login_password = request.body['password'];

   if (/^[a-zA-Z0-9._]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,3}$/.test(login_email) == false) {
      reseterrors['email'] = `Please enter a valid email`;
   } else if (login_email.length == 0) {
      reseterrors['email'] = 'Please enter an email';
   }
   //check repeated password for matches fixed from assignment2 submission 
   //PASSWORD VALIDATIONS
   if (request.body['newpassword'] != request.body['repeatnewpassword']) {
      reseterrors['repeatnewpassword'] = `The new passwords do not match`;
   }
   if (typeof users[login_email] != 'undefined') {
      if (users[login_email].password == login_password) {
         //password must have minimum 8 characters
         if (request.body.newpassword.length < 8) {
            reseterrors['newpassword'] = 'Password must have a minimum of 8 characters.';
         }//password must = registered password
         if (users[login_email].password != login_password) {
            reseterrors['password'] = 'Incorrect password';
         }
         //new password must = repeated newpassword
         if (request.body.newpassword != request.body.repeatnewpassword) {
            reseterrors['repeatnewpassword'] = 'Both passwords must match';
         }//password must not = old password
         // fixed ERROR from Ass2 where user woudl get the wrong ERROR code "New password cannot be the same as the old password"
         if (request.body.newpassword == login_password) {
            reseterrors['newpassword'] = `New password cannot be the same as the old password`;
         }
      } else { //password error output
         reseterrors['password'] = `Incorrect Password`;
      }
   } else { //email error output
      reseterrors['email'] = `Email has not been registered`;
   }
 //fixed any issues
   if (Object.keys(reseterrors).length == 0) {
      //Write data and send to invoice.html
      //updated code to add name into the string
      users[login_email] = {};
      users[login_email].password = request.body.newpassword
      users[login_email].name = qty_data_obj['fullname']

      //Writes user information into file
      fs.writeFileSync(filename, JSON.stringify(users), "utf-8");

      //Add email to query
      qty_data_obj['email'] = login_email;
      qty_data_obj['fullname'] = users[login_email]['fullname'];
      let params = new URLSearchParams(qty_data_obj);
      response.redirect(request.session.lastpage); //all good! => to last page
      return;
   } else {
      //If there are errors, send back to page with errors
      request.body['reseterrors'] = JSON.stringify(reseterrors);
      let params = new URLSearchParams(request.body);
      response.redirect(`./update_info.html?` + params.toString());
   }
});

//products data
app.get("/products.js", function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});


// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));
