function addReview(game_ID, console_ID, game_name, console_name) {
    $.ajax({
        url: "/reviewCheck",
        type: "GET",
        success: function (data, textStatus) {
            window.location.replace("/addReview?console_ID=" + console_ID + "&console_name=" + console_name
                + "&game_ID=" + game_ID + "&game_name=" + game_name);
        },
        error: function (results) {
            alert("login or sign up first");
        }
    })
};