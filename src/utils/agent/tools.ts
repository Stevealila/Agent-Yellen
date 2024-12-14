import { tool } from "@langchain/core/tools"
import { createRetrieverTool } from "langchain/tools/retriever"
import { createRetriever } from "./helpers/retriever"
import { checkFileStatus } from "./helpers/checkflStatus"

const retriever = await createRetriever()

export const scrapedURLContentReader = createRetrieverTool(retriever, {
    name: "urlContentReader",
    description:
        "Searches and returns news summary from links to blog posts of scraped fx urls.",
})

export const fileContentChecker = tool(
    checkFileStatus, 
    {
        name: "fileStatusChecker",
        description: "Checks if the file containing scraped urls has updated urls i.e the file is not empty, has latest url links and if so, number of urls found.",
    }
)
