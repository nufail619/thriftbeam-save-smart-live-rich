// Injects analytics + ad provider scripts into <head> based on live settings.

import { useEffect } from "react";
import { useSettingsGroup } from "@/context/SettingsContext";

type AnalyticsSettings = {
  ga_id?: string;
  fb_pixel_id?: string;
  adsense_publisher_id?: string;
};

function injectOnce(id: string, factory: () => HTMLScriptElement | HTMLElement) {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const el = factory();
  el.id = id;
  document.head.appendChild(el);
}

export default function AnalyticsScripts() {
  const a = useSettingsGroup<AnalyticsSettings>("analytics");

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Google Analytics 4
    if (a.ga_id) {
      injectOnce("tb-ga-src", () => {
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${a.ga_id}`;
        return s;
      });
      injectOnce("tb-ga-init", () => {
        const s = document.createElement("script");
        s.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${a.ga_id}');`;
        return s;
      });
    }

    // Facebook Pixel
    if (a.fb_pixel_id) {
      injectOnce("tb-fb-pixel", () => {
        const s = document.createElement("script");
        s.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${a.fb_pixel_id}');fbq('track','PageView');`;
        return s;
      });
    }

    // Google AdSense
    if (a.adsense_publisher_id) {
      injectOnce("tb-adsense", () => {
        const s = document.createElement("script");
        s.async = true;
        s.crossOrigin = "anonymous";
        s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${a.adsense_publisher_id}`;
        return s;
      });
    }
  }, [a.ga_id, a.fb_pixel_id, a.adsense_publisher_id]);

  return null;
}
