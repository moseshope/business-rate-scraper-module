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
    // Ensure estimateId is treated as a number
    const numericEstimateId = Number(estimateId);
    if (isNaN(numericEstimateId)) {
      console.error(`Invalid estimate ID: ${estimateId}`);
      return null;
    }

    // Get the estimate data from DynamoDB
    const estimate = await getEstimateByIdInDynamoDB(numericEstimateId, "Estimate");
    if (!estimate) {
      console.error(`No estimate found for ID: ${numericEstimateId}`);
      return null;
    }

    console.log(`Processing estimate ID ${numericEstimateId}:`);
    console.log(`- Category: ${estimate.category}`);
    console.log(`- Location: ${estimate.city}, ${estimate.state}`);
    console.log(`- Status: pending=${estimate.pending}, count=${estimate.count}`);

    if (estimate && estimate.pending < 67 && estimate.count >= 5) {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(estimate.category)} in ${encodeURIComponent(estimate.city)}, ${encodeURIComponent(estimate.state)}?hl=en`;

      // Get existing businesses for this query
      const existingBusinesses = await getBusinessByQueryIdInDynamoDB(
        numericEstimateId,
        "Business"
      );

      console.log(`Found ${existingBusinesses.length} existing businesses for estimate ${numericEstimateId}`);

      // Call scraper with the estimate data
      const results = await getScrapePlaceReviews({
        threadindex: numericEstimateId,
        updateflag: true,
        updatelist: existingBusinesses || [],
        url: url,
        data: {
          id: numericEstimateId,
          category: estimate.category,
          city: estimate.city,
          state: estimate.state,
          ...estimate,
        },
      });

      if (results.success) {
        // Store the scraped data in DynamoDB and S3
        await storeQueryDataInStorage(results, true);
        console.log(`Successfully processed estimate ${numericEstimateId}`);
        return results;
      } else {
        console.log(`Failed to process estimate ${numericEstimateId}`);
        return null;
      }
    } else {
      console.log(`Skipping estimate ${numericEstimateId} - Does not meet criteria (pending=${estimate.pending}, count=${estimate.count})`);
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

    // Get and validate QUERY_DATA environment variable
    const queryData = process.env.QUERY_DATA;
    if (!queryData) {
      console.error("QUERY_DATA environment variable is not set");
      process.exit(1);
    }

    console.log("Raw QUERY_DATA:", queryData);

    // Parse estimate IDs from environment variable
    let estimateIds;
    try {
      // Handle both string array and JSON string formats
      if (queryData.startsWith('[') && queryData.endsWith(']')) {
        estimateIds = JSON.parse(queryData);
      } else {
        // Try parsing as comma-separated string
        estimateIds = queryData.split(',').map(id => parseInt(id.trim(), 10));
      }

      // Filter out any invalid IDs
      estimateIds = estimateIds.filter(id => !isNaN(id) && id > 0);
      
      console.log(`Loaded ${estimateIds.length} valid estimate IDs from environment`);
      console.log("Estimate IDs:", estimateIds);
    } catch (error) {
      console.error("Error parsing QUERY_DATA environment variable:", error);
      console.error("QUERY_DATA content:", queryData);
      process.exit(1);
    }

    if (!estimateIds.length) {
      console.error("No valid estimate IDs found in QUERY_DATA environment variable");
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

module.exports = {
  processEstimateId,
  main
};