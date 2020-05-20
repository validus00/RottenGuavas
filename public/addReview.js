function addReview(game_ID, console_ID, game_name, console_name) {
    $.ajax({
        url: "/reviewCheck",
        type: "GET",
        success: function (data, textStatus) {
            window.location.replace("/addReview?game_ID=" + game_ID + "&console_ID=" + console_ID
            + "&game_name=" + game_name + "&console_name=" + console_name);
        },
        error: function (results) {
            alert("login first or sign up");
        }
    })
};