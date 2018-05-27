(function () {

    function init(){
        console.log("button listener set")
        $('#submitButton').click(submitButtonHandler);
    }

    function submitButtonHandler (evt) {
        var testForm = document.getElementById('uploadForm');

        //prevent form submission
        evt.preventDefault();
        evt.stopPropagation();

        $('#post-results-container').fadeOut();
        $('.ajaxLoader').css('display', 'inline-block');


        //make the AJAX call
        $.ajax({
            url: '/form',
            type: 'POST',
            data: {
                fileObject: testForm.fileObject.value
            },
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
        console.log(jsonData)
        //$data.append(jsonData);

        $('#post-results-container').fadeIn();
    };

//init on document ready
    $(document).ready(init);
})();