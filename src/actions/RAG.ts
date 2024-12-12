import path from "path"
import fs from "fs/promises"
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { MemoryVectorStore } from "langchain/vectorstores/memory"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai"

export const retrieveDocumentsFromScrapedUrls = async () => {
    // read saved urls
    const urlsFilePath = path.join(process.cwd(), "scrapedUrls.txt")
    const urlTexts = await fs.readFile(urlsFilePath, 'utf-8')
    const urls = urlTexts.split("\n").filter(Boolean)

    // scrape content from each url
    const loadedDocs = await Promise.all(urls.map(url => new CheerioWebBaseLoader(url).load()))
    const docs = loadedDocs.flat()

    // split and 
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 })
    const docSplits = await splitter.splitDocuments(docs)

    // store content in a vector store
    const vectorStore = await MemoryVectorStore.fromDocuments(
        docSplits, // original text
        new GoogleGenerativeAIEmbeddings({ model: "models/embedding-001" }) // its embedding
    )
    const retriever = vectorStore.asRetriever({ searchType: "mmr", k: 1 })
    return retriever
}