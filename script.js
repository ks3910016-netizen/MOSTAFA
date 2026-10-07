/* =========================================================
   منصتك التعليمية - JavaScript الرئيسي (Supabase)
========================================================= */


/* انتظر تحميل Supabase */

window.addEventListener("supabaseReady", function () {
    initApp();
});


function initApp() {

    const supabase = window.supabaseClient;

    /* =========================================================
       1) صفحة تسجيل الدخول
    ========================================================= */

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const submitBtn = loginForm.querySelector("button[type=submit]");

            hideError();

            if (!email || !password) {
                showError("من فضلك اكمل كل الحقول");
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "جاري الدخول...";
            }


            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });


            if (error) {
                showError("البريد الإلكتروني أو كلمة السر غير صحيحة");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "دخول إلى المنصة";
                }
                return;
            }


            /* سجّل إنه دخل مرة تانية */

            if (data && data.user) {

                const visited = localStorage.getItem("visited_before_" + data.user.id);

                if (visited === "true") {
                    sessionStorage.setItem("welcome_back", "true");
                }

            }

            window.location.href = "choose.html";

        });

    }



    /* =========================================================
       2) صفحة التسجيل
    ========================================================= */

    const signupForm = document.getElementById("signupForm");

    if (signupForm) {

        signupForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const username = document.getElementById("username").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const parentPhone = document.getElementById("parentPhone").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const submitBtn = signupForm.querySelector("button[type=submit]");

            hideError();

            if (!username || !phone || !parentPhone || !email || !password) {
                showError("من فضلك اكمل كل الحقول");
                return;
            }

            if (password.length < 6) {
                showError("كلمة السر لازم تكون 6 حروف على الأقل");
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "جاري التسجيل...";
            }


            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username,
                        phone: phone,
                        parent_phone: parentPhone
                    }
                }
            });


            if (error) {
                showError(error.message);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "إنشاء الحساب";
                }
                return;
            }


            /* حفظ الاسم والتليفون يدوياً في profiles */

            if (data && data.user) {

                await supabase
                    .from("profiles")
                    .update({
                        username: username,
                        phone: phone,
                        parent_phone: parentPhone
                    })
                    .eq("id", data.user.id);

            }


            alert("تم إنشاء الحساب بنجاح!");
            window.location.href = "choose.html";

        });

    }



    /* =========================================================
       3) اختيار النظام التعليمي
    ========================================================= */

    const generalSecondaryBtn = document.getElementById("generalSecondary");
    const baccalaureateBtn = document.getElementById("baccalaureate");


    if (generalSecondaryBtn) {

        generalSecondaryBtn.addEventListener("click", async function () {

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                window.location.href = "login.html";
                return;
            }

            await supabase
                .from("profiles")
                .update({ education_system: "الثانوية العامة" })
                .eq("id", user.id);

            window.location.href = "index.html";

        });

    }


    if (baccalaureateBtn) {

        baccalaureateBtn.addEventListener("click", async function () {

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                window.location.href = "login.html";
                return;
            }

            await supabase
                .from("profiles")
                .update({ education_system: "البكالوريا" })
                .eq("id", user.id);

            window.location.href = "baccalaureate.html";

        });

    }



    /* =========================================================
       4) عرض اسم الطالب في الرئيسية
    ========================================================= */

    const homeUsername = document.getElementById("homeUsername");

    if (homeUsername) {
        loadUserProfile();
    }


    async function loadUserProfile() {

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();


        /* عرض الاسم */

        if (data && data.username) {
            homeUsername.textContent = data.username;
        } else {
            homeUsername.textContent = "الطالب";
        }


        /* تحية العودة */

        const welcomeText = document.getElementById("welcomeText");

        if (welcomeText) {

            /* لو دخل من login حديثاً */

            if (sessionStorage.getItem("welcome_back") === "true") {
                welcomeText.textContent = "أهلاً بعودتك يا";
                sessionStorage.removeItem("welcome_back");
                return;
            }


            /* لو زار الموقع قبل كده */

            const visited = localStorage.getItem("visited_before_" + user.id);

            if (visited === "true") {
                welcomeText.textContent = "أهلاً بعودتك يا";
            } else {
                welcomeText.textContent = "أهلاً يا";
                localStorage.setItem("visited_before_" + user.id, "true");
            }

        }

    }



    /* =========================================================
       5) زرار التواصل الاجتماعي
    ========================================================= */

    const socialWrapper = document.getElementById("socialWrapper");
    const socialToggle = document.getElementById("socialToggle");

    if (socialWrapper && socialToggle) {

        socialToggle.addEventListener("click", function (event) {
            event.stopPropagation();
            socialWrapper.classList.toggle("open");
        });

        document.addEventListener("click", function (event) {
            if (!socialWrapper.contains(event.target)) {
                socialWrapper.classList.remove("open");
            }
        });

        const socialItems = socialWrapper.querySelectorAll(".social-item");

        socialItems.forEach(function (item) {
            item.addEventListener("click", function () {
                socialWrapper.classList.remove("open");
            });
        });

    }



    /* =========================================================
       6) بطاقات الصفوف في البكالوريا
    ========================================================= */

    const gradeCards = document.querySelectorAll(".grade-card");

    if (gradeCards.length > 0) {

        gradeCards.forEach(function (card) {

            card.addEventListener("click", function () {

                const grade = card.dataset.grade;
                sessionStorage.setItem("bacGrade", grade);
                alert("تم اختيار الصف رقم " + grade);

            });

        });

    }



    /* =========================================================
       7) تكبير اللوجو في صفحة الدخول
    ========================================================= */

    const logoCircle = document.getElementById("logoCircle");
    const logoPopup = document.getElementById("logoPopup");
    const closeLogo = document.getElementById("closeLogo");

    if (logoCircle && logoPopup && closeLogo) {

        logoCircle.addEventListener("click", function () {
            logoPopup.classList.add("show");
        });

        closeLogo.addEventListener("click", function () {
            logoPopup.classList.remove("show");
        });

        logoPopup.addEventListener("click", function (event) {
            if (event.target === logoPopup) {
                logoPopup.classList.remove("show");
            }
        });

    }



    /* =========================================================
       8) حماية الصفحات
    ========================================================= */

    protectPages();

    async function protectPages() {

        const currentPage = window.location.pathname.split("/").pop();

        const publicPages = ["login.html", "signup.html", "choose.html", ""];

        if (publicPages.includes(currentPage)) return;

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            window.location.href = "login.html";
        }

    }



    /* =========================================================
       Helper: رسائل الأخطاء
    ========================================================= */

    function showError(message) {

        const errorBox = document.getElementById("errorBox");

        if (errorBox) {
            errorBox.textContent = message;
            errorBox.style.display = "block";
        } else {
            alert(message);
        }

    }

    function hideError() {

        const errorBox = document.getElementById("errorBox");

        if (errorBox) {
            errorBox.textContent = "";
            errorBox.style.display = "none";
        }

    }

        /* =========================================================
       9) زرار تسجيل الخروج
    ========================================================= */

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", async function () {

            await supabase.auth.signOut();
            window.location.href = "login.html";

        });

            /* =========================================================
       10) فتح/غلق فيديو الدرس
    ========================================================= */

    const lessonToggles = document.querySelectorAll(".lesson-toggle");

    if (lessonToggles.length > 0) {

        lessonToggles.forEach(function (btn) {

            btn.addEventListener("click", function () {

                const targetId = btn.dataset.target;
                const videoBox = document.getElementById(targetId);

                if (!videoBox) return;


                /* لو الفيديو مفتوح → اقفله */

                if (videoBox.style.display === "block") {

                    videoBox.style.display = "none";
                    btn.querySelector("span").textContent = "متابعة";
                    btn.querySelector("i").className = "fa-solid fa-play";

                }
                /* لو مقفول → افتحه */

                else {

                    videoBox.style.display = "block";
                    btn.querySelector("span").textContent = "إغلاق";
                    btn.querySelector("i").className = "fa-solid fa-xmark";

                    /* سكرول للفيديو */

                    setTimeout(function () {
                        videoBox.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 100);

                }

            });

        });

    }

    /* =========================
   زر بدء الرحلة
========================= */

const startButton =
    document.getElementById("startButton");


startButton.addEventListener("click", function () {

    /*
        عند الضغط على الزر
        ننتقل إلى تسجيل الدخول
    */

    window.location.href = "login.html";

});

    }
}