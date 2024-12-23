import { START, END, StateGraph } from "@langchain/langgraph"
import { ToolNode } from "@langchain/langgraph/prebuilt"
import { ChatGroq } from "@langchain/groq"
import { GraphState } from "./state"
import { createTools } from "./tools"


export const createGraph = async (currency: string ) => {

    // ................................import tools 
    
    const tools = await createTools(currency)
    const toolNode = new ToolNode<typeof GraphState.State>(tools)
    

    // ................................create actions
    
    const shouldContinue = async (state: typeof GraphState.State) => {
        const { messages } = state
        const lastMessage = messages[messages.length - 1]
        
        if (lastMessage.additional_kwargs) {
            console.log("---CONTINUING TO TOOLS---")
            return "tools"
        }
        console.log("---ENDING WORKFLOW---")
        return "__end__"
    }
    
    

    const agent = async (state: typeof GraphState.State): Promise<Partial<typeof GraphState.State>> => {
        console.log("---CONTACTING AGENT---")
        
        const { messages } = state
        
        const model = new ChatGroq({
            model: "gemma2-9b-it",
            temperature: 0,
            streaming: true,
        }).bindTools(tools)

        const response = await model.invoke(messages)
        return {
            messages: [response],
        }
    }
    


    // ................................build graph



    const graph = new StateGraph(GraphState)
        // nodes
        .addNode("agent", agent)
        .addNode("tools", toolNode)
        // edges
        .addEdge(START, "agent")
        .addConditionalEdges("agent", shouldContinue)
        .addEdge("tools", END)
        // compile
        .compile()

    return graph
}
