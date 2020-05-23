$(document).ready(function () {
    $("#addGame").submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: "/addGame",
            type: "POST",
            data: $("#addGame").serialize(),
            success: function(data, textStatus, results){ 
                alert(results.statusText.replace(/\\n/g,"\n"));
                // alert(textStatus);
                window.location.replace("/");
            },
            error: function (results) {
                alert(results.statusText);
            }
        });
        return;
    });
});