import Imd, { Document } from '../source/index'

describe('Basic Usage', () => {
    it('Creating and Obtain ONE document', () => {
        const Memory = new Imd()
        const document = Memory.create('Hello World! Its the first document of this test')

        const result = Memory.rescue(Number(document?._id))
        expect(result).toBeInstanceOf(Document<string>)
    })

    it('Creating and Obtain ONE document using Key', () => {
        const Memory = new Imd()
        Memory.create('Its a test with document Key', 'test-with-key')

        const result = Memory.rescue('test-with-key')
        expect(result).toBeInstanceOf(Document<string>)
    })

    it('Max documents limit', () => {
        expect(() => {
            const Memory = new Imd({
                maxDocuments: 20
            })

            Memory.bulkCreate('test&'.repeat(50).split('&').map((text, index) => {
                return {
                    key: String(index++),
                    content: text
                }
            }))
        }).toThrow()
    })
})

describe('Performance Tests', () => {
    it('Creating ONE milion of documents', () => {
        const Memory = new Imd()

        Memory.bulkCreate('Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch&'.repeat(999999).split('&'))

        expect(Memory.documents.length).toEqual(1000000)
    })
})