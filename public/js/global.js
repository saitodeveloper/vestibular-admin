const errorHandler = (error, data) => {
    if (window.app.env === 'dev') {
        const { message, stack } = error
        const debugError = {
            message,
            stack,
            data
        }
        console.error(JSON.stringify(debugError, null, 2))
        throw error
    }
}

$(document).ready(() => {
    const publicPages = ['/login.html']
    const isLogged = getCookie('Authorization') !== ''
    const atPublicPage = publicPages.indexOf(window.location.pathname) !== -1

    if (!isLogged && !atPublicPage) window.location.href = publicPages[0]
})
