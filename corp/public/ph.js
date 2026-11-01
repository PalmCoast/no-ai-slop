// PostHog project 598301. Public project token and US host copied from firstdeploy.ai.
// The token can send events. It cannot read data.
(function () {
  try {
    !function (t, e) {
      var o, n, p, r;
      if (e.__SV) return;
      window.posthog = e;
      e._i = [];
      e.init = function (i, s, a) {
        function g(t, e) {
          var o = e.split(".");
          if (o.length == 2) {
            t = t[o[0]];
            e = o[1];
          }
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        }
        p = t.createElement("script");
        p.type = "text/javascript";
        p.crossOrigin = "anonymous";
        p.async = true;
        p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js";
        r = t.getElementsByTagName("script")[0];
        r.parentNode.insertBefore(p, r);
        var u = e;
        if (a !== undefined) u = e[a] = [];
        else a = "posthog";
        u.people = u.people || [];
        u.toString = function (t) {
          var e = "posthog";
          if (a !== "posthog") e += "." + a;
          if (!t) e += " (stub)";
          return e;
        };
        u.people.toString = function () {
          return u.toString(1) + ".people (stub)";
        };
        o = "init capture register register_once register_for_session unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset identify setPersonProperties group get_distinct_id getFeatureFlag isFeatureEnabled onFeatureFlags".split(" ");
        for (n = 0; n < o.length; n++) g(u, o[n]);
        e._i.push([i, s, a]);
      };
      e.__SV = 1;
    }(document, window.posthog || []);

    posthog.init("phc_y9BPZxQLpF7FviUKN6JSBqSUD7fcnwXuXzHzDQ8asLjv", {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: true,
      autocapture: false,
      disable_session_recording: true,
    });
    posthog.register({ site: location.hostname, project: "598301" });

    document.addEventListener(
      "click",
      function (ev) {
        var node = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
        if (!node) return;
        var href = node.getAttribute("href") || "";
        var monthly = href.indexOf("/go/ads-engine") !== -1;
        var sprint = href.indexOf("/go/ads-sprint") !== -1;
        if (!monthly && !sprint) return;
        posthog.capture(
          "ads_cta_click",
          {
            cta: monthly ? "ads-engine" : "ads-sprint",
            label: (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
            href: href,
            page: location.pathname,
          },
          { send_instantly: true, transport: "sendBeacon" },
        );
      },
      true,
    );
  } catch (e) {}
})();
