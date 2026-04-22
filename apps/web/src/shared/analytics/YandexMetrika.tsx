import { useEffect } from 'react'

const DEFAULT_ID = 108547150

function getCounterId(): number | null {
  if (import.meta.env.VITE_YANDEX_METRIKA_DISABLED === 'true') {
    return null
  }
  const raw = import.meta.env.VITE_YANDEX_METRIKA_ID
  const n = raw ? Number(raw) : DEFAULT_ID
  return Number.isFinite(n) ? n : null
}

export function YandexMetrika() {
  const id = getCounterId()

  useEffect(() => {
    if (id === null) {
      return
    }
    if (document.querySelector(`script[data-ym-counter="${id}"]`)) {
      return
    }

    const inline = `(function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${id}', 'ym');

    ym(${id}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`

    const el = document.createElement('script')
    el.type = 'text/javascript'
    el.setAttribute('data-ym-counter', String(id))
    el.appendChild(document.createTextNode(inline))
    document.body.appendChild(el)
  }, [id])

  if (id === null) {
    return null
  }

  return (
    <noscript>
      <div>
        <img
          src={`https://mc.yandex.ru/watch/${id}`}
          style={{ position: 'absolute', left: '-9999px' }}
          alt=""
        />
      </div>
    </noscript>
  )
}
