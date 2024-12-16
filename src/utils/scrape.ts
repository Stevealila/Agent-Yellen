import path from "path"
import fs from "fs/promises"
import puppeteer from "puppeteer"

export const scrapeURLs = async () => {

    let browser
    try {
        if(!browser) { browser = await puppeteer.launch() }
        const page = await browser.newPage()
        await page.goto("https://www.fxstreet.com/news?q=USDCAD")
        await page.waitForSelector("h4.fxs_headline_tiny a")

        const d = new Date()
        const todayDate = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`

        const urls = await page.evaluate(todayDate => {
            const pDates = document.querySelectorAll<HTMLTimeElement>(".fxs_entry_metaInfo time")
            let matchingLinks: string[] = []
            Array.from(pDates).map(p => {
                const pDate = p.getAttribute("datetime")?.split("T")[0]
                if (pDate === todayDate) {
                    const link = p.parentElement?.previousElementSibling?.querySelector("a")?.href
                    matchingLinks.push(link as string)
                }
            })
            return matchingLinks
        }, todayDate)
        
        browser.close()
        browser.disconnect()
        
        // save
        const saveflPath = path.join(process.cwd(), "scrapedURLs.txt")
        await fs.writeFile(saveflPath, urls.join("\n"), 'utf-8')
        
        return urls
    } catch (error) {
        return error instanceof Error ? `ERROR: ${error.message}.` : "Error occured while attempting to scrape URLs."
    } finally {
        await browser?.close()
        await browser?.disconnect()
    }
}