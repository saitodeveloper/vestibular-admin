const formQuestion = $('[data-form-question]')
const buttonSubmit = $('[data-button-submit]')
const canvas = document.createElement('canvas')

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
        image: SimpleImage
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
                await uploadQuestionImage(formData, { questionId, indexNumber })
                resolve()
            }, 'image/webp')
        }
        imgClass.src = image
    })

const onButtonSubmit = async () => {
    try {
        const result = await editor.save()
        const images = result.blocks
            .filter(block => block.data.url)
            .map(block => block.data.url)
        for (let [index, image] of Object.entries(images)) {
            await onPromiseOnImageLoad(image, index, 1)
        }
    } catch (error) {
        errorHandler(error)
    }
}

$(document).ready(() => {
    formQuestion.submit(onFormSubmit)
    buttonSubmit.click(onButtonSubmit)
})
