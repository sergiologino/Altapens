'use client'

import Script from 'next/script'

const DEFAULT_ID = 108547150

function getCounterId(): number | null {
  if (process.env.NEXT_PUBLIC_YANDEX_METRIKA_DISABLED === 'true') {
    return null
  }
  const raw = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
  const n = raw ? Number(raw) : DEFAULT_ID
  return Number.isFinite(n) ? n : null
}

export function YandexMetrika() {
  const id = getCounterId()
  if (id === null) {
    return null
  }

  const inline = `(function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${id}', 'ym');

    ym(${id}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`

  return (
    <>
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: inline }}
      />
      <noscript>
        <div>
          {/* Счётчик Метрики: статический пиксель по документации Яндекса */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc.yandex.ru/watch/${id}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  )
}
