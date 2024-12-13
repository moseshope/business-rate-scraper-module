const {
  getEstimateByIdInDynamoDB,
  getBusinessByQueryIdInDynamoDB,
  storeQueryDataInStorage,
} = require("./utils/dataStorage");

const { getScrapePlaceReviews } = require("./utils/scraper");

const sleep = function (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

async function processEstimateId(estimateId) {
  try {
    // Get the estimate data from DynamoDB
    const estimate = await getEstimateByIdInDynamoDB(estimateId, "Estimate");
    if (!estimate) {
      console.error(`No estimate found for ID: ${estimateId}`);
      return null;
    }

    console.log(
      `Processing estimate ID ${estimateId} for ${estimate.category} in ${estimate.city}, ${estimate.state}`
    );

    if (estimate && estimate.pending < 67 && estimate.count >= 5) {
      const url = `https://www.google.com/maps/search/${estimate.category} in ${estimate.city}, ${estimate.state}?hl=en`;

      // Get existing businesses for this query
      const existingBusinesses = await getBusinessByQueryIdInDynamoDB(
        estimateId,
        "Business"
      );

      console.log(`Business Data: ${existingBusinesses}`);

      // Call scraper with the estimate data
      const results = await getScrapePlaceReviews({
        threadindex: estimateId,
        updateflag: true,
        updatelist: existingBusinesses || [],
        url: url,
        data: {
          id: estimateId,
          category: estimate.category,
          city: estimate.city,
          state: estimate.state,
          ...estimate,
        },
      });

      if (results.success) {
        // Store the scraped data in DynamoDB and S3
        await storeQueryDataInStorage(results, true);
        console.log(`Successfully processed estimate ${estimateId}`);
        return results;
      } else {
        console.log(`Failed to process estimate ${estimateId}`);
        return null;
      }
    } else {
      console.log(`Skipping estimate ${estimateId} - Does not meet criteria`);
      return null;
    }
  } catch (error) {
    console.error(`Error processing estimate ${estimateId}:`, error);
    throw error;
  }
}

async function main() {
  try {
    console.log("Starting scraper in container mode");

    // Get estimate IDs from environment variable
    let estimateIds;
    try {
      estimateIds = JSON.parse(process.env.QUERY_DATA || "[]");
      console.log(`Loaded ${estimateIds.length} estimate IDs from environment`);
    } catch (error) {
      console.error("Error parsing QUERY_DATA environment variable:", error);
      process.exit(1);
    }

    if (!estimateIds.length) {
      console.error("No estimate IDs found in QUERY_DATA environment variable");
      process.exit(1);
    }

    // Process each estimate ID sequentially
    for (const estimateId of estimateIds) {
      try {
        await processEstimateId(estimateId);
        // Add delay between queries to prevent rate limiting
        await sleep(12000);
      } catch (error) {
        console.error(`Error processing estimate ${estimateId}:`, error);
        // Continue with next estimate even if one fails
        continue;
      }
    }

    console.log("All estimates processed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Fatal error in main process:", error);
    process.exit(1);
  }
}

// Start the scraping process if this file is run directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}

main();
