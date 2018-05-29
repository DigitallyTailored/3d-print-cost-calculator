(function () {

    function init(){
        console.log("button listener set");
        $('#uploadForm').on('change','#fileObject' , function(){ submitButtonHandler(); });
        $('#post-results-container').hide();
    }

    function submitButtonHandler (evt) {

        $('#post-results-container').hide();

        //collect input data
        var formData = new FormData();
        formData.append('fileObject', $('input[type=file]')[0].files[0]);
        formData.append('unitChoice', $('input:radio[name="units"]:checked').val());
        formData.append('materialChoice', $('input:radio[name="material"]:checked').val());

        //make the AJAX call
        $.ajax({
            url: '/upload',
            type: 'POST',
            method: 'post',
            data: formData,
            contentType: false,
            processData: false,
            success: postSuccessHandler
        });
    }

    function postSuccessHandler (jsonData) {
        var $data = $('#post-results-container .data');


        //reset the UI
        $data.html('');
        $('#jobCost').html('');

        var jsonObj = JSON.parse(jsonData);

        //update display with data
        $data.append('<h3>Raw data:</h3><pre>'+JSON.stringify(jsonObj, undefined, 2)+'</pre>');
        if(jsonObj.success){
            $('#jobCost').html(jsonObj.chargeTotal);
        }

        //show the display
        $('#post-results-container').fadeIn();
    };

//init on document ready
    $(document).ready(init);
})();