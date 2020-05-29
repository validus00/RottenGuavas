$(document).ready(function () {
    $("#profile").submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: "/profile",
            type: "POST",
            data: $("#profile").serialize(),
            success: function () {
                alert("profile updated");
                window.location.reload(true);
            },
            error: function (results) {
                alert(results.statusText);
            }
        });
    });
});

function deleteReview(review_ID) {
    var confirmation = confirm("delete review?");
    if (confirmation) {
        $.ajax({
            url: "/profile/deleteReview?review_ID=" + review_ID,
            type: "DELETE",
            success: function () {
                alert("review deleted");
                window.location.reload(true);
            },
            error: function (results) {
                alert(results.statusText);
            }
        })
    }
}