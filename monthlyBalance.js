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
    var balanceIndex = data.match(/Balance:.*\.[0-9]{2}/);

    while (dateIndex && descriptionIndex && amountIndex) {
        var transactionDate = moment(dateIndex[0], 'DD/MM/YYYY');
        transactionDate.isValid();
        var transactionDescription = descriptionIndex[0].slice(13);
        var transactionAmount = parseFloat(amountIndex[0].slice(8));

        console.log(balanceIndex[0].slice(9));
        var transactionBalance = parseFloat(balanceIndex[0].slice(9));

        data = data.slice(amountIndex.index + 1);

        transactions.push({ date: transactionDate, description: transactionDescription, amount: transactionAmount, balance: transactionBalance });

        dateIndex = data.match(/Date:.*(?=\s)/);
        descriptionIndex = data.match(/Description:.*(?=\s)/);
        amountIndex = data.match(/Amount:.*\.[0-9]{2}/);
        balanceIndex = data.match(/Balance:.*\.[0-9]{2}/);
    }

    calculate(transactions);
}

calculate = function(transactions) {

    var prevMonth = 0
    var currentYear = transactions[0].date.format('Y');
    var prevYear = transactions[0].date.format('Y');
    var monthValues = [];
    var total=0;
    var balance=0;

    transactions.reverse();

    transactions.forEach(function(element){
        
        currentMonth = element.date.format('M');
        currentYear = element.date.format('Y');
        balance = element.balance;

        if(currentMonth!=prevMonth)
        {
            prevMonth=currentMonth;
            monthValues.push({date: monthMap[currentMonth-1] + ' ' + currentYear, balance: balance});
        }
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
