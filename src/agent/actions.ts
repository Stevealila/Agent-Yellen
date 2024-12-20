import { ChatGroq } from "@langchain/groq"
import { GraphState } from "./state"
import { tools } from "./tools"


export const shouldContinue = async (state: typeof GraphState.State) => {
    const { messages } = state
    const lastMessage = messages[messages.length - 1]

    if (lastMessage.additional_kwargs) {
        console.log("---CONTINUING TO TOOLS---")
        return "tools"
    }
    console.log("---ENDING WORKFLOW---")
    return "__end__"
}


export const agent = async (state: typeof GraphState.State): Promise<Partial<typeof GraphState.State>> => {
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
