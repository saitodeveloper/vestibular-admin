const formLogin = $('[data-form-login]')
const buttonSubmit = $('[data-button-submit]')
const emailInput = $('[data-input-email]')
const passwordInput = $('[data-input-password]')
const cookieOptions = {
    expires: moment().add(1, 'hour').utc().toString(),
    SameSite: 'Lax'
}

const onFormSubmit = event => {
    event.preventDefault()
}

const onButtonSubmit = async () => {
    try {
        const email = emailInput.val()
        const password = passwordInput.val()
        const loginPostBody = { email, password }

        validateLoginPostBody(loginPostBody)

        await generateDeviceCookie()
        const { authToken, refreshToken } = await authLogin(loginPostBody)

        setCookie('Authorization', `Bearer ${authToken}`, cookieOptions)
        window.localStorage.setItem('refreshToken', refreshToken)

        window.location.href = '/'
    } catch (error) {
        errorHandler(error)
    }
}

$(document).ready(() => {
    formLogin.submit(onFormSubmit)
    buttonSubmit.click(onButtonSubmit)
})
