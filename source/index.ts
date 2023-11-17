import Emitter from 'eventemitter3'

import Document from './structures/Document'
import { ImdOptions } from './types/Options'
import { SearchByIdentifier } from './utils/search'

class Imd extends Emitter {
    documents: Document<unknown>[] = []
    maxDocuments: number

    constructor(Options?: ImdOptions) {
        super()
        this.maxDocuments = isNaN(Number(Options?.maxDocuments)) ? -1 : Number(Options?.maxDocuments)
    }

    create<T>(content: T, key?: string): Document<T> | undefined {
        if (this.maxDocuments !== -1 && (this.documents.length + 1) >= this.maxDocuments) {
            throw new Error('The documents limit has been reached!')
        }

        const document = new Document<T>((key || (this.documents.length + 1)), content)
        this.documents.push(document)

        return document
    }

    bulkCreate<T>(documents: { key?: string, content: T }[] | T[]): Document<T>[] | undefined {
        console.warn('WARN: `bulkCreate()` METHOD IS A EXPERIMENTAL FUNCTION')

        if (this.maxDocuments !== -1 && (this.documents.length + documents.length) >= this.maxDocuments) {
            throw new Error('The documents limit has been reached!')
        }

        const length = this.documents.length

        for (const documentData of documents) {
            const document = typeof documentData == 'object'
                ? new Document<T>(
                    Object(documentData)?.key || (this.documents.length + 1),
                    Object(documentData)?.content
                )
                : new Document<T>(
                    (this.documents.length + 1),
                    documentData
                )

            this.documents.push(document)
        }

        return this.documents.slice(length)
    }

    rescue(identifier: number | string): Document<unknown> | undefined {
        if (!identifier && identifier !== 0) return undefined

        if (this.documents.length <= 0) {
            return undefined
        }

        if (!isNaN(Number(identifier))) {
            const resultOfSearch = SearchByIdentifier(this.documents, Number(identifier))
            return (resultOfSearch == -1
                ? undefined
                : this.documents[resultOfSearch]
            )
        }

        return this.documents.find(document => document._id == identifier)
    }
}

export default Imd
export { Document }