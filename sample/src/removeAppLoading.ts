export function removeAppLoading() {
  const el = document.getElementById('app-loading')
  if (!el) return

  el.classList.add('app-loading--hide')

  const cleanup = () => el.remove()
  el.addEventListener('transitionend', cleanup, { once: true })
  window.setTimeout(cleanup, 500)
}
