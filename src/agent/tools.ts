import { createRetrieverTool } from "langchain/tools/retriever"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { GraphState } from "./state"
import { tool } from "@langchain/core/tools"
import { checkAndScrapeURLs } from "@/utils/scrape"
import { retrieveDocuments } from "./retriever"

const urls = await checkAndScrapeURLs()
const retriever = await retrieveDocuments(urls)

const checkAndScrapeTool = tool(checkAndScrapeURLs, {
    name: "checkAndScrapeTool",
    description: "Check for existing URLs and automatically scrape new ones if needed."
})

const retrieveDocsTool = createRetrieverTool(retriever, {
    name: "retrieveDocsTool",
    description: "Retrieve documents stored in vector store."
})

export const tools = [checkAndScrapeTool, retrieveDocsTool]
export const toolNode = new ToolNode<typeof GraphState.State>(tools)