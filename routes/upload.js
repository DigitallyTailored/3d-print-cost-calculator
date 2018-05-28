var express = require('express');
var router = express.Router();

//uploaded file handling
var fileUpload = require('express-fileupload');

//STL file parsing
var parseSTL = require('parse-stl');
var FS = require('fs');

//server variable storage for prices
var Store = require('data-store');
var store = new Store('prices', { base: '.'});

router.use(fileUpload());
var fileUploadIteration = 0;

function signedVolumeOfTriangle(p1,p2,p3){
    var v321 = p3.x*p2.y*p1.z;
    var v231 = p2.x*p3.y*p1.z;
    var v312 = p3.x*p1.y*p2.z;
    var v132 = p1.x*p3.y*p2.z;
    var v213 = p2.x*p1.y*p3.z;
    var v123 = p1.x*p2.y*p3.z;
    return (-v321 + v231 + v312 - v132 - v213 + v123)/6;
}


/* POST upload page page. */
router.post('/upload', function(req, res, next) {

    var timeStart = +new Date();

    //uploaded alright?
    if (!req.files){
        res.send(JSON.stringify({
            information: "file upload failed."
        }));
        return;
    }

    //grab the stl file name
    var fileObject = req.files.fileObject;

    //todo move this to after file processing if possible to speedup valuation time
    //store copy of file on server
    var fileObjectServer = 'uploads\\file-'+fileUploadIteration+'.stl';
    fileObject.mv(fileObjectServer, function(err) {
        if (err){
            res.send(JSON.stringify({
                information: "file move on server failed: "+ err,
            }));

            return;
        }

        fileUploadIteration++;

        //parse the file
        var buf = FS.readFileSync(fileObjectServer);

        var mesh = parseSTL(buf);
        var positions = mesh.positions;
        var triangles = positions.length;

        //calculations against parsed mesh data
        var volUnits = 0;
        var d = [];
        d[0] = {bottom: 0, top:0}; //x
        d[1] = {bottom: 0, top:0}; //y
        d[2] = {bottom: 0, top:0}; //z

        for(var i=0;i<positions.length; i+=3)
        {
            var t1 = {};
            t1.x = positions[i+0][0];
            t1.y = positions[i+0][1];
            t1.z = positions[i+0][2];

            var t2 = {};
            t2.x = positions[i+1][0];
            t2.y = positions[i+1][1];
            t2.z = positions[i+1][2];

            var t3 = {};
            t3.x = positions[i+2][0];
            t3.y = positions[i+2][1];
            t3.z = positions[i+2][2];

            //turn up the volume
            volUnits += signedVolumeOfTriangle(t1,t2,t3);

            //get maximum vertex range to calculate bounding box
            for(var j=0;j<3;j++){
                for(var k=0;k<3;k++) {
                    if (d[j].top < positions[i + k][j]) {
                        d[j].top = positions[i + k][j]
                    }
                    if (d[j].bottom > positions[i + k][j]) {
                        d[j].bottom = positions[i + k][j]
                    }
                }
            }

        }


        //get extra variables from request
        var unitChoice = req.body.unitChoice;
        var materialChoice = req.body.materialChoice;
        var unitCharge = store.get(materialChoice+'.'+unitChoice);
        var currency = store.get("currency");
        var currencySymbol = store.get("currencySymbol");
        var chargeBase = store.get("chargeBase");
        var chargePercent = store.get("chargePercent");

        //cost calculation
        var volCharge = volUnits * unitCharge;

        //add base charges
        volCharge += volCharge*chargePercent; //add percentage of cost charge
        volCharge += chargeBase; //add base charge

        //pretty print
        var volUnitsFull = volUnits + ' '+unitChoice+'<sup>3</sup>';

        //send all data to clientside to show calculation
        res.send(JSON.stringify({
            information: "file processed",
            timeMS: new Date() - timeStart,
            serverFilename: fileObjectServer,
            unitChoice: unitChoice,
            unitCharge: unitCharge,
            chargeBase: chargeBase,
            chargePercent: chargePercent,
            volume: vol,
            triangles: triangles/3,
            volumeUnits: volUnitsFull,
            dimensionsMax: d,
            volCharge: volCharge
        }));

    });


});

module.exports = router;
