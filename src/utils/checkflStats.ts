import fs from "fs/promises"
import path from "path"

export const getflStats = async () => {

    const filePath = path.join(process.cwd(), "scrapedURLs.txt")
    
    try {
        // file exists?
        await fs.access(filePath)

        // if the file exists, does it have content?
        const stats = await fs.stat(filePath)
        if (!stats.size) return { fileExists: true, isEmpty: true, numURLs: 0, urls: [] }
        
        // if the file has content, tell me more.
        const fLines = await fs.readFile(filePath, "utf-8")
        const urls = fLines.split("\n").filter(line => line !== "")
        return { fileExists: true, isEmpty: false, numURLs: urls.length, urls }
     
    } catch {
        return { fileExists: false, isEmpty: true, numURLs: 0, urls: [] }
    }

}