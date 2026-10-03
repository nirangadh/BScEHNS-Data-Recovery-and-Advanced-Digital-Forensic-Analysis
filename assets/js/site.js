/* NB6018CEM courseware portal. MIT licence.
   Everything here is progressive enhancement: with script off, every answer is still readable.
   Nothing leaves the device. Progress is a personal record and never gates any content. */
(function () {
  "use strict";
  var KEY = "nb6018:done:";

  function store(fn, fallback) { try { return fn(window.localStorage); } catch (e) { return fallback; } }
  function isDone(code) { return store(function (s) { return s.getItem(KEY + code) === "1"; }, false); }
  function setDone(code, v) { store(function (s) { if (v) { s.setItem(KEY + code, "1"); } else { s.removeItem(KEY + code); } }); }

  /* Progress button on a session page */
  document.querySelectorAll("[data-progress]").forEach(function (btn) {
    var code = btn.getAttribute("data-progress");
    function paint() {
      var d = isDone(code);
      btn.classList.toggle("done", d);
      btn.textContent = d ? "Done on this device (tap to undo)" : "Mark this session as done";
      btn.setAttribute("aria-pressed", d ? "true" : "false");
    }
    btn.addEventListener("click", function () { setDone(code, !isDone(code)); paint(); });
    paint();
  });

  /* Done marks on the home page */
  document.querySelectorAll("[data-slot]").forEach(function (el) {
    if (isDone(el.getAttribute("data-slot"))) { el.classList.add("is-done"); }
  });

  /* Quick checks: turn options into buttons and give feedback with the reason */
  document.querySelectorAll(".qc").forEach(function (qc, qi) {
    var answer = (qc.getAttribute("data-answer") || "").trim().toLowerCase();
    var feedback = document.createElement("p");
    feedback.className = "qc-feedback";
    feedback.setAttribute("aria-live", "polite");
    var opts = qc.querySelectorAll(".qc-opts li");
    var why = qc.querySelector(".qc-why");
    opts.forEach(function (li) {
      var key = (li.getAttribute("data-key") || "").trim().toLowerCase();
      var b = document.createElement("button");
      b.type = "button";
      b.innerHTML = li.innerHTML;
      b.addEventListener("click", function () {
        if (qc.classList.contains("answered")) { return; }
        qc.classList.add("answered");
        var right = key === answer;
        b.classList.add(right ? "right" : "wrong");
        if (!right) {
          opts.forEach(function (o) { if ((o.getAttribute("data-key") || "").toLowerCase() === answer) { var rb = o.querySelector("button"); if (rb) { rb.classList.add("right"); } } });
        }
        feedback.textContent = right ? "Correct. Here is why:" : "Not quite. The correct answer is marked. Here is why:";
        var retry = document.createElement("button");
        retry.type = "button"; retry.className = "qc-retry"; retry.textContent = "Try this question again";
        retry.addEventListener("click", function () {
          qc.classList.remove("answered");
          qc.querySelectorAll(".qc-opts button").forEach(function (x) { x.classList.remove("right", "wrong"); });
          feedback.textContent = ""; retry.remove();
        });
        (why || feedback).after(retry);
      });
      li.innerHTML = ""; li.appendChild(b);
    });
    var list = qc.querySelector(".qc-opts");
    if (list) { list.after(feedback); }
  });

  /* Glossary tooltips: link each term to its definition for screen readers */
  document.querySelectorAll(".term").forEach(function (t, i) {
    var d = t.querySelector(".term-def");
    if (!d) { return; }
    d.id = "term-def-" + i;
    t.setAttribute("aria-describedby", d.id);
    t.addEventListener("keydown", function (e) { if (e.key === "Escape") { t.blur(); } });
  });

  /* Printing opens every collapsed section so nothing is lost on paper */
  window.addEventListener("beforeprint", function () {
    document.querySelectorAll("details").forEach(function (d) { d.setAttribute("data-was-open", d.open ? "1" : "0"); d.open = true; });
  });
  window.addEventListener("afterprint", function () {
    document.querySelectorAll("details[data-was-open]").forEach(function (d) { d.open = d.getAttribute("data-was-open") === "1"; d.removeAttribute("data-was-open"); });
  });
})();
