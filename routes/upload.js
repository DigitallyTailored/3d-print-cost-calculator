var express = require('express');
var router = express.Router();
var fileUpload = require('express-fileupload');
var parseSTL = require('parse-stl');
var FS = require('fs');

router.use(fileUpload());

var fileUploadIteration = 0;
var timeStart = 0;

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
    timeStart = +new Date();

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

        var vol = 0;
        var d = [];
        d[0] = {low: 0, high:0};
        d[1] = {low: 0, high:0};
        d[2] = {low: 0, high:0};

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

            vol += signedVolumeOfTriangle(t1,t2,t3);

            //get maximum vertex range to calculate bounding box
            for(var j=0;j<3;j++){
                //this is assuming that each corner is at some point a 'leading' one..
                //todo read up on whether each corner has it's own STL loop
                if (d[j].high < positions[i+0][j]){
                    d[j].high = positions[i+0][j]
                }
                if (d[j].low > positions[i+0][j]){
                    d[j].low = positions[i+0][j]
                }
            }

        }

        res.send(JSON.stringify({
            information: "file uploaded",
            timeMS: new Date() - timeStart,
            filename: fileObjectServer,
            volume: vol,
            dimensionsMax: d
        }));

    });


});

module.exports = router;
