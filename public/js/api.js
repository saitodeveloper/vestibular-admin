const url = window.apiUrl
const defaultOptions = {
    credentials: 'include',
    headers: {
        'Access-Control-Allow-Origin': window.apiUrl,
        'Content-Type': 'application/json'
    }
}

/**
 * Initiates a request to a specified path with
 * optional query parameters and fetch options.
 * @param {string} path The path to the API endpoint.
 * @param {Object.<string, [string|number|boolean]>} [query] An object representing query parameters to be appended to the URL.
 * @param {RequestInit} [options=defaultOptions] An options object containing any custom settings that you want to apply to the request.
 * @returns {Promise<any>} The JSON from the response body.
 */
async function request(path, query, options) {
    try {
        const queryString =
            query && Object.keys(query).length > 0
                ? `?${new URLSearchParams(query).toString()}`
                : ''
        const response = await fetch(`${url}${path}${queryString}`, options)

        if (!response.ok) throw new Error(await response.text())

        return await response.json()
    } catch (error) {
        errorHandler(error, { path, query, options })
        return {}
    }
}
/**
 * Request GET to the API
 * @param {string} path The path to the API endpoint.
 * @param {Object.<string, [string|number|boolean]>} [query] An object representing query parameters to be appended to the URL.
 * @returns {Promise<any>} The JSON from the response body.
 */
const requestGet = (path, query) => request(path, query, defaultOptions)

/**
 * Request POST to the API
 * @param {string} path The path to the API endpoint.
 * @param {Object.<string, [string|number|boolean]>} [body] An object representing body to send in the request.
 * @param {Object.<string, [string|number|boolean]>} [query] An object representing query parameters to be appended to the URL.
 * @returns {Promise<any>} The JSON from the response body.
 */
const requestPost = (path, body, query, options = defaultOptions) =>
    request(path, query, {
        method: 'POST',
        ...options,
        body: JSON.stringify(body)
    })

const requestPut = (path, body, query, options = defaultOptions) =>
    request(path, query, {
        method: 'PUT',
        ...options,
        body: body instanceof FormData ? body : JSON.stringify(body)
    })

/** API Routes */
const authLogin = body => requestPost('/v1/auth/login', body)
const authOtp = () => requestGet('/v1/auth/otp')
const uploadQuestionImage = (file, query) => {
    const options = structuredClone(defaultOptions)
    delete options.headers['Content-Type']

    return requestPut('/v1/media/upload/question/image', file, query, options)
}
