import { tool } from "@langchain/core/tools"
import { createRetrieverTool } from "langchain/tools/retriever"
import { getflStats } from "./checkflStats"
import { retrieveDocuments } from "./retriever"
import { scrapeURLs } from "./scrape"
import { Annotation, MessagesAnnotation, StateGraph } from "@langchain/langgraph"
import { ChatGroq } from "@langchain/groq"
import { ToolNode } from "@langchain/langgraph/prebuilt"

export const createGraph = async () => {
    const { urls } = await getflStats()
    const retriever = await retrieveDocuments(urls)
    
    // create tools

    const getFileStatsTool = tool(getflStats, 
        {
            name: "getFileStatsTool",
            description: "Check status of file containing scraped urls."
        }
    )
    
    const scrapeURLsTool = tool(scrapeURLs, 
        {
            name: "scrapeURLsTool",
            description: "Scrape urls of today's fx news headlines."
        }
    )
    
    const retrieveDocsTool = createRetrieverTool(retriever, 
        {
            name: "retrieveDocsTool",
            description: "Retrieve documents stored in vector store."
        }
    )

    const tools = [getFileStatsTool, scrapeURLsTool, retrieveDocsTool]
    const llm = new ChatGroq({ model: "gemma2-9b-it" }).bindTools(tools)


    
    // create actions

    const GraphState = Annotation.Root({ ...MessagesAnnotation.spec })

    const callModel = async (state: typeof GraphState.State) => {
        const { messages } = state
        const response = await llm.invoke(messages)
        return { messages: [response] }
    }

    const shouldContinue = async (state: typeof GraphState.State) => {
        const { messages } = state
        const lastMessage = messages[messages.length-1]

        if (lastMessage.additional_kwargs) return "tools"
        return "__end__"
    }

    
    // create graph

    const toolNode = new ToolNode(tools)

    const graph = new StateGraph(GraphState)
            .addNode("agentYellen", callModel)
            .addNode("tools", toolNode)
            .addEdge("__start__", "agentYellen")
            .addConditionalEdges("agentYellen", shouldContinue)
            .compile()

    return graph
}