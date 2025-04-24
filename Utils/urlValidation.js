export function isValidImageUrl(val) {
    const absoluteUrl = /^((https?:\/\/)|www\.)[a-zA-Z0-9\/\-_]{3,192}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?([\w\/\-_?=:;,]+)?(\.(webp|png|jpeg|jpg|gif))?$|^(\/[\w\-.\/]{3,192})$/
    const relativePath = /^(\/[\w\-.\/]{3,192})$/
    const dataImage = /^(data:image\/(webp|png|jpeg|jpg|gif);base64,[a-zA-Z0-9+\/=]+)$/

    return absoluteUrl.test(val) || relativePath.test(val) || dataImage.test(val)
}

export default isValidImageUrl