import { SHA256, enc } from 'crypto-js'

type ParsedSkinType = {
    [key: string]: {
        created: string
        id: string
        name: string
        skinImage: string
        slim: boolean
        textureId: string
        updated: string
    }
}

export async function generateSkinFile(skins: File[]) {
    let index = 1
    let customSkins: ParsedSkinType = {}
    const timestamp = new Date().toISOString()

    for (const skinFile of skins) {
        const name = skinFile.name.split('.')[0]
        const slim = name.split('_')[1] === 'slim' ? true : false
        const id = `skin_${index}`
        const skinImage = await fileToBase64(skinFile)
        const textureId = await fileToSHA256(skinFile)
        index += 1
        customSkins[id] = {
            created: timestamp,
            id,
            name,
            skinImage,
            slim,
            textureId,
            updated: timestamp,
        }
    }

    return {
        customSkins,
        version: 1,
    }
}

export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (e) => {
            return resolve(reader.result as string)
        }
        reader.onerror = function (err) {
            reject(err)
        }
    })
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer)
    const hexParts = []
    for (let i = 0; i < byteArray.length; i++) {
        const hex = byteArray[i].toString(16)
        const paddedHex = ('00' + hex).slice(-2)
        hexParts.push(paddedHex)
    }
    return hexParts.join('')
}

export async function fileToSHA256(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = (e) => {
            const hash = SHA256(arrayBufferToHex(reader.result as ArrayBuffer))
            return resolve(hash.toString())
        }
        reader.onerror = function (err) {
            return reject(err)
        }
    })
}

export function downloadFile(name: string, content: string) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    window.URL.revokeObjectURL(url)
}

export function generateRandomTextureId() {
    const str = Math.random().toString(36).substring(2)
    return SHA256(str).toString(enc.Hex)
}