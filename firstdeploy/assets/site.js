(function () {
  "use strict";

  var KILL = [
    ".hiveads",
    "#jobproof-strip",
    "#flick-strip",
    "#hive-notes",
    'script[src*="hiveads.netlify.app"]',
    'script[src*="firstdeploy-pay.netlify.app"]',
    "iframe[src*='hiveads']",
  ];

  function sweep() {
    var i;
    var nodes;
    var n;
    for (i = 0; i < KILL.length; i++) {
      nodes = document.querySelectorAll(KILL[i]);
      for (n = 0; n < nodes.length; n++) nodes[n].remove();
    }
    nodes = document.querySelectorAll("#netlify-rum-container, script[id='netlify-rum-container']");
    for (n = 1; n < nodes.length; n++) nodes[n].remove();
  }

  sweep();
  if (document.body) {
    new MutationObserver(sweep).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      sweep();
      new MutationObserver(sweep).observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    });
  }

  function tickClock() {
    var clock = document.getElementById("desk-clock");
    if (!clock) return;
    clock.textContent = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  tickClock();
  setInterval(tickClock, 30000);

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
