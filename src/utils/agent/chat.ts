import { HumanMessage } from "@langchain/core/messages"
import { createGraph } from "./graph"

export const getGraphResponse = async () => {

    const graph = await createGraph()

    const userQuestion = "how many urls are saved in the text file?"
    const chat_history = await graph.invoke({ messages: new HumanMessage(userQuestion) })
    const lastReponse = chat_history.messages[chat_history.messages.length - 1].content

    return lastReponse
}