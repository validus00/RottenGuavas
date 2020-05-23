function reviewCheck(game_ID, console_ID, game_name, console_name) {
    $.ajax({
        url: "/reviewCheck",
        type: "GET",
        success: function () {
            window.location.replace("/addReview?console_ID=" + console_ID + "&console_name=" + console_name
                + "&game_ID=" + game_ID + "&game_name=" + game_name);
        },
        error: function () {
            alert("login or sign up first");
        }
    })
};