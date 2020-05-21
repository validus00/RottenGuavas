$(document).ready(function () {
    $("#updateProfile").submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: "/profile",
            type: "POST",
            data: $("#updateProfile").serialize(),
            success: function (data, textStatus) {
                alert("profile updated");
                window.location.replace("/profile");
            },
            error: function (results) {
                alert("username already in use");
            }
        });
        return;
    });
});