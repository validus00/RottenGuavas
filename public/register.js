$(document).ready(function () {
    $("#register").submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: "/register",
            type: "POST",
            data: $("#register").serialize(),
            success: function(){
                $.ajax({
                    url: "/login",
                    type: "POST",
                    data: $("#register").serialize(),
                    success: function (data, textStatus) {
                        alert(textStatus);
                        window.location.replace("/");
                    },
                    error: function (results) {
                        alert(results.statusText);
                    }
                });
            },
            // success: function (data, textStatus) {
            //     alert("user added");
            //     window.location.replace("/");
            // },
            error: function (results) {
                alert(results.statusText);
            }
        });
    });
});