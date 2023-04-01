(function () {
    
    function showCookiePopup(pupup) {
        pupup.style.display = "block";
    }

    function hideCookiePopup(pupup) {
        pupup.style.display = "none";
    }

    function createCookie(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        } else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    }
    
    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    document.addEventListener("DOMContentLoaded", function () {
        const cookieAcceptBtn = document.querySelector("#cookies-ok");
        const cookiesPopup = document.querySelector("#cookiespopup");

        cookieAcceptBtn.onclick = function (event) {
            event.preventDefault();
            createCookie("cookieok", 1, 7);
            hideCookiePopup(cookiesPopup);
        };

        const isCookieSet = readCookie("cookieok");
        if (isCookieSet) {
            hideCookiePopup(cookiesPopup);
        }
    });   
    
})();