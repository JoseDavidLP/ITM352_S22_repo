var day = 25;
var month = "April";
var year = 2000;

monthKey = {
    January:0,
    February:3,
    March:2,
    April:5,
    May:0,
    June:3,
    July:5,
    August:1,
    September:4,
    October:6,
    November:2,
    December:4,
}

var step1 = year;
(month == "January" || month =="February") ? (step1--) : step1;

var step2 = step1 + parseInt(step1 / 4);
var step3 = step2 - parseInt(step1 / 100);
var step4 = step3 + parseInt(step1 / 400);
var step5 = step4 + day;
var step6 = step5 + monthKey[month];
var step7 = step6 % 7;

dayoftheweek = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

console.log(month ,day, year , "is a" , dayoftheweek[step7]);