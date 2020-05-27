$(document).ready(function () {
    $("#addReview").submit(function (e) {
        e.preventDefault();
        var formData = {
            "console_ID": $("input[name=console_ID]").val(),
            "game_ID": $("input[name=game_ID]").val()
        };
        $.ajax({
            url: "/addReview",
            type: "POST",
            data: $("#addReview").serialize(),
            success: function () {
                alert("review added");
                window.location.replace("/games?console_ID=" + formData.console_ID + "&game_ID=" + formData.game_ID);
            },
            error: function (results) {
                alert(results.statusText)
            }
        });
    });
});