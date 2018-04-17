var fs = require('fs'); // require the fs, filesystem module
const CSVFILE = process.argv[2];
var transactions = [];
var moment = require('moment');
moment().toDate();
var data = '';

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

function calculate(transactions) {

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
            monthValues.push({net: Math.round(total*100)/100, month: prevMonth, year: prevYear/*, difference: (Math.round(((total/prevTotal)*100) *100)/100)-100 + '%'*/});
            total=element.amount;
        }

        prevMonth = currentMonth;
    });

    // console.log(monthValues);

    reverseAndAddDifference(monthValues);
    
}

reverseAndAddDifference = function(monthValues){
    monthValues.reverse();
    var prev = monthValues[0].net;
    monthValues.forEach(function(element){
        element.diff = ((element.net - prev)/((element.net + prev)/2))*100; + '%';

        
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
