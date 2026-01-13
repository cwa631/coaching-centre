/***********************
 * HEADER MENU
 ***********************/
const menu = document.getElementById("menu");
const menuBtn = document.getElementById("menuBtn");
const header = document.querySelector("header");

function toggleMenu() {
    menu.classList.toggle("active");
    menuBtn.innerHTML = menu.classList.contains("active") ? "✖" : "☰";
}


/***********************
 * HELP DESK (MOBILE TOGGLE)
 ***********************/
(function () {
    const btn = document.getElementById("helpdeskBtn");
    const dd = document.getElementById("helpdeskDropdown");
    if (!btn || !dd) return;

    const isMobile = () => window.innerWidth <= 900;

    btn.addEventListener("click", function (e) {
        if (!isMobile()) return;
        e.preventDefault();
        e.stopPropagation();
        dd.classList.toggle("open");
    });

    // outside tap => close submenu (menu open rahega)
    document.addEventListener("click", function (e) {
        if (!isMobile()) return;
        if (!dd.contains(e.target)) dd.classList.remove("open");
    });

    // resize reset
    window.addEventListener("resize", function () {
        if (!isMobile()) dd.classList.remove("open");
    });
})();


/* ✅ HEADER LINKS: click -> smooth scroll + header offset + menu close */
document.querySelectorAll('#menu a[href^="#"]').forEach(link => {
    link.addEventListener("click", (e) => {

        // ✅ Help Desk button pe menu close nahi hoga (mobile)
        if (link.id === "helpdeskBtn" && window.innerWidth <= 900) return;

        const targetId = link.getAttribute("href");
        const targetEl = document.querySelector(targetId);

        // mobile menu close
        menu.classList.remove("active");
        menuBtn.innerHTML = "☰";

        if (targetEl) {
            e.preventDefault();
            const headerH = header.offsetHeight;
            const top = targetEl.getBoundingClientRect().top + window.pageYOffset - headerH - 10;
            window.scrollTo({ top, behavior: "smooth" });
        }
    });
});

window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
});


/***********************
 * SLIDER (smooth slide + auto + hover pause)
 ***********************/
const sliderBox = document.getElementById("sliderBox");
const slidesEl = document.getElementById("slides");
const slideItems = Array.from(slidesEl.querySelectorAll(".slide"));
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dotsWrap = document.getElementById("dots");

let current = 0;
let sliderTimer = null;
const SLIDE_DELAY = 4500;

function renderDots() {
    dotsWrap.innerHTML = "";
    slideItems.forEach((_, i) => {
        const d = document.createElement("div");
        d.className = "dot" + (i === current ? " active" : "");
        d.addEventListener("click", () => goTo(i, true));
        dotsWrap.appendChild(d);
    });
}

function goTo(index, userAction = false) {
    current = (index + slideItems.length) % slideItems.length;
    slidesEl.style.transform = `translateX(-${current * 100}%)`;
    renderDots();
    if (userAction) restartAuto();
}

function next() { goTo(current + 1, true); }
function prev() { goTo(current - 1, true); }

function startAuto() {
    if (sliderTimer) return;
    sliderTimer = setInterval(() => goTo(current + 1, false), SLIDE_DELAY);
}

function stopAuto() {
    clearInterval(sliderTimer);
    sliderTimer = null;
}

function restartAuto() {
    stopAuto();
    startAuto();
}

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);

sliderBox.addEventListener("mouseenter", stopAuto);
sliderBox.addEventListener("mouseleave", startAuto);

goTo(0);
startAuto();


/***********************
 * NOTICE BOARD (Smooth like DAV + Hover pause)
 ***********************/
const noticeBody = document.getElementById("noticeBody");
const track = document.getElementById("noticeTrack");

let paused = false;
let y = 0;
let speed = 0.45;

function setupMarquee() {
    y = 0;
    track.style.transform = "translateY(0)";
    track.querySelectorAll(".__clone").forEach(n => n.remove());

    const children = Array.from(track.children);
    children.forEach(node => {
        const clone = node.cloneNode(true);
        clone.classList.add("__clone");
        track.appendChild(clone);
    });
}

function loop() {
    if (!paused) {
        y += speed;
        const half = track.scrollHeight / 2;
        if (y >= half) y = 0;
        track.style.transform = `translateY(-${y}px)`;
    }
    requestAnimationFrame(loop);
}

noticeBody.addEventListener("mouseenter", () => paused = true);
noticeBody.addEventListener("mouseleave", () => paused = false);

window.addEventListener("load", () => {
    setupMarquee();
    loop();
});

window.addEventListener("resize", setupMarquee);


/***********************
 * FOOTER SECTION
 ***********************/
