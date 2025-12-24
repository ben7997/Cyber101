/* ======================================================
   SCORM 1.2 helper
====================================================== */
const SCORM = {
    connected: false,
    passingScore: 60,

    init() {
        try {
            if (window.pipwerks && pipwerks.SCORM) {
                this.connected = pipwerks.SCORM.init();
                console.log("[SCORM] init:", this.connected);

                if (this.connected) {
                    const status = pipwerks.SCORM.get("cmi.core.lesson_status");
                    if (!status || status === "not attempted") {
                        pipwerks.SCORM.set("cmi.core.lesson_status", "incomplete");
                        pipwerks.SCORM.save();
                    }
                }
            }
        } catch (e) {
            console.warn("[SCORM] init error:", e);
            this.connected = false;
        }
    },

    report(scorePercent) {
        const score = Math.max(0, Math.min(100, Math.round(scorePercent)));
        if (!this.connected) {
            localStorage.setItem("lms_user_score_percent", String(score));
            return;
        }
        pipwerks.SCORM.set("cmi.core.score.min", "0");
        pipwerks.SCORM.set("cmi.core.score.max", "100");
        pipwerks.SCORM.set("cmi.core.score.raw", String(score));
        const status = score >= this.passingScore ? "passed" : "failed";
        pipwerks.SCORM.set("cmi.core.lesson_status", status);
        pipwerks.SCORM.save();
    },

    finish() {
        if (!this.connected) return;
        try {
            pipwerks.SCORM.set("cmi.core.exit", "logout");
            pipwerks.SCORM.save();
            pipwerks.SCORM.quit();
        } catch (e) {
            console.warn("[SCORM] finish error:", e);
        }
    }
};

/* ======================================================
   DATA
====================================================== */
const data = {
    generators: [
        { id: 1, title: "Phishing", img: "Phishing.png", content: "ניסיון הונאה שבו תוקפים מתחזים לגורם אמין כדי לגרום למסירת מידע רגיש." },
        { id: 2, title: "Malware", img: "Malware.png", content: "תוכנה זדונית שמטרתה לפגוע במחשב או לגנוב מידע." },
        { id: 3, title: "Ransomware", img: "Ransomware.png", content: "תוכנה זדונית שמצפינה קבצים ודורשת כופר לשחרורם." },
        { id: 4, title: "DDoS Attack", img: "DDoS Attack.png", content: "מתקפה שמציפה שרת בבקשות כדי להשביתו." },
        { id: 5, title: "Social Engineering", img: "Social Engineering.png", content: "ניצול פסיכולוגי של אנשים לצורך חשיפת מידע." },
        { id: 6, title: "Strong Passwords", img: "Strong Passwords.png", content: "שימוש בסיסמאות מורכבות וארוכות להגנה." },
        { id: 7, title: "Data Leakage", img: "Data Leakage.png", content: "חשיפה או גניבה של מידע רגיש ללא הרשאה." }
    ]
};

const quizData = [
    {
        id: "q1",
        question: "איזו מתקפה נועדה להשבית אתר על־ידי הצפת בקשות?",
        answers: [
            { id: "a", text: "DDoS Attack", correct: true },
            { id: "b", text: "Malware", correct: false },
            { id: "c", text: "Phishing", correct: false }
        ]
    },
    {
        id: "q2",
        question: "מה מאפיין מתקפת Ransomware?",
        answers: [
            { id: "a", text: "גניבת סיסמאות", correct: false },
            { id: "b", text: "הצפנת קבצים ודרישת כופר", correct: true },
            { id: "c", text: "פרסומות לא רצויות", correct: false }
        ]
    },
    {
        id: "q3",
        question: "מהי סיסמה חזקה?",
        answers: [
            { id: "a", text: "12345678", correct: false },
            { id: "b", text: "G7!pA9#rL2", correct: true },
            { id: "c", text: "password", correct: false }
        ]
    }
];

/* ======================================================
   FUNCTIONS
====================================================== */

