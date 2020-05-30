$(document).ready(function () {
    $("#login").submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: "/login",
            type: "POST",
            data: $("#login").serialize(),
            success: function (data, textStatus) {
                alert(textStatus);
                window.location.replace("/?showAll=True");
            },
            error: function (results) {
                alert(results.statusText);
            }
        });
    });
});