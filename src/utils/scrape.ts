import fs from "fs/promises"
import path from "path"
import puppeteer from "puppeteer"


const getTodayDate = () => {
    const d = new Date()
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}


export const checkAndScrapeURLs = async (currency: string): Promise<string[]> => {
    console.log("---CHECK EXISTING URLS---")
    const todayDate = getTodayDate()
    const filePath = path.join(process.cwd(), `scrapedURLs/${currency}_${todayDate}.txt`)

    try {
        // Check if file exists and has content
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false)
        if (!fileExists) {
            console.log("---NO URL FILE FOUND - SCRAPING NEW URLS---")
            return await scrapeURLs(currency)
        }

        const stats = await fs.stat(filePath)
        if (!stats.size) {
            console.log("---EMPTY URL FILE - SCRAPING NEW URLS---")
            return await scrapeURLs(currency)
        }

        // Check if URLs are from today
        const fLines = await fs.readFile(filePath, "utf-8")
        const urls = fLines.split("\n").filter(line => line !== "")

        console.log("Checking URLs against date:", todayDate)
        const hasCurrentUrls = urls.some(url => url.includes(todayDate))

        if (!hasCurrentUrls) {
            console.log("---URLS OUTDATED - SCRAPING NEW URLS---")
            return await scrapeURLs(currency)
        }

        console.log("---USING EXISTING URLS---")
        console.log(`Found ${urls.length} URLs from today`)
        return urls
    } catch {
        console.log("---ERROR CHECKING URLS - SCRAPING NEW URLS---")
        return await scrapeURLs(currency)
    }
}



const scrapeURLs = async (currency: string): Promise<string[]> => {
    console.log("---SCRAPING NEWS URLS---")
    let browser
    try {
        browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(`https://www.fxstreet.com/news?q=${currency}`)
        await page.waitForSelector("h4.fxs_headline_tiny a")

        const todayDate = getTodayDate()
        console.log("Scraping URLs for date:", todayDate)

        const urls = await page.evaluate((todayDate) => {
            const pDates = document.querySelectorAll<HTMLTimeElement>(".fxs_entry_metaInfo time")
            let matchingLinks: string[] = []
            Array.from(pDates).map(p => {
                const pDate = p.getAttribute("datetime")?.split("T")[0].replace(/-/g, "")
                if (pDate === todayDate) {
                    const link = p.parentElement?.previousElementSibling?.querySelector("a")?.href
                    if (link) matchingLinks.push(link)
                }
            })
            return matchingLinks
        }, todayDate)

        // Save new URLs
        const saveflPath = path.join(process.cwd(), `scrapedURLs/${currency}_${todayDate}.txt`)
        await fs.writeFile(saveflPath, urls.join("\n"), 'utf-8')
        console.log(`---SCRAPING COMPLETED - ${urls.length} URLS SAVED---`)

        return urls
    } catch (error) {
        console.log("---SCRAPING ERROR---")
        console.error(error)
        return []
    } finally {
        await browser?.close()
        await browser?.disconnect()
    }
}