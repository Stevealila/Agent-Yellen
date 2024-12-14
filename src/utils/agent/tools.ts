import { tool } from "@langchain/core/tools"
import fs from "fs/promises"
import path from "path"

const checkFileStatus = async () => {
    /* Checks if the file containing scraped urls has updated urls i.e 
    1) the file is not empty, 
    2) has latest url links and if so, 
    3) number of urls found. */

    const filePath = path.join(process.cwd(), "scrapedUrls.txt")
    const stats = await fs.stat(filePath)

    if (!stats.size) return { isEmpty: true, isCurrent: "No", numLines: 0 }

    const fContents = await fs.readFile(filePath, 'utf-8')
    const fLines = fContents.split("\n").filter(line => line.trim() !== "")

    const d = new Date()
    const todayDate = `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, "0")}${(d.getDate() - 1).toString().padStart(2, "0")}`

    const isUptoDate = fLines.every(line => line.includes(todayDate))

    return { isEmpty: false, isCurrent: isUptoDate ? "Yes" : "No", numLines: fLines.length }
}

export const fileContentChecker = tool(
    checkFileStatus, 
    {
        name: "fileStatusChecker",
        description: `Call to know status of the file containing scraped fx news urls
        is not empty, has latest url links and if so, number of urls saved in it.`
    }
)

