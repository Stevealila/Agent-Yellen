import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"

export const retrieveDocuments = async (urls: string[]) => {
    console.log("---RETRIEVING DOCUMENTS---")
    const content = await Promise.all(urls.map(url => new CheerioWebBaseLoader(url).load()))
    const documents = content.flat()

    console.log("---SPLITTING DOCUMENTS---")
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 800, chunkOverlap: 200 })
    const docs = await splitter.splitDocuments(documents)

    console.log("---CREATING VECTOR STORE---")
    const db = await MemoryVectorStore.fromDocuments(
        docs,
        new GoogleGenerativeAIEmbeddings({ model: "models/embedding-001" })
    )

    console.log("---RETRIEVER CREATED---")
    return db.asRetriever()
}