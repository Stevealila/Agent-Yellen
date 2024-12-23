import { createRetrieverTool } from "langchain/tools/retriever"
import { tool } from "@langchain/core/tools"
import { checkAndScrapeURLs } from "@/utils/scrape"
import { retrieveDocuments } from "./retriever"

export const createTools = async (currency: string) => {

    const urls = await checkAndScrapeURLs(currency)
    const retriever = await retrieveDocuments(urls)
    
    const checkAndScrapeTool = tool(checkAndScrapeURLs, {
        name: "checkAndScrapeTool",
        description: "Check for existing URLs and automatically scrape new ones if needed."
    })
    
    const retrieveDocsTool = createRetrieverTool(retriever, {
        name: "retrieveDocsTool",
        description: "Retrieve documents stored in vector store."
    })

    const tools = [checkAndScrapeTool, retrieveDocsTool]

    return tools 
}