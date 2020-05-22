$(document).ready(function () {
    $("#addGame").submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: "/addGame",
            type: "POST",
            data: $("#addGame").serialize(),
            success: function(data, textStatus, results){ 
                alert(results.statusText);
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