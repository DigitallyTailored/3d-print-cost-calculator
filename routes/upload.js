const express = require('express');
const router = express.Router();

//uploaded file handling
const fileUpload = require('express-fileupload');

//STL file parsing
const parseSTL = require('parse-stl');
const FS = require('fs');

//server variable storage setup
const Store = require('data-store');
var store = new Store('variables', { base: '.'});

//grab server variables at startup to save memory allocation time
const printer = store.get('printer');
const currency = store.get("currency");
const currencySymbol = store.get("currencySymbol");
const chargeAddBase = store.get("chargeBase");
const chargeAddPercent = store.get("chargePercent");
var fileUploadIteration;
if(store.get('fileUploadIteration')) {
    fileUploadIteration = store.get('fileUploadIteration');
} else {
    fileUploadIteration = 0;
}

//used for quickly converting upload model measurement to mm, comparing against print bed size
const convert = {
    "mm": {
        "mm": 1,
        "cm": 0.1,
        "inch": 0.03937
    },
    "cm": {
        "mm": 10,
        "cm": 1,
        "inch": 0.3937
    },
    "inch": {
        "mm": 25.4,
        "cm": 2.54,
        "inch": 1
    }
};

router.use(fileUpload());

//function used for calculating volume
function signedVolumeOfTriangle(p1,p2,p3){
    var v321 = p3.x*p2.y*p1.z;
    var v231 = p2.x*p3.y*p1.z;
    var v312 = p3.x*p1.y*p2.z;
    var v132 = p1.x*p3.y*p2.z;
    var v213 = p2.x*p1.y*p3.z;
    var v123 = p1.x*p2.y*p3.z;
    return (-v321 + v231 + v312 - v132 - v213 + v123)/6;
}


/* POST upload page. */
router.post('/upload', function(req, res, next) {

    var timeStart = +new Date();
    var clientFeedback='';

    //file uploaded alright?
    if (!req.files){
        res.send(JSON.stringify({
            information: "file upload failed."
        }));
        return;
    }

    var fileObject = req.files.fileObject;

    //todo move this to after file processing if possible to speedup valuation time
    //store copy of file on server for quote reference
    var filenameServer = 'uploads\\file-'+fileUploadIteration+'.stl';
    fileObject.mv(filenameServer, function(err) {
        if (err){
            res.send(JSON.stringify({
                information: "file move on server failed: "+ err,
            }));

            return;
        }

        fileUploadIteration++;

        //parse the stl file
        var buf = FS.readFileSync(filenameServer);

        var mesh = parseSTL(buf);
        var positions = mesh.positions;
        var objectPolygons = positions.length;
        if (!objectPolygons > 0){
            res.send(JSON.stringify({
                information: "file appears to be empty",
            }));

            return;
        }

        //calculations against newly parsed mesh data
        var objectVolume = 0;
        var dimensionSet = {bottom: 0, top:0, diff: 0};
        var dimensions = [];
        dimensions[0] = dimensionSet; //x
        dimensions[1] = dimensionSet; //y
        dimensions[2] = dimensionSet; //z

        for(var i=0;i<objectPolygons; i+=3)
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
            objectVolume += signedVolumeOfTriangle(t1,t2,t3);

            //get maximum vertex range to calculate bounding box
            for(var j=0;j<3;j++){
                for(var k=0;k<3;k++) {
                    if (dimensions[j].top < positions[i + k][j]) {
                        dimensions[j].top = positions[i + k][j]
                    }
                    if (dimensions[j].bottom > positions[i + k][j]) {
                        dimensions[j].bottom = positions[i + k][j]
                    }
                }
            }

        }

        objectVolume =objectVolume*0.001;

		
        //file passed all validation and was read, so now setting/getting runtime vars (if we'd fail the above then no need to do the below)
        //collect additional passed/set vars
        var unitChoice = req.body.unitChoice;
        var materialChoice = req.body.materialChoice;
        //get cost calculation variables from request and storage
        var unitCharge = store.get('currencySymbol');
        var unitCharge = store.get(materialChoice+'.'+unitChoice);

		//calculate object box against printbed
        for(var i=0;i<3;i++){
            dimensions[i].diff = dimensions[i].top-(dimensions[i].bottom);
        }
        for(var i=0;i<3;i++){
            // var d[i].top-(d[i].bottom)
            if( convert[unitChoice]['mm'] * dimensions[i].diff > printer[i]){
                clientFeedback += "<br>Object larger than print bed on dimension "+ i+" ("+(convert[unitChoice]['mm'] * dimensions[i].diff)+"mm > "+printer[i]+"mm)";
            }
        }

        //cost calculation based on object
        var chargeTotal = objectVolume * unitCharge;

        //add base charges
        chargeTotal += chargeTotal*chargeAddPercent; //add percentage of cost charge
        chargeTotal += chargeAddBase; //add base charge
        chargeTotal = chargeTotal.toFixed(2);

        //send all data to clientside to show calculation
        res.send(JSON.stringify({
            success: true,
            processInformation: "file processed" + clientFeedback,
            processTimeMS: new Date() - timeStart,
            processServerFilename: filenameServer,
            objectVolume: objectVolume,
            objectPolygons: objectPolygons/3,
            objectVolumeUnits: objectVolume + ' '+unitChoice+'<sup>3</sup>',
            objectDimensionsMM: dimensions,
            unitChoice: unitChoice,
            unitChoiceCost: currencySymbol+unitCharge,
            chargeAddBase: currencySymbol+chargeAddBase,
            chargeAddPercent: chargeAddPercent+"%",
            chargeTotal: currencySymbol+chargeTotal
        }));

        store.set('fileUploadIteration', fileUploadIteration);
		
    });


});

module.exports = router;
