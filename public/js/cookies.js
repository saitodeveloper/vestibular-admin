function cookieToObject() {
    const decodedCookie = decodeURIComponent(document.cookie)
    const object = decodedCookie.split(';').reduce((item, result) => {
        const parts = result.split('=')
        const key = parts[0].trim()
        const value = parts[1]

        if (key && value) return { [key]: value, ...item }
        return item
    }, {})

    return object
}

function getCookie(key) {
    const cookieJar = cookieToObject()
    return cookieJar[key] ?? ''
}

function setCookie(key, value, options = {}) {
    if (!key && !value) return

    const cookiesOption = Object.entries(options)
        .map(([optionKey, optionValue]) => {
            if (optionValue !== '') return `${optionKey.trim()}=${optionValue}`
            else return `${optionKey.trim()}`
        })
        .join(';')
    const cookieArray = [`${key.trim()}=${value}`]

    if (cookiesOption) cookieArray.push(cookiesOption)

    document.cookie = cookieArray.join(';')
}

function deleteCookie(key) {
    setCookie(key, '', { expires: 0 })
}
