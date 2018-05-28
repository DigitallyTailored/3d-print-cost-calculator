(function () {

    function init(){
        console.log("button listener set")
        //$('#submitButton').click(submitButtonHandler);
        $('#uploadForm').on('change','#fileObject' , function(){ submitButtonHandler(); });


    }

    function submitButtonHandler (evt) {
/*
        //prevent form submission
        evt.preventDefault();
        evt.stopPropagation();
*/
        $('#post-results-container').hide();
        $('.ajaxLoader').css('display', 'inline-block');

        var formData = new FormData();
        formData.append('fileObject', $('input[type=file]')[0].files[0]);


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

        /*
        $('.ajaxLoader').hide();

        //update the UI with the data returned from the AJAX call
        $.each(jsonData, function (key, val) {
            $data.append('<li><b>' +  key + '</b>'   + val + '</li>');
        });
        */
        console.log()
        var jsonObj = JSON.parse(jsonData);
        $data.append('<h3>Raw data:</h3><pre>'+JSON.stringify(jsonObj, undefined, 2)+'</pre>');

        $('#post-results-container').fadeIn();
    };

//init on document ready
    $(document).ready(init);
})();