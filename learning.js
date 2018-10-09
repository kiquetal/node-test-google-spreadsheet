var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');
var doc = new GoogleSpreadsheet('1OVoSmZ_WSM2q9iyR2Cdrgd37dmSI5vbx9mCop2yBIXc');
var sheet;


function executeSeries() {

    async.series([
        function setAuth(step) {
            var creds = require('./JiraActivities-0db1f01c320f.json');
            doc.useServiceAccountAuth(creds, step);
        },
        function getInfoAndWorksheets(step) {
            doc.getInfo(function (err, info) {
                console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
                sheet = info.worksheets[0];
                console.log(JSON.stringify(sheet));
                console.log('sheet 1: ' + sheet.title + ' ' + sheet.rowCount + 'x' + sheet.colCount);
                step();
            });
        },
        createSheet,
        //createHeader,
        //editCell
    ], function (err) {
        if (err) {
            console.log('Error: ' + err);
        }
    });

}
var developers=["enrique.melgarejo","felipe.hermosilla","jose.colman","andrea.forneron","luis.encina","jaqueline.probst","christian.benitez","santiago.tortora","miguel.godoy","jorge.vallejos","ignacio.rojas"];
var developers=["enrique.melgarejo","jose.colman"];
obtainFeedJira();
function createSheet(step)
{





}
function testDate()
{
    var moment=require('moment');
    var a = moment().subtract(1,'day');
    var b = moment();





}


function createHeader(step)
{
    sheet.setHeaderRow(["Name","EntryTitle","Edad"],function (err,headers){
        console.log("adding header row");
        step();
    });

}
function editCell(step)
{

    sheet.getCells({
        'min-row': 2,
        'max-row': 5,
        'return-empty': true
    }, function(err, cells) {



        console.log(JSON.stringify(cells));
        var cell = cells[0];
        console.log('Cell R'+cell.row+'C'+cell.col+' = '+cell.value);

        // cells have a value, numericValue, and formula
        cell.value = 'kiquetal'

        // updating `value` is "smart" and generally handles things for you
        cell.save(); //async

        // bulk updates make it easy to update many cells at once

        step();
    });



}


function obtainDateBetween()
{

    var moment = require("moment");
    var a = moment().startOf('day');
    var b = moment().endOf('day');


    return "BETWEEN+"+a+"+"+b;


}

function obtainFeedJira() {


    var uris=[];
    developers.forEach(function (v,i,f)
    {


        var name=v;
        var uri="https://jira.tigo.com.hn/activity?streams=user+IS+"+name+"&amp;streams=update-date+"+obtainDateBetween()+"&amp;os_authType=basic&amp;maxResults=50";
        uris.push({uri:uri,name:name});

    });

    console.log(uris);
    async.each(uris,function (obj,callback)
    {
        var r=require("request");
        var headers= {
            "Authorization":"Basic ZW5yaXF1ZS5tZWxnYXJlam86Y29uanVyYTcwMA=="
        };

        r({headers:headers,url:obj.uri,method:"GET"}, function(err,data,body)
        {

            if (err)
            {
                callback("Error debido a " + err)

            }
            else {



                var jsonData=parserXml(body);

                var entriesInDate=jsonData["feed"]["entry"].filter(function (entry)
                {

                    return isInBetweenDate(entry);

                });


                createGoogleSheet(entriesInDate,callback)


            }

        });

   },function (error){
        if (error)
        console.log("error en "+ error);
    });

}

function createGoogleSheet(entries,callback)
{





}


function isInBetweenDate(entry)
{
    var moment = require("moment");
    var a = moment().startOf('day');
    var b = moment().endOf('day');


    var time=entry.updated[0];
    time=moment(time).utcOffset(time);

    return time.isBetween(a,b);


}

function fake(){




}




function parserXml(feed)
{
    var xml2js=require("xml2js");
    var parser=new xml2js.Parser();

    var dataJSON="";
    parser.parseString(feed, function (err,data)
    {
        dataJSON=data;

    });
    return dataJSON;



}