document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("toTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

const accSections = document.querySelectorAll(".acc");

function setAccordionDefault() {
    if (window.innerWidth <= 740) {
        accSections.forEach((sec, i) => {
            if (i === 0) sec.classList.remove("collapsed");
            else sec.classList.add("collapsed");
            const btn = sec.querySelector(".acc-btn");
            btn.setAttribute("aria-expanded", i === 0 ? "true" : "false");
        });
    } else {
        accSections.forEach(sec => {
            sec.classList.remove("collapsed");
            const btn = sec.querySelector(".acc-btn");
            btn.setAttribute("aria-expanded", "true");
        });
    }
}

setAccordionDefault();
window.addEventListener("resize", setAccordionDefault);

accSections.forEach(sec => {
    const btn = sec.querySelector(".acc-btn");
    btn.addEventListener("click", () => {
        if (window.innerWidth > 740) return;
        const isCollapsed = sec.classList.toggle("collapsed");
        btn.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
    });
});


/***********************
 * VISITOR COUNT (frontend)
 ***********************/
async function loadVisitorCount() {
    try {
        const res = await fetch("/api/visitor", { cache: "no-store" });
        if (!res.ok) throw new Error("no api");
        const data = await res.json();
        document.getElementById("visitorCount").textContent = data.count;
    } catch (e) {
        document.getElementById("visitorCount").textContent = "846953";
    }
}
loadVisitorCount();







/* =========================
   PHOTO GALLERY CAROUSEL JS
========================= */
(function () {
    const root = document.getElementById("galleryCarousel");
    if (!root) return;

    const track = root.querySelector(".g-track");
    const slides = Array.from(root.querySelectorAll(".g-slide"));
    const prevBtn = root.querySelector(".g-prev");
    const nextBtn = root.querySelector(".g-next");
    const dotsWrap = root.querySelector(".g-dots");

    let pageIndex = 0;
    let timer = null;

    // ✅ Auto: right till end then reverse left
    let direction = 1;
    const AUTOPLAY_MS = 2400;

    function perView() {
        const w = window.innerWidth;
        if (w <= 600) return 1;
        if (w <= 980) return 2;
        return 3;
    }

    function pagesCount() {
        return Math.max(1, Math.ceil(slides.length / perView()));
    }

    function buildDots() {
        dotsWrap.innerHTML = "";
        const p = pagesCount();
        for (let i = 0; i < p; i++) {
            const b = document.createElement("button");
            b.className = "g-dot" + (i === 0 ? " g-active" : "");
            b.type = "button";
            b.setAttribute("aria-label", `Go to page ${i + 1}`);
            b.addEventListener("click", () => {
                pageIndex = i;
                update(true);
            });
            dotsWrap.appendChild(b);
        }
    }

    function setActiveDot() {
        const dots = Array.from(dotsWrap.querySelectorAll(".g-dot"));
        dots.forEach((d, i) => d.classList.toggle("g-active", i === pageIndex));
    }

    // ✅ Start => left hide, End => right hide
    function updateArrows() {
        const last = pagesCount() - 1;
        prevBtn.classList.toggle("g-hidden", pageIndex === 0);
        nextBtn.classList.toggle("g-hidden", pageIndex === last);
    }

    function update(animate) {
        track.style.transition = animate ? "transform 650ms ease" : "none";

        const pv = perView();
        const slideW = slides[0].getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;

        // move by one page (pv slides)
        const moveX = pageIndex * (pv * (slideW + gap));
        track.style.transform = `translateX(${-moveX}px)`;

        setActiveDot();
        updateArrows();
    }

    function go(dir) {
        const last = pagesCount() - 1;
        const next = pageIndex + dir;
        if (next < 0 || next > last) return;
        pageIndex = next;
        update(true);
    }

    function autoplayTick() {
        const last = pagesCount() - 1;

        if (pageIndex >= last) direction = -1;
        if (pageIndex <= 0) direction = 1;

        const candidate = pageIndex + direction;
        if (candidate >= 0 && candidate <= last) {
            pageIndex = candidate;
            update(true);
        }
    }

    function start() {
        stop();
        timer = setInterval(autoplayTick, AUTOPLAY_MS);
    }

    function stop() {
        if (timer) clearInterval(timer);
        timer = null;
    }

    // Buttons
    prevBtn.addEventListener("click", () => { direction = -1; go(-1); });
    nextBtn.addEventListener("click", () => { direction = 1; go(1); });

    // Pause on hover
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);

    // Resize recalculation
    window.addEventListener("resize", () => {
        buildDots();
        const last = pagesCount() - 1;
        if (pageIndex > last) pageIndex = last;
        update(false);
    });

    // Init
    buildDots();
    update(false);
    start();
})();
