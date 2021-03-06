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
var developers=["enrique.melgarejo","felipe.hermosilla","jose.colman","andrea.forneron","luis.encina","jaqueline.probst","miguel.godoy","jorge.vallejos","ignacio.rojas","christian.benitez"];
//var developers=["enrique.melgarejo","jose.colman","felipe.hermosilla"];
obtainFeedJira();

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
    var a = moment().subtract('1','day').startOf('day');
    var b = moment().endOf('day').endOf('day');


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


                var jsonData = parserXml(body);

                if (jsonData["feed"]["entry"] != null) {
                    var entriesInDate = jsonData["feed"]["entry"].filter(function (entry) {

                        return isInBetweenDate(entry);

                    });
                    console.log("tickets" + obj.name + "[" + entriesInDate.length + "]")

                  //  console.log(JSON.stringify(entriesInDate));
                  //  callback();
                    createGoogleSheet(entriesInDate, obj.name, callback)

                }
                else
                {
                    callback()
                }
            }


        });

   },function (error){
        if (error) {
            console.log("[FeedJIRA] " + error.toLocaleString());
        }
        else
            console.log("[FEDDJIRA] NO ERROR");
    });

}

function createGoogleSheet(entries,name,callback)
{

    console.log("waterfall init for name:" + name);
    async.waterfall([

            function setAuth(step) {
                var creds = require('./JiraActivities-0db1f01c320f.json');
                doc.useServiceAccountAuth(creds, step);
            },
            function infoDoc(step) {
                doc.getInfo(function (err, info) {
                    console.log('Loaded doc: ' + info.title + ' by ' + info.author.email);
                    sheet = info.worksheets;
                    step(null);
                });
            },
             checkAllSheet.bind(null,{name:name}),
             createSheet.bind(null,{entries:entries,name:name})
        ],
        function (error,results){
        if (error)
        {
            console.log("Waterfall [Error]" + error.toString());
            callback(error.toLocaleString())
        }
        else
        {
            console.log("finish waterfall for " + name)
            callback();
        }
        })


    /*
    async.series([
        function setAuth(step) {
            var creds = require('./JiraActivities-0db1f01c320f.json');
            doc.useServiceAccountAuth(creds, step);
        },
       checkAllSheet,
       createSheet.bind(null,{"name":name,"entries":entries}),
        //createHeader,
        //editCell
    ], function (err) {
        if (err) {
            console.log('Error: ' + err);
        }
        else
            callback();
    });
*/


}

function checkAllSheet(ctx,step)
{
    console.log("checking" + JSON.stringify(ctx));
    var flagCreateSheet=true;
    doc.getInfo(function (err,info){


        if (err) step(err);

        info.worksheets.forEach(function (v,i,t){

            if (v.title ==ctx.name )
            {
                flagCreateSheet=false;

            }

        });

               step(null,flagCreateSheet);
    });


}
function createSheet(ctx,toCreate,step)
{


    console.log("ingresamos aqui")
    console.log("To create worksheet" + toCreate);

    if (toCreate) {
        doc.addWorksheet({
            "title": ctx.name,
            "rowCount": ctx.entries.length > 0 ? ctx.entries.length : 2,
            "headers": ["User", "Summary", "Description", "Link","Updated"]
        }, function (err, worksheet) {
            if (err) {
                console.log("error " + err)
                step("error");
            }
            else {
                console.log(JSON.stringify(worksheet));
                addEntriesToWorkSheet(worksheet,ctx.entries,ctx.name);
                step(null);
            }

        });
        ;
    }
    else {

        console.log("variable sheet" + sheet)
                    var sheetByUser=sheet.filter(function (v,i,s){
                return v.title==ctx.name;
            });



            ctx.entries.forEach(function (v,i,s){

                var objToPersist=transform(v);
                objToPersist["User"]=ctx.name;
                sheetByUser[0].addRow(objToPersist,function(err,result){
                    if (err)
                    {
                        console.log("error escribiendo " + err.toString());
                    }
                    else
                    {
                        console.log("ok");
                    }
                })


            });

            sheetByUser[0].getRows({
                offset: 1,
                limit: 150,

            }, function( err, rows ){
                console.log('Read '+rows.length+' rows');
                rows.forEach(function (r,i,s){
                    console.log(JSON.stringify(r["user"]));
             //       r["user"]="nodejs";
               //     r.save();
                })


            });

            step(null)


    }






}

function addEntriesToWorkSheet(worksheet,entries,name)
{
    entries.forEach(function (v,i,s){

        var objToPersist=transform(v);
        objToPersist["User"]=name;
        worksheet.addRow(objToPersist,function (err,result){

            if (err)
            {
                console.log("imposible crear registro");
            }

        })


    })

}


function transform(entry)
{
    console.log(JSON.stringify(entry));
    var obj={};
    obj["Link"]=entry["link"][0]["$"]["href"];;
    obj["Updated"]=entry["updated"][0];
    if (entry["activity:object"][0].hasOwnProperty("summary"))
    {
        obj["Summary"]=entry["activity:object"][0]["summary"][0]["_"];
    }
    else
        if (entry.hasOwnProperty("activity:target"))
        {

            obj["Summary"]=entry["activity:target"][0]["summary"][0]["_"];


        }

    return obj;



}


function isInBetweenDate(entry)
{
    var moment = require("moment");
    var a = moment().subtract('1','day').startOf('day');
    var b = moment().endOf('day').endOf('day');


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