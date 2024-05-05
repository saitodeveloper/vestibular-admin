const ipv4Regex = /^(?!0\.0\.0\.0$)([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)$/

const findIp = async () => {
    try {
        const ips = (await getIPs()) || []
        const ipv4 =
            ips.map(ip => ip.trim()).find(ip => ipv4Regex.test(ip)) || 'unknown'
        const ipv6 =
            ips.map(ip => ip.trim()).find(ip => ip.indexOf(':') !== -1) ||
            'unknown'

        return { ipv4, ipv6 }
    } catch (error) {
        errorHandler(error)
        return { ipv4: 'unkown', ipv6: 'unkown' }
    }
}

const pluginsList = async () => {
    const { ipv4, ipv6 } = await findIp()
    const { width, height, colorDepth } = screen
    const { hardwareConcurrency, platform } = navigator

    return [
        width,
        height,
        colorDepth,
        hardwareConcurrency,
        platform || 'unkown',
        ipv4,
        ipv6
    ].join('|')
}

const getDeviceSerial = async () => {
    let serial = getCookie('serial') || ''
    if (serial) return serial

    const combinedFingerprint = await pluginsList()
    const cookieOptions = {
        expires: moment().add(1, 'day').utc().toString(),
        SameSite: 'Lax'
    }

    if (window.app.env !== 'dev') cookieOptions.Secure = true

    serial = CryptoJS.SHA256(combinedFingerprint).toString()
    setCookie('serial', serial, cookieOptions)

    return serial
}

const generateDeviceCookie = async () => {
    const optResponse = await authOtp()
    const [key, otp, iv] = optResponse.otp.split(':')
    const ivEncUtf8 = CryptoJS.enc.Utf8.parse(iv)
    const keyEncUtf8 = CryptoJS.enc.Utf8.parse(otp)
    const serial = await getDeviceSerial()
    const type = navigator.userAgent
    const device = JSON.stringify({ serial, type })
    const cookieOptions = {
        expires: moment().add(10, 'seconds').utc().toString(),
        SameSite: 'Lax'
    }

    if (window.app.env !== 'dev') cookieOptions.Secure = true

    const encryptedDevice = CryptoJS.AES.encrypt(device, keyEncUtf8, {
        iv: ivEncUtf8,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString()

    setCookie('Device', encryptedDevice, cookieOptions)
    setCookie('OtpKey', key, cookieOptions)
}
