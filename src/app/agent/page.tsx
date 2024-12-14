import { getGraphResponse } from "@/utils/agent/chat"

const Agent = async () => {
    const response = await getGraphResponse()
    console.log(response)
    
  return (
    <div>Agent</div>
  )
}

export default Agent