import Emitter from 'eventemitter3'

import Document from '@/structures/Document'
import { ImdOptions } from '@/types/Options'
import { SearchByNumericIdentifier } from '@/utils/search'
import Server from '@/server/IO'
import Client from '@/server/Client'

class Imd extends Emitter {
    documents: Document<unknown>[] = []
    maxDocuments: number
    ttl: number

    constructor(Options?: ImdOptions) {
        super()

        this.ttl = !isNaN(Number(Options?.ttl))
            ? -1
            : Number(Options?.ttl) * 1000 || -1
        this.maxDocuments = isNaN(Number(Options?.maxDocuments))
            ? -1
            : Number(Options?.maxDocuments)
    }

    create<T>(
        content: T,
        key?: string,
        timestamp?: string
    ): Document<T> | undefined {
        if (
            this.maxDocuments !== -1 &&
            this.documents.length + 1 > this.maxDocuments
        ) {
            throw new Error('The documents limit has been reached!')
        }

        const document = new Document<T>(
            key || this.documents.length + 1,
            content,
            timestamp
        )

        this.emit('create', document)
        this.documents.push(document)

        if (this.ttl >= 1) {
            setTimeout(() => {
                this.remove(document._id)
            }, this.ttl)
        }

        return document
    }

    bulkCreate<T>(
        documents: { key?: string; content: T }[] | T[]
    ): Document<T>[] | undefined {
        console.warn(
            '---------- WARN: `bulkCreate()` METHOD IS AN EXPERIMENTAL FUNCTION ----------'
        )

        if (
            this.maxDocuments !== -1 &&
            this.documents.length + documents.length >= this.maxDocuments
        ) {
            throw new Error('The documents limit has been reached!')
        }

        const length = this.documents.length

        for (const documentData of documents) {
            const document =
                typeof documentData == 'object'
                    ? new Document<T>(
                          Object(documentData)?.key ||
                              Object(documentData)?._id ||
                              this.documents.length + 1,
                          Object(documentData)?.content
                      )
                    : new Document<T>(this.documents.length + 1, documentData)

            this.documents.push(document)
        }

        const docs = this.documents.slice(length)
        this.emit('create', docs)

        return docs
    }

    remove(identifier: number | string): boolean {
        const document = this.rescue(identifier)

        if (!document) {
            return false
        }

        this.emit('remove', document)
        this.documents = this.documents.filter((document) => {
            return document._id !== identifier
        })

        return true
    }

    rescue(identifier: number | string): Document<unknown> | undefined {
        if (!identifier && identifier !== 0) return undefined

        if (this.documents.length <= 0) {
            return undefined
        }

        if (!isNaN(Number(identifier))) {
            const resultOfSearch = SearchByNumericIdentifier(
                this.documents,
                Number(identifier)
            )
            return resultOfSearch == -1
                ? undefined
                : this.documents[resultOfSearch]
        }

        return this.documents.find((document) => document._id == identifier)
    }
}

export default Imd
export { Server, Client, Document }
