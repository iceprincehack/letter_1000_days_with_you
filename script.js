/* ============================================================
   CARTA — 1000 DÍAS · v2.8
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================================
     01 · FOTOGRAFÍAS SEGÚN EL SCROLL
     ========================================================== */

  const steps = [...document.querySelectorAll(".story-step")];
  const images = [...document.querySelectorAll(".bg-image")];
  const frameNumber = document.getElementById("frame-number");

  const frameLabels = {
    1: "# 01 A",
    2: "# 02 A",
    3: "# 03 A",
    4: "# 04 A"
  };

  let currentStep = "1";
  let ticking = false;

  function activateStep(step) {
    if (!step || step === currentStep) return;

    currentStep = step;

    images.forEach((image) => {
      const shouldBeActive = image.dataset.step === step;
      image.classList.toggle("active", shouldBeActive);
    });

    if (frameNumber && frameLabels[step]) {
      frameNumber.textContent = frameLabels[step];
    }
  }

  function findCurrentStep() {
    if (!steps.length) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const letterCopy = document.querySelector(".letter-copy");

    let closestStep = null;
    let closestDistance = Infinity;

    if (isMobile && letterCopy) {
      const viewportCenter = letterCopy.scrollTop + letterCopy.clientHeight / 2;

      steps.forEach((step) => {
        const stepCenter = step.offsetTop + step.offsetHeight / 2;
        const distance = Math.abs(stepCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestStep = step;
        }
      });
    } else {
      const viewportCenter = window.innerHeight / 2;

      steps.forEach((step) => {
        const rect = step.getBoundingClientRect();
        const stepCenter = rect.top + rect.height / 2;
        const distance = Math.abs(stepCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestStep = step;
        }
      });
    }

    if (closestStep) {
      activateStep(closestStep.dataset.step);
    }
  }

  function requestStepUpdate() {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(() => {
      findCurrentStep();
      ticking = false;
    });
  }

  if (steps.length) {
    currentStep = null;
    activateStep("1");
    findCurrentStep();
  }

  window.addEventListener("scroll", requestStepUpdate, { passive: true });
  window.addEventListener("resize", requestStepUpdate, { passive: true });

  const letterCopy = document.querySelector(".letter-copy");
  if (letterCopy) {
    letterCopy.addEventListener("scroll", requestStepUpdate, { passive: true });
  }


  /* ==========================================================
     02 · EFECTO PARALLAX / FADE EN SCROLL HINT (HERO)
     ========================================================== */

  const scrollHint = document.querySelector(".scroll-hint");

  if (scrollHint) {
    window.addEventListener("scroll", () => {
      const scrolled = window.scrollY;
      if (scrolled < 300) {
        scrollHint.style.opacity = String(1 - scrolled / 250);
        scrollHint.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    }, { passive: true });
  }


  /* ==========================================================
     03 · HOJAS DE MAPLE
     ========================================================== */

  const leavesCanvas = document.getElementById("leaves-canvas");

  if (leavesCanvas) {
    const leavesLayer = document.createElement("div");
    leavesLayer.id = "leaves-layer";
    leavesLayer.setAttribute("aria-hidden", "true");
    leavesCanvas.replaceWith(leavesLayer);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let leaves = [];

    const MAPLE_LEAF_SVG = "maple-leaf.svg";
    const leafFilters = [
      "drop-shadow(0 2px 4px rgba(45, 23, 14, 0.14)) brightness(0.92) saturate(0.92)",
      "drop-shadow(0 2px 4px rgba(45, 23, 14, 0.14)) brightness(1) saturate(0.96)",
      "drop-shadow(0 2px 4px rgba(45, 23, 14, 0.13)) brightness(1.05) saturate(0.94)",
      "drop-shadow(0 2px 4px rgba(45, 23, 14, 0.12)) brightness(1.10) saturate(0.90)",
      "drop-shadow(0 2px 4px rgba(45, 23, 14, 0.16)) brightness(0.86) saturate(0.88)"
    ];

    function createLeaf() {
      const depth = Math.random();
      const isDelicate = Math.random() < 0.30;
      const size = isDelicate ? 14 + depth * 18 : 16 + depth * 24;

      const element = document.createElement("span");
      element.className = "falling-leaf";
      element.setAttribute("aria-hidden", "true");
      element.style.setProperty("--leaf-size", `${size}px`);
      element.style.setProperty("--leaf-filter", leafFilters[Math.floor(Math.random() * leafFilters.length)]);
      element.style.display = "block";
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.lineHeight = "0";

      const icon = document.createElement("img");
      icon.src = MAPLE_LEAF_SVG;
      icon.alt = "";
      icon.setAttribute("aria-hidden", "true");
      icon.draggable = false;
      icon.style.display = "block";
      icon.style.width = "100%";
      icon.style.height = "100%";
      icon.style.objectFit = "contain";
      icon.style.pointerEvents = "none";

      element.appendChild(icon);
      leavesLayer.appendChild(element);

      icon.addEventListener("error", () => element.remove(), { once: true });

      return {
        element,
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        depth,
        speedY: 0.10 + depth * 0.26 + Math.random() * 0.055,
        drift: 0.12 + depth * 0.42,
        wind: (Math.random() - 0.5) * (0.025 + depth * 0.065),
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.004 + depth * 0.006,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * (0.010 + depth * 0.006),
        flutter: Math.random() * Math.PI * 2,
        flutterSpeed: 0.010 + depth * 0.012,
        flutterAmount: 0.08 + Math.random() * 0.16,
        opacity: isDelicate ? 0.20 + depth * 0.24 : 0.28 + depth * 0.30
      };
    }

    function buildLeaves() {
      leaves.forEach((leaf) => leaf.element.remove());
      const count = Math.min(20, Math.max(11, Math.floor(width / 100)));
      leaves = Array.from({ length: count }, createLeaf);
    }

    function renderLeaf(leaf) {
      const edgeFade = Math.min(1, Math.max(0, (height - leaf.y) / 90));
      const topFade = Math.min(1, Math.max(0, (leaf.y + 50) / 80));
      const fade = Math.min(edgeFade, topFade);
      const flutter = 1 + Math.sin(leaf.flutter) * leaf.flutterAmount;

      leaf.element.style.transform =
        `translate3d(${leaf.x}px, ${leaf.y}px, 0) ` +
        `rotate(${leaf.rotation}rad) ` +
        `scaleX(${flutter})`;

      leaf.element.style.opacity = String(leaf.opacity * fade);
    }

    function animate(time = 0) {
      const globalWind = Math.sin(time * 0.00013) * 0.018;

      for (const leaf of leaves) {
        leaf.y += leaf.speedY;
        leaf.phase += leaf.phaseSpeed;
        leaf.flutter += leaf.flutterSpeed;
        leaf.x += leaf.wind + globalWind + Math.sin(leaf.phase) * leaf.drift * 0.18;
        leaf.rotation += leaf.rotationSpeed;

        if (leaf.y > height + 50) {
          leaf.y = -40 - Math.random() * 90;
          leaf.x = Math.random() * width;
          leaf.phase = Math.random() * Math.PI * 2;
          leaf.flutter = Math.random() * Math.PI * 2;
        }

        if (leaf.x < -60) leaf.x = width + 40;
        if (leaf.x > width + 60) leaf.x = -40;

        renderLeaf(leaf);
      }

      requestAnimationFrame(animate);
    }

    function resizeLeaves() {
      width = window.innerWidth;
      height = window.innerHeight;
      buildLeaves();
      if (reduceMotion) leaves.forEach(renderLeaf);
    }

    resizeLeaves();
    window.addEventListener("resize", resizeLeaves, { passive: true });

    if (!reduceMotion) {
      requestAnimationFrame(animate);
    } else {
      leaves.forEach((leaf) => {
        leaf.opacity *= 0.68;
        renderLeaf(leaf);
      });
    }
  }


  /* ==========================================================
     04 · ENTRADAS OBSERVED (HERO, CARTA Y CIERRE)
     ========================================================== */

  const hero = document.querySelector(".hero");
  const storySection = document.querySelector(".story");
  const outro = document.querySelector(".outro");
  const reduceMotionReveal = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* HERO */
  if (hero) {
    if (reduceMotionReveal) {
      hero.classList.add("is-visible");
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          hero.classList.add("is-visible");
        });
      });
    }
  }

  /* CARTA (Entrada suave al bajar) */
  if (storySection) {
    if (reduceMotionReveal) {
      storySection.classList.add("is-visible");
    } else {
      const storyObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              storySection.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      storyObserver.observe(storySection);
    }
  }

  /* CIERRE */
  if (outro) {
    if (reduceMotionReveal) {
      outro.classList.add("is-visible");
    } else {
      outro.classList.remove("is-visible");

      const outroObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              outro.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );

      outroObserver.observe(outro);
    }
  }

});