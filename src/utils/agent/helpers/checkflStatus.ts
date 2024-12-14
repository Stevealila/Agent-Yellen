import fs from "fs/promises"
import path from "path"

export const checkFileStatus = async () => {
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