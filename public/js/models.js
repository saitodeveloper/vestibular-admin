const LoginPostBody = joi.object({
    email: joi
        .string()
        .email({ tlds: { allow: false } })
        .required(),
    password: joi.string().min(6).max(20).required()
})

const validate = joiSchema => obj => {
    const { error } = joiSchema.validate(obj, {
        abortEarly: false
    })

    if (error)
        throw new Error(error.details.map(({ message }) => message).join('; '))
}

const validateLoginPostBody = validate(LoginPostBody)
