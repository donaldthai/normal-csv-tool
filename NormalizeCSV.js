const fs = require('fs');
const readline = require('readline');
const stream = require('stream');
const utf8 = require('utf8');

/*
  Normalize a CSV input file and write to an output file: normalizedCsvOutput.csv
*/
function normalizeCSV(filePath) {
  var writeStream = fs.createWriteStream('normalizedCsvOutput.csv');
  var endStream = function () {
    writeStream.end();
    console.log("Done normalizing csv! Output file: normalizedCsvOutput.csv")
  }
  var headers = [];
  var write = function(line, lineNum) {
    var colData = parseCSV(line, ",");
    var lineToWrite = "";
    for (var i = 0; i < colData.length; i++) {
      var value = utf8.decode(utf8.encode(colData[i])).toString();
      //line 1 headers
      if (lineNum === 1) {
        value = value.toUpperCase();
        headers.push(value);
      } else {
        //otherwise just format the values
        value = format(headers[i], value, colData, headers);
      }

      if (value === undefined) {
        //check if value is undefined
        //drop the line and don't write to file
        console.warn("Invalid data. Dropping line: " + lineNum + " from output file.");
        lineToWrite = "";
        break;
      }

      //this will skip any writes
      lineToWrite += value;

      if (i < colData.length - 1) {
        lineToWrite += ",";
      }
    }

    //only write if there's content
    if (lineToWrite != "") {
      lineToWrite += "\n";
      //write line at the end
      writeToFile(writeStream, lineToWrite);
    }
  };

  readFile(filePath, write, endStream);
}

/*
  Gets the column name
*/
function getColumnIndex(columns, columnName) {
  for (var i = 0; i < columns.length; i++) {
    if (columns[i].toUpperCase() === columnName.toUpperCase()) {
      return i;
    }
  }
}

/*
  Simple parser to parse out csv strings.
  Assumes csv is properly formatted.
  Returns column values array
*/
function parseCSV(strLine, delimiter) {
  var result = [];
  var strBuilder = "";
  var quoteStack = []; //to ignore strings
  //every char
  for (var c of strLine) {
    // to keep track of the counts of quotes
    if (c === "\"") {
      if (quoteStack.length > 0) {
        quoteStack.pop();
      } else {
        quoteStack.push(c);
      }
    }
    if (c === delimiter && quoteStack.length === 0) {
      //push value to result
      result.push(strBuilder);
      strBuilder = ""; //reset
    } else {
      strBuilder += c;
    }
  }
  result.push(strBuilder);

  return result;
}

/*
  Formats each specific col according to the normalized rules
  * The Timestamp column should be formatted in ISO-8601 format.
  * The Timestamp column should be assumed to be in US/Pacific time;
    please convert it to US/Eastern.
  * All ZIP codes should be formatted as 5 digits. If there are less
    than 5 digits, assume 0 as the prefix.
  * All name columns should be converted to uppercase. There will be
    non-English names.
  * The Address column should be passed through as is, except for
    Unicode validation. Please note there are commas in the Address
    field; your CSV parsing will need to take that into account. Commas
    will only be present inside a quoted string.
  * The columns `FooDuration` and `BarDuration` are in HH:MM:SS.MS
    format (where MS is milliseconds); please convert them to a floating
    point seconds format.
  * The column "TotalDuration" is filled with garbage data. For each
    row, please replace the value of TotalDuration with the sum of
    FooDuration and BarDuration.
  * The column "Notes" is free form text input by end-users; please do
    not perform any transformations on this column. If there are invalid
    UTF-8 characters, please replace them with the Unicode Replacement
    Character.
*/
function format(colName, colValue, colData, headers) {
  var result;
  //Timestamp,Address,ZIP,FullName,FooDuration,BarDuration,TotalDuration,Notes
  switch (colName) {
    case "TIMESTAMP":
      var dateTime = Date.parse(colValue);
      if (dateTime !== NaN) {
        var t = new Date();
        //ToDo: Since time is assumed to be Pacific Time, we can just add
        // 3 hours to get Eastern time.
        // A shortcut way of doing it but it works for this case... :)
        t.setHours(t.getHours() + 3);
        result = t.toISOString();
      }
      break;
    case "ADDRESS":
      //no work here
      break;
    case "ZIP":
      //* All ZIP codes should be formatted as 5 digits.
      // If there are than 5 digits, assume 0 as the prefix.
      if (colValue.length < 5) {
        result = "0".repeat(5 - colValue.length) + colValue;
      }
      break;
    case "FULLNAME":
      result = colValue.toUpperCase();
      break;
    case "FOODURATION":
    case "BARDURATION":
      result = convertToFloatSecs(colValue);
      break;
    case "TOTALDURATION":
      var fooduration = convertToFloatSecs(colData[getColumnIndex(headers, "FOODURATION")]);
      var barduration = convertToFloatSecs(colData[getColumnIndex(headers, "BARDURATION")]);
      result = fooduration + barduration;
      break;
    case "NOTES":
      //no work here
      break;
  }

  return result !== undefined ? result : colValue;
}

/*
  The columns `FooDuration` and `BarDuration` are in HH:MM:SS.MS
  format (where MS is milliseconds); please convert them to a floating
  point seconds format.
*/
function convertToFloatSecs(str) {
  var duration = str.split(':');
  var result = parseFloat(duration[0]) * 60 * 60 + parseFloat(duration[1]) * 60 + parseFloat(duration[2]);
  return result;
}

/*
  Writes content to the output file.
  Assumes write stream has been created.
*/
function writeToFile(writeStream, content) {
  // write some data with a base64 encoding
  writeStream.write(content);
}

/*
  Reads the input file from stdin.
  onLineCallback - callback to do action for each line
  onCloseCallback - callback to do action on close of reading file
*/
function readFile(filePath, onLineCallback, onCloseCallback) {
  var instream = fs.createReadStream(filePath);
  var outstream = new stream;
  var rl = readline.createInterface(instream, outstream);
  var lineNum = 1;
  rl.on('line', function(line) {
    if (typeof(onLineCallback) === "function") {
      onLineCallback(line, lineNum);
    }
    lineNum++;
  });

  rl.on('close', function() {
    // do something on finish here
    onCloseCallback();
  });
}

//running our main function and reading in the stdin console
normalizeCSV(process.argv[2]);