function wireMobileMenu() {
    const menuBtn = document.getElementById("navToggle");
    const menuLinks = document.getElementById("navLinks");

    if (menuBtn && menuLinks) {
        menuBtn.onclick = (e) => {
            e.stopPropagation();
            menuLinks.classList.toggle("open");
            const isExpanded = menuLinks.classList.contains("open");
            menuBtn.setAttribute("aria-expanded", isExpanded);
        };

        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                menuLinks.classList.remove("open");
                menuBtn.setAttribute("aria-expanded", "false");
            });
        });

        document.addEventListener("click", (e) => {
            if (!menuLinks.contains(e.target) && !menuBtn.contains(e.target)) {
                menuLinks.classList.remove("open");
            }
        });
    }
}

function renderCards() {
    const row = document.getElementById("cardsRow");
    if(!row) return;
    row.innerHTML = "";
    data.generators.forEach(g => {
        const col = document.createElement("div");
        col.className = "col-6 col-md-4 col-lg-3";
        const card = document.createElement("button");
        card.type = "button";
        card.className = "tool-card w-100";
        card.onclick = () => openDetails(g);
        card.innerHTML = `
            <div class="tool-card-inner">
                <img class="tool-img" src="img/${g.img}" alt="${g.title}">
                <div class="tool-title">${g.title}</div>
            </div>
        `;
        col.appendChild(card);
        row.appendChild(col);
    });
}

function openDetails(g) {
    document.getElementById("detailsImg").src = `img/${g.img}`;
    document.getElementById("detailsTitle").textContent = g.title;
    document.getElementById("detailsContent").textContent = g.content;
    document.getElementById("detailsBox").classList.remove("d-none");
}

function wireDetailsClose() {
    const closeBtn = document.getElementById("closeDetails");
    if(closeBtn) {
        closeBtn.onclick = () => document.getElementById("detailsBox").classList.add("d-none");
    }
}

function renderQuiz() {
    const container = document.getElementById("quizContainer");
    if(!container) return;
    container.innerHTML = "";
    quizData.forEach((q, i) => {
        const card = document.createElement("div");
        card.className = "quiz-question mb-3";
        card.innerHTML = `
            <div class="quiz-q-title">${i + 1}. ${q.question}</div>
            <div class="quiz-answers">
                ${q.answers.map(a => `
                    <label class="quiz-answer">
                        <input type="radio" name="${q.id}" value="${a.id}">
                        <span>${a.text}</span>
                    </label>
                `).join("")}
            </div>
        `;
        container.appendChild(card);
    });

    const form = document.getElementById("quizForm");
    if(form) {
        form.onsubmit = e => {
            e.preventDefault();
            gradeQuiz();
        };
    }
}

function gradeQuiz() {
    let correct = 0;
    let answered = 0;
    quizData.forEach(q => {
        const chosen = document.querySelector(`input[name="${q.id}"]:checked`);
        if (!chosen) return;
        answered++;
        if (q.answers.find(a => a.correct)?.id === chosen.value) correct++;
    });
    document.getElementById("quizResult").textContent = `ענית על ${answered}/${quizData.length}. נכונות: ${correct}.`;
    const scorePercent = (correct / quizData.length) * 100;
    SCORM.report(scorePercent);
    if (answered === quizData.length) { SCORM.finish(); }
}

function wireHeaderNav() {
    document.querySelectorAll("[data-section]").forEach(btn => {
        btn.onclick = () => {
            const target = document.getElementById(btn.dataset.section);
            if(target) target.scrollIntoView({ behavior: "smooth" });
        };
    });
}

function wireSearch() {
    const form = document.getElementById("searchForm");
    const input = document.getElementById("searchInput");
    if (!form || !input) return;
    form.onsubmit = e => {
        e.preventDefault();
        const q = input.value.toLowerCase();
        document.querySelectorAll(".tool-card").forEach(c =>
            c.classList.toggle("card-hit", c.innerText.toLowerCase().includes(q))
        );
        input.blur();
    };
}

/* ======================================================
   INIT (הפעלה)
====================================================== */
document.addEventListener("DOMContentLoaded", () => {
    SCORM.init();
    wireMobileMenu();
    renderCards();
    renderQuiz();
    wireHeaderNav();
    wireDetailsClose();
    wireSearch();
});