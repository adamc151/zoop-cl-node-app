var fs = require('fs'); // require the fs, filesystem module
const CSVFILE = process.argv[2];
var transactions = [];
var moment = require('moment');
moment().toDate();
var data = '';

var monthMap = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseText(data) {
    var dateIndex = data.match(/Date:.*(?=\s)/);
    //var descriptionIndex = data.match(/Description:.*(?=\s)/);
    var descriptionIndex = data.match(/Description:.*\s/);
    var amountIndex = data.match(/Amount:.*\.[0-9]{2}/);

    while (dateIndex && descriptionIndex && amountIndex) {
        var transactionDate = moment(dateIndex[0], 'DD/MM/YYYY');
        transactionDate.isValid();
        var transactionDescription = descriptionIndex[0].slice(13);
        var transactionAmount = parseFloat(amountIndex[0].slice(8));

        data = data.slice(amountIndex.index + 1);

        transactions.push({ date: transactionDate, description: transactionDescription, amount: transactionAmount });

        dateIndex = data.match(/Date:.*(?=\s)/);
        descriptionIndex = data.match(/Description:.*(?=\s)/);
        amountIndex = data.match(/Amount:.*\.[0-9]{2}/);
    }

    calculate(transactions);
}

calculate = function(transactions) {

    var currentMonth = transactions[0].date.format('M');
    var prevMonth = transactions[0].date.format('M');
    var currentYear = transactions[0].date.format('Y');
    var prevYear = transactions[0].date.format('Y');
    var monthValues = [];
    var total=0;

    transactions.forEach(function(element){
        
        currentMonth = element.date.format('M');
        currentYear = element.date.format('Y');
        
        if(currentMonth == prevMonth && element!=transactions[transactions.length-1]){
            total+=element.amount;
        }
        else{
            monthValues.push({ date: monthMap[prevMonth-1] + ' ' + prevYear, net: Math.round(total*100)/100 /*element.date.format('DD/MM/YYYY') , month: prevMonth, year: prevYear*/});
            total=element.amount;
        }

        prevMonth = currentMonth;
        prevYear = currentYear;
    });

    reverseAndAddDifference(monthValues);    
}

reverseAndAddDifference = function(monthValues){
    
    monthValues.reverse();
    var prev = monthValues[0].net;

    monthValues.forEach(function(element){
        // element.diff = ((prev - element.net)/((element.net + prev)/2))*100 + '%';
        element.diff = Math.round((element.net - prev)*100)/100;
        prev = element.net;
    });
    console.log(monthValues);
}

var stream = fs.createReadStream(CSVFILE);

stream
    .on('data', function(chunk) {
        data += chunk;
    })
    .on('end', function() {
        parseText(data);
    });

//stream.pipe(csvStream);
