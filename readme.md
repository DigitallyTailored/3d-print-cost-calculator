
## Usage workflow

At server startup the upload route process which is used to perform the file calculations is initialised, including grabbing most locally stored variables from ‘variables.json’ in the project route. The values in this file can be modified for testing.

  

The STL file (binary or ASCII) is uploaded in POST data to ‘/uploads’ along with the unit of measurement and material selection.

  

Some basic file validation is done before saving the file to the server (for future quote reference). We then parse the STL file (with more validation) before going through the contained mesh data to calculate the object volume. We also collect the box size of the mesh at this stage for comparison against the printer (only one in the file at the moment).

  

Once this process has completed we can be sure that there will be no issues with the file so we setup any additional variables required for the calculations. This reduces the amount of memory allocation required in case of failed file uploads (speed).

  

The cost is calculated against the locally stored variables and the collected mesh data.

![](https://lh4.googleusercontent.com/_3uhW93KrHIb81GSTy9qufkyKVJbXQt2XK7XcEcrAoS0DgPIIU1PUO6EtQrIwSNrtVsQEPHgD2nu2x-07-SA5CrkDZfsHMqWW67G_zEXfVhInW3rYpbN4yUXkT09O9-K79UGbxA)

  

Immediately after this the calculation and some (debug data for demo purposes) is fed back to the client in the form of a JSON string.

![](https://lh5.googleusercontent.com/k7irRtcms-EFUCXB7jRpjuxB2j3a-goWH8ZIpXgv4FLVB4oSUAkBF-CKaITahv13FguyZWqBRO8FMlDQvGv_MgENNOzFwKkO5FgVDtevbhncAj_8MHjbsrip16HC3Qd-JsV8BuQ)

  

After this the server makes a note of the new fileiteration and saves this data to the local storage. We do this after the data is sent back to speed up server feedback to the client.

## Testing

Project is hosted on GitHub and can be executed by doing the following:

    git clone https://github.com/KohakuDoig/3d-print-cost-calculator.git
    npm install
    npm start

visit [http://localhost:3000/](http://localhost:3000/)

  

Objects used for testing:

-   [https://www.thingiverse.com/thing:34553](https://www.thingiverse.com/thing:34553)
    
-   [https://www.thingiverse.com/thing:33138](https://www.thingiverse.com/thing:33138)
    
-   [https://www.thingiverse.com/thing:2403270](https://www.thingiverse.com/thing:2403270)
    

  
  

# Future development

## Phase 2 key points
    
-   Investigate performance difference between JavaScript and other potential server side languages to see which is able to handle complicated mesh data at speed. I would lean towards Java, Kotlin or C++

-   Frontend cleanup, previewing