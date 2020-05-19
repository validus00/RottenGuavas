function login() {
    $.ajax({
        url: "/loginProcess",
        type: "PUT",
        data: $("#login").serialize(),
        success: function (data, textStatus) {
            alert(textStatus);
            window.location.replace("./");
        },
        error: function (results) {
            alert(results.statusText);
            window.location.replace("/login");
        }
    })
};