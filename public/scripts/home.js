$(document).ready(function () {
    $("#consoles").submit(function (e) {
        var formData = {
            "new_console": $("input[name=new_console]").val()
        };
        if (formData.new_console) {
            e.preventDefault();
            $.ajax({
                url: "/",
                type: "POST",
                data: $("#consoles").serialize(),
                success: function (data, textStatus, results) {
                    alert(results.statusText);
                    window.location.reload(true);
                },
                error: function (results) {
                    alert(results.statusText);
                }
            });
        }
    });
});

$(document).ready(function () {
    $("#genres").submit(function (e) {
        var formData = {
            "new_genre": $("input[name=new_genre]").val()
        };
        if (formData.new_genre) {
            e.preventDefault();
            $.ajax({
                url: "/",
                type: "POST",
                data: $("#genres").serialize(),
                success: function (data, textStatus, results) {
                    alert(results.statusText);
                    window.location.reload(true);
                },
                error: function (results) {
                    alert(results.statusText);
                }
            });
        }
    });
});

function clearForm(form) {
    $(form).find("input[type=checkbox]").prop("checked", false);
    $(form).find("input[type=text]").val("");
}