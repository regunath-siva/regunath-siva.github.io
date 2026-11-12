(function () {
    const root = document.documentElement;
    const nav = document.getElementById("nav");
    const menu = document.getElementById("nav-menu");
    const toggle = document.querySelector(".nav-toggle");
    const themeButton = document.querySelector(".theme-toggle");
    const progress = document.getElementById("progress");
    const year = document.getElementById("year");

    if (year) year.textContent = String(new Date().getFullYear());

    function setTheme(theme) {
        root.setAttribute("data-theme", theme);
        const light = theme === "light";
        if (themeButton) {
            themeButton.setAttribute("aria-pressed", light ? "true" : "false");
            themeButton.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
        }
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", light ? "#f3efe6" : "#090b10");
        try {
            localStorage.setItem("sr-theme", theme);
        } catch (e) {}
    }

    setTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");

    themeButton?.addEventListener("click", function () {
        setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
    });

    function setMenu(open) {
        if (!menu || !toggle) return;
        menu.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
        document.body.style.overflow = open ? "hidden" : "";
        if (open) {
            const first = menu.querySelector("a");
            first?.focus();
        }
    }

    toggle?.addEventListener("click", function () {
        setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    menu?.addEventListener("click", function (event) {
        if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
        if (!menu?.classList.contains("is-open")) return;
        if (event.key === "Escape") {
            setMenu(false);
            toggle?.focus();
            return;
        }
        if (event.key !== "Tab") return;
        const focusable = [...menu.querySelectorAll("a, button")];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    const links = [...document.querySelectorAll(".nav-menu a[href^='#']")];
    const sections = links
        .map(function (link) {
            return document.querySelector(link.getAttribute("href"));
        })
        .filter(Boolean);

    function spy() {
        const mark = window.scrollY + 160;
        let current = null;
        sections.forEach(function (section) {
            if (section.offsetTop <= mark) current = section;
        });
        links.forEach(function (link) {
            link.classList.toggle("is-active", current && link.getAttribute("href") === "#" + current.id);
        });
        if (progress) {
            const height = document.documentElement.scrollHeight - window.innerHeight;
            progress.style.width = (height > 0 ? (window.scrollY / height) * 100 : 0) + "%";
        }
        nav?.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    spy();
    window.addEventListener("scroll", spy, { passive: true });

    const counters = document.querySelectorAll("[data-count]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function renderCount(node, value) {
        const prefix = node.dataset.prefix || "";
        const suffix = node.dataset.suffix || "";
        node.textContent = prefix + Math.round(value) + suffix;
    }

    function animateCount(node) {
        const target = Number(node.dataset.count);
        if (reduce || !target) {
            renderCount(node, target);
            return;
        }
        const start = performance.now();
        const duration = 900;
        function frame(now) {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            renderCount(node, target * eased);
            if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    if ("IntersectionObserver" in window) {
        const countObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                animateCount(entry.target);
                countObserver.unobserve(entry.target);
            });
        }, { threshold: 0.6 });
        counters.forEach(function (node) {
            countObserver.observe(node);
        });
    }

    const tabs = [...document.querySelectorAll(".filters [role='tab']")];
    const cards = [...document.querySelectorAll(".work-card")];
    const count = document.getElementById("work-count");

    function applyFilter(filter) {
        let visible = 0;
        cards.forEach(function (card) {
            const kinds = (card.dataset.kind || "").split(/\s+/);
            const show = filter === "all" || kinds.includes(filter);
            card.hidden = !show;
            if (show) visible += 1;
        });
        if (count) {
            count.textContent = visible + (visible === 1 ? " project" : " projects");
        }
        if (!reduce) {
            cards.forEach(function (card) {
                if (card.hidden) return;
                card.classList.remove("arrive");
                void card.offsetWidth;
                card.classList.add("arrive");
            });
        }
        tabs.forEach(function (tab) {
            const selected = tab.dataset.filter === filter;
            tab.setAttribute("aria-selected", selected ? "true" : "false");
            tab.tabIndex = selected ? 0 : -1;
        });
    }

    tabs.forEach(function (tab, index) {
        tab.tabIndex = tab.getAttribute("aria-selected") === "true" ? 0 : -1;
        tab.addEventListener("click", function () {
            applyFilter(tab.dataset.filter);
        });
        tab.addEventListener("keydown", function (event) {
            const next = event.key === "ArrowRight" ? tabs[(index + 1) % tabs.length]
                : event.key === "ArrowLeft" ? tabs[(index - 1 + tabs.length) % tabs.length]
                : null;
            if (!next) return;
            event.preventDefault();
            next.focus();
            applyFilter(next.dataset.filter);
        });
    });

    const motionNodes = document.querySelectorAll(".role, .skill-card, .craft-grid article, .work-card, .bg-card, .stats article, .section-intro, .about-head, .about-layout > *, .contact-panel");
    if (reduce || !("IntersectionObserver" in window)) {
        motionNodes.forEach(function (node) { node.classList.add("in"); });
    } else {
        const motionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("in");
                motionObserver.unobserve(entry.target);
            });
        }, { threshold: 0.15 });
        motionNodes.forEach(function (node) {
            node.querySelectorAll("li").forEach(function (item, index) {
                item.style.setProperty("--d", String(index));
            });
            const rect = node.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) node.classList.add("in");
            else motionObserver.observe(node);
        });
    }

    if (!reduce && window.matchMedia("(pointer: fine)").matches) {
        document.querySelectorAll(".work-card:not(.feature)").forEach(function (card) {
            card.addEventListener("pointermove", function (event) {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
            });
            card.addEventListener("pointerleave", function () {
                card.style.transform = "";
            });
        });
    }

    const phone = document.getElementById("phone-demo");
    if (phone && !reduce) {
        const scenes = [
            { kicker: "Warehouse", metric: "18", unit: "tasks", active: 0, statuses: ["Now", "12 lines", "Later", "Queued"] },
            { kicker: "Pick list", metric: "12", unit: "lines", active: 1, statuses: ["Done", "Now", "Next", "Queued"] },
            { kicker: "Today’s run", metric: "48", unit: "stops", active: 2, statuses: ["Done", "Done", "Live", "Queued"] },
            { kicker: "Close out", metric: "6", unit: "bins", active: 3, statuses: ["Done", "Done", "Done", "Now"] }
        ];
        const kicker = phone.querySelector(".phone-kicker");
        const metric = phone.querySelector(".phone-metric");
        const rows = [...phone.querySelectorAll("li")];
        const bar = phone.querySelector(".phone-bar span");
        let sceneIndex = 2;

        function showScene(index) {
            const scene = scenes[index];
            kicker.textContent = scene.kicker;
            metric.innerHTML = scene.metric + " <small>" + scene.unit + "</small>";
            rows.forEach(function (row, index) {
                row.classList.toggle("active", index === scene.active);
                const status = row.querySelector("em");
                if (status) status.textContent = scene.statuses[index];
            });
            if (!bar) return;
            bar.style.transition = "none";
            bar.style.width = "0%";
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    bar.style.transition = "width 2.4s linear";
                    bar.style.width = "100%";
                });
            });
        }

        showScene(sceneIndex);
        window.setInterval(function () {
            sceneIndex = (sceneIndex + 1) % scenes.length;
            showScene(sceneIndex);
        }, 2600);
    }

    document.querySelectorAll("[data-copy]").forEach(function (button) {
        button.addEventListener("click", async function () {
            const value = button.dataset.copy;
            try {
                await navigator.clipboard.writeText(value);
                const original = button.textContent;
                button.textContent = "Copied";
                button.classList.add("is-copied");
                window.setTimeout(function () {
                    button.textContent = original;
                    button.classList.remove("is-copied");
                }, 1600);
            } catch (e) {
                window.location.href = "mailto:" + value;
            }
        });
    });
})();
