## HI There!
Hey there, here is my solution to the coding challenge below that normalize
a CSV file.

## How to Run
Here's a couple things you probably need before you try to run:
- Install NPM
- Install NodeJS

The latest versions of NPM and NodeJS should be fine. Once you have those
installed, follow these steps:
1. Download and unzip to desired directory
OR
Clone the repository.
2. Open up a console or cmd line
3. Navigate to the local repo directory that you downloaded
3. Type in the cmd: node NormalizeCSV.js {csvfile}.csv
4. Press enter!

The tool will output the result file as: normalizedCsvOutput.csv, in the root
directory.

You can replace the "{csvfile}.csv" part with your own csv file or use one of
the files in the root directory:
- sample-with-broken-utf8.csv
- sample.csv

That's it! Thanks!

--------------------------------------------------------------------------------

## Introduction and expectations

Hi there! Please complete the problem described below to the best of
your ability, using the tools you're most comfortable with. Assume
you're sending your submission in for code review from peers;
we'll be talking about your submission in your interview in that
context.

We expect this to take less than 4 hours of actual coding time. Please
submit a working but incomplete solution instead of spending more time
on it. We're also aware that getting after-hours coding time can be
challenging; we'd like a submission within a week and if you need more
time please let us know.

If you have any questions, please contact bizops@truss.works; we're
happy to help if you're not sure what we're asking for or if you have
questions.

## How to submit your response

Please send bizops@truss.works a link to a public git repository
(Github is fine) that contains your code and a README.md that tells us
how to build and run it. Your code will be run on either macOS 10.13
or Ubuntu 16.04 LTS, your choice.

## The problem: CSV normalization

Please write a tool that reads a CSV formatted file on `stdin` and
emits a normalized CSV formatted file on `stdout`. Normalized, in this
case, means:

* The entire CSV is in the UTF-8 character set.
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

You can assume that the input document is in UTF-8 and that any times
that are missing timezone information are in US/Pacific. If a
character is invalid, please replace it with the Unicode Replacement
Character. If that replacement makes data invalid (for example,
because it turns a date field into something unparseable), print a
warning to `stderr` and drop the row from your output.

You can assume that the sample data we provide will contain all date
and time format variants you will need to handle.
