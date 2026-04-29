(() => {
  "use strict";
  const flsModules = {};
  function getHash() {
    if (location.hash) return location.hash.replace("#", "");
  }
  let bodyLockStatus = true;
  let bodyUnlock = (delay = 500) => {
    if (bodyLockStatus) {
      const lockPaddingElements = document.querySelectorAll("[data-lp]");
      setTimeout(() => {
        lockPaddingElements.forEach((lockPaddingElement) => {
          lockPaddingElement.style.paddingRight = "";
        });
        document.body.style.paddingRight = "";
        document.documentElement.classList.remove("lock");
      }, delay);
      bodyLockStatus = false;
      setTimeout(function () {
        bodyLockStatus = true;
      }, delay);
    }
  };
  function menuClose() {
    bodyUnlock();
    document.documentElement.classList.remove("menu-open");
  }
  function FLS(message) {
    setTimeout(() => {
      if (window.FLS) console.log(message);
    }, 0);
  }
  let gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
    const targetBlockElement = document.querySelector(targetBlock);
    if (targetBlockElement) {
      let headerItem = "";
      let headerItemHeight = 0;
      if (noHeader) {
        headerItem = "header.header";
        const headerElement = document.querySelector(headerItem);
        if (!headerElement.classList.contains("_header-scroll")) {
          headerElement.style.cssText = `transition-duration: 0s;`;
          headerElement.classList.add("_header-scroll");
          headerItemHeight = headerElement.offsetHeight;
          headerElement.classList.remove("_header-scroll");
          setTimeout(() => {
            headerElement.style.cssText = ``;
          }, 0);
        } else headerItemHeight = headerElement.offsetHeight;
      }
      let options = {
        speedAsDuration: true,
        speed,
        header: headerItem,
        offset: offsetTop,
        easing: "easeOutQuad",
      };
      document.documentElement.classList.contains("menu-open") ? menuClose() : null;
      if (typeof SmoothScroll !== "undefined") new SmoothScroll().animateScroll(targetBlockElement, "", options);
      else {
        let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
        targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
        targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
        window.scrollTo({
          top: targetBlockElementPosition,
          behavior: "smooth",
        });
      }
      FLS(`[gotoBlock]: Юхуу...едем в ${targetBlock}`);
    } else FLS(`[gotoBlock]: Ей... Такого блока нет на странице: ${targetBlock}`);
  };
  function pageNavigation() {
    document.addEventListener("click", pageNavigationAction);
    document.addEventListener("watcherCallback", pageNavigationAction);
    function pageNavigationAction(e) {
      if (e.type === "click") {
        const targetElement = e.target;
        if (targetElement.closest("[data-goto]")) {
          const gotoLink = targetElement.closest("[data-goto]");
          const gotoLinkSelector = gotoLink.dataset.goto ? gotoLink.dataset.goto : "";
          const noHeader = gotoLink.hasAttribute("data-goto-header") ? true : false;
          const gotoSpeed = gotoLink.dataset.gotoSpeed ? gotoLink.dataset.gotoSpeed : 500;
          const offsetTop = gotoLink.dataset.gotoTop ? parseInt(gotoLink.dataset.gotoTop) : 0;
          if (flsModules.fullpage) {
            const fullpageSection = document.querySelector(`${gotoLinkSelector}`).closest("[data-fp-section]");
            const fullpageSectionId = fullpageSection ? +fullpageSection.dataset.fpId : null;
            if (fullpageSectionId !== null) {
              flsModules.fullpage.switchingSection(fullpageSectionId);
              document.documentElement.classList.contains("menu-open") ? menuClose() : null;
            }
          } else gotoBlock(gotoLinkSelector, noHeader, gotoSpeed, offsetTop);
          e.preventDefault();
        }
      } else if (e.type === "watcherCallback" && e.detail) {
        const entry = e.detail.entry;
        const targetElement = entry.target;
        if (targetElement.dataset.watch === "navigator") {
          document.querySelector(`[data-goto]._navigator-active`);
          let navigatorCurrentItem;
          if (targetElement.id && document.querySelector(`[data-goto="#${targetElement.id}"]`)) navigatorCurrentItem = document.querySelector(`[data-goto="#${targetElement.id}"]`);
          else if (targetElement.classList.length)
            for (let index = 0; index < targetElement.classList.length; index++) {
              const element = targetElement.classList[index];
              if (document.querySelector(`[data-goto=".${element}"]`)) {
                navigatorCurrentItem = document.querySelector(`[data-goto=".${element}"]`);
                break;
              }
            }
          if (entry.isIntersecting) navigatorCurrentItem ? navigatorCurrentItem.classList.add("_navigator-active") : null;
          else navigatorCurrentItem ? navigatorCurrentItem.classList.remove("_navigator-active") : null;
        }
      }
    }
    if (getHash()) {
      let goToHash;
      if (document.querySelector(`#${getHash()}`)) goToHash = `#${getHash()}`;
      else if (document.querySelector(`.${getHash()}`)) goToHash = `.${getHash()}`;
      goToHash ? gotoBlock(goToHash, true, 500, 20) : null;
    }
  }
  const marquee = () => {
    const $marqueeArray = document.querySelectorAll("[data-marquee]");
    const CLASS_NAMES = {
      wrapper: "marquee-wrapper",
      inner: "marquee-inner",
      item: "marquee-item",
    };
    if (!$marqueeArray.length) return;
    const { head } = document;
    function debounce(delay, fn) {
      let timerId;
      return (...args) => {
        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(() => {
          fn(...args);
          timerId = null;
        }, delay);
      };
    }
    const onWindowWidthResize = (cb) => {
      if (typeof cb !== "function") return;
      let prevWidth = 0;
      const handleResize = () => {
        const currentWidth = window.innerWidth;
        if (prevWidth !== currentWidth) {
          prevWidth = currentWidth;
          cb();
        }
      };
      window.addEventListener("resize", debounce(50, handleResize));
      handleResize();
    };
    const buildMarquee = (marqueeNode) => {
      if (!marqueeNode) return;
      const $marquee = marqueeNode;
      const $childElements = $marquee.children;
      if (!$childElements.length) return;
      $marquee.classList.add(CLASS_NAMES.wrapper);
      Array.from($childElements).forEach(($childItem) => $childItem.classList.add(CLASS_NAMES.item));
      const htmlStructure = `<div class="${CLASS_NAMES.inner}">${$marquee.innerHTML}</div>`;
      $marquee.innerHTML = htmlStructure;
    };
    const getElSize = ($el, isVertical) => {
      if (isVertical) return $el.offsetHeight;
      return $el.offsetWidth;
    };
    $marqueeArray.forEach(($wrapper) => {
      if (!$wrapper) return;
      buildMarquee($wrapper);
      const $marqueeInner = $wrapper.firstElementChild;
      let cacheArray = [];
      if (!$marqueeInner) return;
      const dataMarqueeSpace = parseFloat($wrapper.getAttribute("data-marquee-space"));
      const $items = $wrapper.querySelectorAll(`.${CLASS_NAMES.item}`);
      const speed = parseFloat($wrapper.getAttribute("data-marquee-speed")) / 10 || 100;
      const isMousePaused = $wrapper.hasAttribute("data-marquee-pause-mouse-enter");
      const direction = $wrapper.getAttribute("data-marquee-direction");
      const isVertical = direction === "bottom" || direction === "top";
      const animName = `marqueeAnimation-${Math.floor(Math.random() * 1e7)}`;
      let spaceBetweenItem = parseFloat(window.getComputedStyle($items[0])?.getPropertyValue("margin-right"));
      let spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
      let startPosition = parseFloat($wrapper.getAttribute("data-marquee-start")) || 0;
      let sumSize = 0;
      let firstScreenVisibleSize = 0;
      let initialSizeElements = 0;
      let initialElementsLength = $marqueeInner.children.length;
      let index = 0;
      let counterDuplicateElements = 0;
      const initEvents = () => {
        if (startPosition) $marqueeInner.addEventListener("animationiteration", onChangeStartPosition);
        if (!isMousePaused) return;
        $marqueeInner.removeEventListener("mouseenter", onChangePaused);
        $marqueeInner.removeEventListener("mouseleave", onChangePaused);
        $marqueeInner.addEventListener("mouseenter", onChangePaused);
        $marqueeInner.addEventListener("mouseleave", onChangePaused);
      };
      const onChangeStartPosition = () => {
        startPosition = 0;
        $marqueeInner.removeEventListener("animationiteration", onChangeStartPosition);
        onResize();
      };
      const setBaseStyles = (firstScreenVisibleSize) => {
        let baseStyle = "display: flex; flex-wrap: nowrap;";
        if (isVertical) {
          baseStyle += `\n\t\t\t\tflex-direction: column;\n\t\t\t position: relative;\n\t\t\t will-change: transform;`;
          if (direction === "bottom") baseStyle += `top: -${firstScreenVisibleSize}px;`;
        } else {
          baseStyle += `\n\t\t\t\tposition: relative;\n\t\t\t will-change: transform;`;
          if (direction === "right") baseStyle += `left: -${firstScreenVisibleSize}px;;`;
        }
        $marqueeInner.style.cssText = baseStyle;
      };
      const setdirectionAnim = (totalWidth) => {
        switch (direction) {
          case "right":
          case "bottom":
            return totalWidth;

          default:
            return -totalWidth;
        }
      };
      const animation = () => {
        const keyFrameCss = `@keyframes ${animName} {\n\t\t\t\t\t 0% {\n\t\t\t\t\t\t transform: translate${
          isVertical ? "Y" : "X"
        }(${startPosition}%);\n\t\t\t\t\t }\n\t\t\t\t\t 100% {\n\t\t\t\t\t\t transform: translate${isVertical ? "Y" : "X"}(${setdirectionAnim(firstScreenVisibleSize)}px);\n\t\t\t\t\t }\n\t\t\t\t }`;
        const $style = document.createElement("style");
        $style.classList.add(animName);
        $style.innerHTML = keyFrameCss;
        head.append($style);
        $marqueeInner.style.animation = `${animName} ${(firstScreenVisibleSize + (startPosition * firstScreenVisibleSize) / 100) / speed}s infinite linear`;
      };
      const addDublicateElements = () => {
        sumSize = firstScreenVisibleSize = initialSizeElements = counterDuplicateElements = index = 0;
        const $parentNodeWidth = getElSize($wrapper, isVertical);
        let $childrenEl = Array.from($marqueeInner.children);
        if (!$childrenEl.length) return;
        if (!cacheArray.length) cacheArray = $childrenEl.map(($item) => $item);
        else $childrenEl = [...cacheArray];
        $marqueeInner.style.display = "flex";
        if (isVertical) $marqueeInner.style.flexDirection = "column";
        $marqueeInner.innerHTML = "";
        $childrenEl.forEach(($item) => {
          $marqueeInner.append($item);
        });
        $childrenEl.forEach(($item) => {
          if (isVertical) $item.style.marginBottom = `${spaceBetween}px`;
          else {
            $item.style.marginRight = `${spaceBetween}px`;
            $item.style.flexShrink = 0;
          }
          const sizeEl = getElSize($item, isVertical);
          sumSize += sizeEl + spaceBetween;
          firstScreenVisibleSize += sizeEl + spaceBetween;
          initialSizeElements += sizeEl + spaceBetween;
          counterDuplicateElements += 1;
          return sizeEl;
        });
        const $multiplyWidth = $parentNodeWidth * 2 + initialSizeElements;
        for (; sumSize < $multiplyWidth; index += 1) {
          if (!$childrenEl[index]) index = 0;
          const $cloneNone = $childrenEl[index].cloneNode(true);
          const $lastElement = $marqueeInner.children[index];
          $marqueeInner.append($cloneNone);
          sumSize += getElSize($lastElement, isVertical) + spaceBetween;
          if (firstScreenVisibleSize < $parentNodeWidth || counterDuplicateElements % initialElementsLength !== 0) {
            counterDuplicateElements += 1;
            firstScreenVisibleSize += getElSize($lastElement, isVertical) + spaceBetween;
          }
        }
        setBaseStyles(firstScreenVisibleSize);
      };
      const correctSpaceBetween = () => {
        if (spaceBetweenItem) {
          $items.forEach(($item) => $item.style.removeProperty("margin-right"));
          spaceBetweenItem = parseFloat(window.getComputedStyle($items[0]).getPropertyValue("margin-right"));
          spaceBetween = spaceBetweenItem ? spaceBetweenItem : !isNaN(dataMarqueeSpace) ? dataMarqueeSpace : 30;
        }
      };
      const init = () => {
        correctSpaceBetween();
        addDublicateElements();
        animation();
        initEvents();
      };
      const onResize = () => {
        head.querySelector(`.${animName}`)?.remove();
        init();
      };
      const onChangePaused = (e) => {
        const { type, target } = e;
        target.style.animationPlayState = type === "mouseenter" ? "paused" : "running";
      };
      onWindowWidthResize(onResize);
    });
  };
  marquee();
  class DynamicAdapt {
    constructor(type) {
      this.type = type;
    }
    init() {
      this.оbjects = [];
      this.daClassname = "_dynamic_adapt_";
      this.nodes = [...document.querySelectorAll("[data-da]")];
      this.nodes.forEach((node) => {
        const data = node.dataset.da.trim();
        const dataArray = data.split(",");
        const оbject = {};
        оbject.element = node;
        оbject.parent = node.parentNode;
        оbject.destination = document.querySelector(`${dataArray[0].trim()}`);
        оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767.98";
        оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
        оbject.index = this.indexInParent(оbject.parent, оbject.element);
        this.оbjects.push(оbject);
      });
      this.arraySort(this.оbjects);
      this.mediaQueries = this.оbjects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self) => self.indexOf(item) === index);
      this.mediaQueries.forEach((media) => {
        const mediaSplit = media.split(",");
        const matchMedia = window.matchMedia(mediaSplit[0]);
        const mediaBreakpoint = mediaSplit[1];
        const оbjectsFilter = this.оbjects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
        matchMedia.addEventListener("change", () => {
          this.mediaHandler(matchMedia, оbjectsFilter);
        });
        this.mediaHandler(matchMedia, оbjectsFilter);
      });
    }
    mediaHandler(matchMedia, оbjects) {
      if (matchMedia.matches)
        оbjects.forEach((оbject) => {
          this.moveTo(оbject.place, оbject.element, оbject.destination);
        });
      else
        оbjects.forEach(({ parent, element, index }) => {
          if (element.classList.contains(this.daClassname)) this.moveBack(parent, element, index);
        });
    }
    moveTo(place, element, destination) {
      element.classList.add(this.daClassname);
      if (place === "last" || place >= destination.children.length) {
        destination.append(element);
        return;
      }
      if (place === "first") {
        destination.prepend(element);
        return;
      }
      destination.children[place].before(element);
    }
    moveBack(parent, element, index) {
      element.classList.remove(this.daClassname);
      if (parent.children[index] !== void 0) parent.children[index].before(element);
      else parent.append(element);
    }
    indexInParent(parent, element) {
      return [...parent.children].indexOf(element);
    }
    arraySort(arr) {
      if (this.type === "min")
        arr.sort((a, b) => {
          if (a.breakpoint === b.breakpoint) {
            if (a.place === b.place) return 0;
            if (a.place === "first" || b.place === "last") return -1;
            if (a.place === "last" || b.place === "first") return 1;
            return 0;
          }
          return a.breakpoint - b.breakpoint;
        });
      else {
        arr.sort((a, b) => {
          if (a.breakpoint === b.breakpoint) {
            if (a.place === b.place) return 0;
            if (a.place === "first" || b.place === "last") return 1;
            if (a.place === "last" || b.place === "first") return -1;
            return 0;
          }
          return b.breakpoint - a.breakpoint;
        });
        return;
      }
    }
  }
  const da = new DynamicAdapt("max");
  da.init();
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  (() => {
    const slides = $$(".stages__item");
    if (!slides.length) return;
    const prevBtn = $(".stages__nav--prev");
    const nextBtn = $(".stages__nav--next");
    const pagination = $(".stages__pagination");
    const SHOW_PER_PAGE = 1;
    const ANIM_MS = 400;
    const DESKTOP_BP = 768;
    const BR_RESTORE_BP = 991;
    let current = 0;
    let isAnimating = false;
    let dots = [];
    function buildPagination() {
      if (!pagination) return;
      const pages = Math.ceil(slides.length / SHOW_PER_PAGE);
      pagination.innerHTML = "";
      dots = [];
      for (let i = 0; i < pages; i++) {
        const btn = document.createElement("span");
        btn.type = "span";
        btn.className = "stages__dot";
        btn.setAttribute("aria-label", `Слайд ${i + 1}`);
        on(btn, "click", () => {
          if (isAnimating) return;
          const target = i * SHOW_PER_PAGE;
          const dir = target > current ? "next" : "prev";
          goTo(target, dir);
        });
        pagination.appendChild(btn);
        dots.push(btn);
      }
      updateDots();
    }
    function updateDots() {
      if (!dots.length) return;
      const page = Math.floor(current / SHOW_PER_PAGE);
      dots.forEach((d, i) => d.classList.toggle("is-active", i === page));
    }
    function updateButtons() {
      const max = slides.length - SHOW_PER_PAGE;
      prevBtn?.classList.toggle("is-disabled", current <= 0);
      nextBtn?.classList.toggle("is-disabled", current >= max);
    }
    function cleanAll() {
      for (const s of slides) {
        s.classList.remove("is-active", "is-prev", "is-next");
        s.style.zIndex = "";
      }
    }
    function hardSetActive(i) {
      slides.forEach((s, idx) => {
        s.classList.toggle("is-active", idx === i);
        s.classList.remove("is-prev", "is-next");
        s.style.zIndex = idx === i ? "2" : "";
      });
    }
    function clamp(i) {
      const max = slides.length - SHOW_PER_PAGE;
      return Math.max(0, Math.min(i, max));
    }
    function applyDirectionClasses(nextIndex, direction) {
      if (isAnimating) return;
      isAnimating = true;
      const oldSlide = slides[current];
      const newSlide = slides[nextIndex];
      if (!oldSlide || !newSlide) {
        isAnimating = false;
        return;
      }
      slides.forEach((s) => (s.style.zIndex = ""));
      oldSlide.classList.remove("is-active", "is-prev", "is-next");
      oldSlide.classList.add(direction === "next" ? "is-prev" : "is-next");
      oldSlide.style.zIndex = "1";
      newSlide.classList.remove("is-active", "is-prev", "is-next");
      newSlide.classList.add(direction === "next" ? "is-next" : "is-prev");
      newSlide.style.zIndex = "2";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          newSlide.classList.remove("is-prev", "is-next");
          newSlide.classList.add("is-active");
        });
      });
      setTimeout(() => {
        hardSetActive(nextIndex);
        isAnimating = false;
      }, ANIM_MS + 40);
    }
    function saveOriginalHtml() {
      $$(".stages__text").forEach((el) => (el.dataset.originalHtml = el.innerHTML));
    }
    function removeBr() {
      $$(".stages__text").forEach((el) => el.querySelectorAll("br").forEach((br) => br.remove()));
    }
    function restoreBr() {
      $$(".stages__text").forEach((el) => {
        if (el.dataset.originalHtml) el.innerHTML = el.dataset.originalHtml;
      });
    }
    function updateActiveCards() {
      const active = $$(".stages__item.is-active");
      active.forEach((item) => {
        const cards = $$(".stages__card", item);
        cards.forEach((card, i) => {
          card.classList.toggle("is-active", i !== cards.length - 1);
          card.classList.toggle("is-active-last", i === cards.length - 1);
        });
      });
    }
    function goTo(targetIndex, dir = "next") {
      const nextIndex = clamp(targetIndex);
      if (nextIndex === current || isAnimating) return;
      if (window.innerWidth <= DESKTOP_BP) applyDirectionClasses(nextIndex, dir);
      else {
        cleanAll();
        slides.forEach((s) => s.classList.add("is-active"));
      }
      current = nextIndex;
      updateButtons();
      updateDots();
      updateActiveCards();
    }
    function layout() {
      if (window.innerWidth > BR_RESTORE_BP) restoreBr();
      else removeBr();
      if (window.innerWidth > DESKTOP_BP) {
        cleanAll();
        slides.forEach((s) => s.classList.add("is-active"));
      } else {
        cleanAll();
        const curSlide = slides[current] || slides[0];
        curSlide?.classList.add("is-active");
        if (curSlide) curSlide.style.zIndex = "2";
      }
      updateButtons();
      updateDots();
    }
    on(prevBtn, "click", () => !isAnimating && goTo(current - SHOW_PER_PAGE, "prev"));
    on(nextBtn, "click", () => !isAnimating && goTo(current + SHOW_PER_PAGE, "next"));
    let stagesLayoutRaf = 0;
    const scheduleStagesLayout = () => {
      cancelAnimationFrame(stagesLayoutRaf);
      stagesLayoutRaf = requestAnimationFrame(layout);
    };
    on(window, "resize", scheduleStagesLayout);
    const initStages = () => {
      saveOriginalHtml();
      buildPagination();
      layout();
      updateDots();
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initStages);
    else initStages();
  })();
  (() => {
    const root = $(".participants");
    if (!root) return;
    const viewport = $(".participants__viewport", root);
    const track = $(".participants__track", root);
    const slides = $$(".participants__slide", root);
    if (!viewport || !track || !slides.length) return;
    const prevBtns = $$(".participants__arrow--prev", root);
    const nextBtns = $$(".participants__arrow--next", root);
    const currentEls = $$(".participants__current", root);
    const totalEls = $$(".participants__total", root);
    const TOTAL = slides.length;
    totalEls.forEach((e) => (e.textContent = TOTAL));
    currentEls.forEach((e) => (e.textContent = 1));
    let slidesPerView = 1;
    let slideWidth = 0;
    let index = 0;
    const getGap = () => {
      const cs = getComputedStyle(track);
      return parseFloat(cs.columnGap || cs.gap || "0") || 0;
    };
    const calcSlidesPerView = () => {
      const w = viewport.clientWidth;
      slidesPerView = w >= 1200 ? 3 : w >= 768 ? 2 : 1;
    };
    const maxIndex = () => Math.max(0, TOTAL - slidesPerView);
    const clampIndex = () => (index = Math.max(0, Math.min(index, maxIndex())));
    const move = () => {
      const x = -index * (slideWidth + getGap());
      track.style.transform = `translateX(${x}px)`;
      currentEls.forEach((e) => (e.textContent = index + 1));
    };
    const updateButtons = () => {
      const m = maxIndex();
      prevBtns.forEach((b) => (b.disabled = index === 0));
      nextBtns.forEach((b) => (b.disabled = index === m));
    };
    const layout = () => {
      calcSlidesPerView();
      const w = viewport.clientWidth;
      const gap = getGap();
      const nextWidth = (w - gap * (slidesPerView - 1)) / slidesPerView;
      if (Math.abs(nextWidth - slideWidth) < 0.5) {
        clampIndex();
        move();
        updateButtons();
        return;
      }
      slideWidth = nextWidth;
      slides.forEach((s) => (s.style.width = `${slideWidth}px`));
      clampIndex();
      move();
      updateButtons();
    };
    const next = () => {
      index += 1;
      clampIndex();
      move();
      updateButtons();
    };
    const prev = () => {
      index -= 1;
      clampIndex();
      move();
      updateButtons();
    };
    nextBtns.forEach((b) => on(b, "click", next));
    prevBtns.forEach((b) => on(b, "click", prev));
    viewport.setAttribute("tabindex", "0");
    on(viewport, "keydown", (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    });
    let startX = null,
      dx = 0,
      pid = null;
    on(viewport, "pointerdown", (e) => {
      startX = e.clientX;
      dx = 0;
      pid = e.pointerId;
      viewport.setPointerCapture(pid);
    });
    on(viewport, "pointermove", (e) => {
      if (startX == null) return;
      dx = e.clientX - startX;
    });
    on(viewport, "pointerup", () => {
      if (startX == null) return;
      if (Math.abs(dx) > slideWidth * 0.25) dx < 0 ? next() : prev();
      startX = null;
      dx = 0;
      pid = null;
    });
    let rafId = 0,
      lastW = 0;
    const schedule = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(layout);
    };
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver((entries) => {
        const w = Math.round(entries[0].contentRect.width);
        if (w !== lastW) {
          lastW = w;
          schedule();
        }
      });
      ro.observe(viewport);
    } else on(window, "resize", schedule);
    on(window, "orientationchange", schedule);
    let autoTimer = null;
    const stopAuto = () => {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    };
    const startAuto = () => {
      stopAuto();
      autoTimer = setInterval(() => {
        if (index < maxIndex()) next();
        else stopAuto();
      }, 4e3);
    };
    [...prevBtns, ...nextBtns].forEach((b) => on(b, "click", stopAuto));
    on(viewport, "pointerdown", stopAuto);
    on(viewport, "keydown", stopAuto);
    layout();
    startAuto();
  })();
  window["FLS"] = false;
  pageNavigation();
})();
