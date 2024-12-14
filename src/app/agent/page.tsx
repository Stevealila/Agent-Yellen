import { createGraph } from "@/utils/agent/graph"
import { HumanMessage } from "@langchain/core/messages"

const Agent = async () => {
      const graph = await createGraph()
  
      const userQuestion = "how many urls are saved in the text file?"
      // const userQuestion = "What is new about USDCAD today?"
      const chat_history = await graph.invoke({ messages: new HumanMessage(userQuestion) })
      const agentReponse = chat_history.messages[chat_history.messages.length - 1].content
      console.log("...............RESPONSE..................\n")
      console.log(agentReponse)
    
  return (
    <div>Agent</div>
  )
}

export default Agent