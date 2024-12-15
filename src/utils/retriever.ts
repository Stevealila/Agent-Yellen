import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"

export const retrieveDocuments = async (urls: string[]) => {
    // scrape url content
    const content = await Promise.all(urls.map(url => new CheerioWebBaseLoader(url).load()))
    const documents = content.flat()

    // split
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 800, chunkOverlap: 200 })
    const docs = await splitter.splitDocuments(documents)

    // store
    const db = await MemoryVectorStore.fromDocuments(
        docs,
        new GoogleGenerativeAIEmbeddings({ model: "models/embedding-001" })
    )

    // return retriever
    return db.asRetriever()
}