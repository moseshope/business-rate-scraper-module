const { chromium } = require("playwright");
const { storeDataInDynamoDB } = require("./utils/dataStorage");
const { storeQueryDataInStroage } = require("./utils/dataStorage");
const config = require("./config/aws-config");
const { workerData, parentPort } = require("worker_threads");
const { getScrapePlaceReviews } = require("./utils/scraper");

async function scrapePage(searchParams) {
  try {
    const businessData = await getScrapePlaceReviews(searchParams);

    await storeQueryDataInStroage(businessData);
  } catch (error) {
    console.error("Error during scraping and storing process:", error);
  }
}

async function main() 
{
  const searchParams = [
    {
      threadindex: 1,
      url: "https://www.google.com/maps/search/Accountant in Anchorage, AK?hl=en",
      data: {
        city: "Anchorage",
        category: "Accountant",
        us_state: "AK",
        count: 10,
      },
    },
    // {
    //   threadindex: 2,
    //   url: "https://www.google.com/maps/search/Accountant in Anchorage, AK?hl=en",
    //   data: {
    //     city: "Chandler",
    //     category: "nail salon",
    //     us_state: "AZ",
    //     count: 10,
    //   },
    // },
    // {
    //   threadindex: 3,
    //   url: "https://www.google.com/maps/search/Accountant in Anchorage, AK?hl=en",
    //   data: {
    //     city: "Phoenix",
    //     category: "hair salon",
    //     us_state: "AZ",
    //     count: 10,
    //   },
    // },
  ];

  await Promise.all(
    searchParams.map((param, index) => scrapePage(searchParams[index]))
  );
}

main();
