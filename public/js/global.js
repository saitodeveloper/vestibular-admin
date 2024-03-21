$(document).ready(() => {
    const publicPages = ['/login.html']
    const isLogged = getCookie('token') !== ''
    const atPublicPage = publicPages.indexOf(window.location.pathname) !== -1

    if (!isLogged && !atPublicPage) window.location.href = publicPages[0]
})
