const formQuestion = $('[data-form-question]')
const buttonSubmit = $('[data-button-submit]')
const institutionInput = $('[data-input-institution]')
const examNameInput = $('[data-input-exam-name]')
const enumInput = $('[data-input-enum]')
const tagsContainer = $('[data-tags-container]')
const sujestionListContainer = $('[data-sujestion-list-container]')
const inputSubjectSearch = $('[data-input-subject-search]')
const yearInput = $('[data-input-year]')

const alternativeAInput = $('[data-input-a]')
const alternativeBInput = $('[data-input-b]')
const alternatvieCInput = $('[data-input-c]')
const alternatvieDInput = $('[data-input-d]')
const alternatvieEInput = $('[data-input-e]')

const alternativeAInputCheckbox = $('[data-input-a-checkbox]')
const alternativeBInputCheckbox = $('[data-input-b-checkbox]')
const alternatvieCInputCheckbox = $('[data-input-c-checkbox]')
const alternatvieDInputCheckbox = $('[data-input-d-checkbox]')
const alternatvieEInputCheckbox = $('[data-input-e-checkbox]')

const canvas = document.createElement('canvas')

const selectedSubjects = []

class SimpleImage {
    constructor({ data, api }) {
        this.api = api
        this.data = {
            url: data.url || '',
            caption: data.caption || '',
            withBorder: data.withBorder !== undefined ? data.withBorder : false,
            withBackground:
                data.withBackground !== undefined ? data.withBackground : false,
            stretched: data.stretched !== undefined ? data.stretched : false
        }

        this.wrapper = undefined
        this.settings = [
            {
                name: 'withBorder',
                icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
            }
            // Add other settings as needed
        ]
    }

    static get toolbox() {
        return {
            title: 'Image',
            icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>'
        }
    }

    render() {
        this.wrapper = document.createElement('div')
        this.wrapper.style = 'width: 100%; overflow: hidden;'
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.style = 'display:none'
        input.onchange = event => this.onSelectFile(event)

        this.wrapper.appendChild(input)

        if (this.data && this.data.url) {
            this._createImage(this.data.url, this.data.caption)
        }
        input.click()
        return this.wrapper
    }

    _createImage(url, captionText) {
        this.wrapper.innerHTML = '' // Clear the wrapper

        const image = document.createElement('img')
        image.style = 'width:100%'
        image.src = url
        this.wrapper.appendChild(image)

        if (captionText) {
            const caption = document.createElement('div')
            caption.contentEditable = true
            caption.innerHTML = captionText
            this.wrapper.appendChild(caption)
        }
    }

    onSelectFile(event) {
        const file = event.target.files[0]
        if (!file) {
            this.wrapper.remove()
            return
        }

        // Convert file to base64 string
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            this._createImage(reader.result, '')
            this.data.url = reader.result // Save base64 image string to block data
        }
        reader.onerror = error => {
            this.wrapper.remove()
            console.log('Error: ', error)
        }
    }

    save() {
        return this.data
    }
}

const editor = new EditorJS({
    autofocus: true,
    holder: 'editorjs',
    tools: {
        image: SimpleImage,
        paragraph: {
            config: {
                preserveBlank: true
            }
        }
    }
})

const onFormSubmit = event => {
    event.preventDefault()
}

const onPromiseOnImageLoad = (image, questionId, indexNumber) =>
    new Promise((resolve, _reject) => {
        const imgClass = new Image()
        imgClass.onload = function () {
            canvas.width = imgClass.width
            canvas.height = imgClass.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(imgClass, 0, 0)
            canvas.toBlob(async function (blob) {
                const file = new File([blob], 'filename.webp', {
                    lastModified: new Date().getTime(),
                    type: blob.type
                })
                const formData = new FormData()
                formData.append('file', file, 'filename.webp')
                const url = await uploadQuestionImage(formData, {
                    questionId,
                    indexNumber
                })
                resolve(url)
            }, 'image/webp')
        }
        imgClass.src = image
    })

const onButtonSubmit = async () => {
    try {
        const result = await editor.save()
        const statement = result.blocks.reduce((acc, block, index) => {
            if (block.data.url) return (acc += `{{img_${index}}}\n`)
            return (acc += `${block.data.text}\n`)
        }, '')

        const alternatives = [
            {
                statement: alternativeAInput.val(),
                correct: alternativeAInputCheckbox.is(':checked')
            },
            {
                statement: alternativeBInput.val(),
                correct: alternativeBInputCheckbox.is(':checked')
            },
            {
                statement: alternatvieCInput.val(),
                correct: alternatvieCInputCheckbox.is(':checked')
            },
            {
                statement: alternatvieDInput.val(),
                correct: alternatvieDInputCheckbox.is(':checked')
            },
            {
                statement: alternatvieEInput.val(),
                correct: alternatvieEInputCheckbox.is(':checked')
            }
        ].filter(item => item.statement.trim() !== '')

        const requestBody = {
            institution: institutionInput.val(),
            year: yearInput.val(),
            examName: examNameInput.val(),
            enum: enumInput.val(),
            alternatives,
            subjects: selectedSubjects.map(item => item.id),
            statement
        }

        const questionObject = await insertQuestion(requestBody)
        console.log(questionObject)
        const images = result.blocks
            .filter(block => block.data.url)
            .map(block => block.data.url)
        for (let [index, image] of Object.entries(images)) {
            await onPromiseOnImageLoad(image, questionObject.id, index)
        }
    } catch (error) {
        errorHandler(error)
    }
}

const updateTagContainer = () => {
    tagsContainer.html('')
    const html = selectedSubjects.map(
        item =>
            `<p data-sujestion-item="${item.id}" class="tag">${
                item.parent ? `${item.parent}:` : ''
            } ${item.name} <span>&#x2715;</span></p>`
    )
    tagsContainer.html(html)

    selectedSubjects.map(item =>
        $(`[data-sujestion-item="${item.id}"] span`).click(() => {
            const index = selectedSubjects.findIndex(
                itemAdded => itemAdded.id === item.id
            )
            selectedSubjects.splice(index, 1)
            updateTagContainer()
        })
    )
}

const onSubjectSearchKeyUp = async event => {
    const name = event.currentTarget.value

    if (name.length > 3) {
        const response = await searchSubject({ name })
        console.log(response?.results)
        const html =
            response?.results?.map(
                item =>
                    `<p data-sujestion-item="${item.id}" class="item">${
                        item.parent ? `${item.parent}:` : ''
                    } ${item.name}</p>`
            ) ?? ''

        sujestionListContainer.html(html)
        response?.results?.map(item =>
            $(`[data-sujestion-item="${item.id}"]`).click(() => {
                const alreadyInserted = selectedSubjects.some(
                    itemAdded => itemAdded.id === item.id
                )
                if (!alreadyInserted) {
                    selectedSubjects.push(item)
                    inputSubjectSearch.val('')
                    sujestionListContainer.html('')
                    updateTagContainer()
                }
            })
        )
    }
}

$(document).ready(() => {
    formQuestion.submit(onFormSubmit)
    buttonSubmit.click(onButtonSubmit)
    inputSubjectSearch.on('keyup', onSubjectSearchKeyUp)
})
