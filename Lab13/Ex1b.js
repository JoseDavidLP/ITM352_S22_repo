//this gets user data and parse it
var filename = ("./user_data.json");

const fs = require("fs");

if(fs.existsSync(filename)){
    let stats = fs.statSync(filename);
    console.log(`${filename} has ${stats.size} characters`);
var data = fs.readFileSync(filename, 'utf-8');
var users = JSON.parse(data); 
    if(typeof users["kazman"] != 'undefined'){
console.log(users["kazman"].password);
    }
} else{
    console.log(`${filename} does not exist`);
}

var express = require('express');
var app = express();

