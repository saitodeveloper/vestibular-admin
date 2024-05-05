/** Database schemas */
const BaseSchema = {
    createdAt: joi.date(),
    id: joi.number(),
    updatedAt: joi.date()
}

const OAuthSchema = {
    hash: joi.string(),
    userId: joi.number(),
    ...BaseSchema
}

const DeviceSchema = {
    type: joi.string().min(1).max(50),
    serial: joi.string(),
    ...BaseSchema
}

const IdentitySchema = {
    identity: joi.string().min(1).max(50),
    value: joi.string().valid('email'),
    ...BaseSchema
}

const UserSchema = {
    firstName: joi.string().min(1).max(50),
    lastName: joi.string().min(1).max(50),
    role: joi.string().min(1).max(50),
    ...BaseSchema
}

const QuestionSchema = {
    statement: joi.string().min(1),
    institution: joi.string().min(1).max(45),
    year: joi
        .number()
        .integer()
        .positive()
        .min(1940)
        .max(Number.MAX_SAFE_INTEGER),
    examName: joi.string().min(1).max(45),
    enum: joi.number().integer().positive().min(1).max(Number.MAX_SAFE_INTEGER),
    ...BaseSchema
}

const AlternativeSchema = {
    statement: joi.string().min(1),
    correct: joi.boolean(),
    questionId: joi
        .number()
        .integer()
        .positive()
        .min(1)
        .max(Number.MAX_SAFE_INTEGER),
    ...BaseSchema
}

const ActivitySchema = {
    correct: joi.boolean(),
    userId: joi
        .number()
        .integer()
        .positive()
        .min(1)
        .max(Number.MAX_SAFE_INTEGER),
    deviceId: joi
        .number()
        .integer()
        .positive()
        .min(1)
        .max(Number.MAX_SAFE_INTEGER),
    deviceSerial: joi.string().min(1).max(90),
    questionId: joi
        .number()
        .integer()
        .positive()
        .min(1)
        .max(Number.MAX_SAFE_INTEGER),
    alternativeId: joi
        .number()
        .integer()
        .positive()
        .min(1)
        .max(Number.MAX_SAFE_INTEGER),
    ...BaseSchema
}

const SubjectSchema = {
    name: joi.string().min(1).max(45),
    parent: joi.string().min(1).max(45),
    ...BaseSchema
}

/** Global objects */
const PaginateObject = {
    page: joi
        .number()
        .integer()
        .positive()
        .min(1)
        .max(Number.MAX_SAFE_INTEGER)
        .default(1),
    limit: joi.number().integer().positive().min(1).max(500).default(10)
}

const LoginPostBody = joi.object({
    email: joi
        .string()
        .email({ tlds: { allow: false } })
        .required(),
    password: joi.string().min(6).max(20).required()
})

const QuestionPostBody = joi.object({
    statement: QuestionSchema.statement.required(),
    institution: QuestionSchema.institution.required(),
    year: QuestionSchema.year.required(),
    examName: QuestionSchema.examName.required(),
    enum: QuestionSchema.enum.required(),
    alternatives: joi
        .array()
        .items(
            joi.object({
                correct: AlternativeSchema.correct.required(),
                statement: AlternativeSchema.statement.required()
            })
        )
        .required(),
    subjects: joi.array().items(SubjectSchema.id).max(40)
})

const validate = joiSchema => obj => {
    const { error } = joiSchema.validate(obj, {
        abortEarly: false
    })

    if (error)
        throw new Error(error.details.map(({ message }) => message).join('; '))
}

const validateLoginPostBody = validate(LoginPostBody)
