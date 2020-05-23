$(document).ready(function () {
    $("#profile").submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: "/profile",
            type: "POST",
            data: $("#profile").serialize(),
            success: function () {
                alert("profile updated");
                window.location.replace("/profile");
            },
            error: function (results) {
                alert(results.statusText);
            }
        });
        return;
    });
});