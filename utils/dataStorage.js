const AWS = require("aws-sdk");
require("dotenv").config();

// Load AWS credentials from environment variables
AWS.config.update({
  region: "us-west-1",
  accessKeyId: process.env.REAL_ACCESS_KEY_ID,
  secretAccessKey: process.env.REAL_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

async function storeDataInDynamoDB(data, tableName) {
  const promises = data.map((item) => {
    // Convert id to number if it's a string and can be parsed as a number
    if (item.id && typeof item.id === "string") {
      const numId = parseInt(item.id.replace(/\D/g, ""), 10);
      if (!isNaN(numId)) {
        item.id = numId;
      }
    }
    const params = { TableName: tableName, Item: item };
    return dynamoDB.put(params).promise();
  });
  return Promise.all(promises);
}

async function updateItemsFieldsInDynamoDB(items, tableName) {
  const promises = items.map((item) => {
    const { id, ...fieldsToUpdate } = item;
    // Convert id to number if it's a string
    const numId =
      typeof id === "string" ? parseInt(id.replace(/\D/g, ""), 10) : id;

    const updateExpressionParts = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(fieldsToUpdate).forEach((field, index) => {
      const attributeName = `#field${index}`;
      const attributeValue = `:value${index}`;
      updateExpressionParts.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = field;
      expressionAttributeValues[attributeValue] = fieldsToUpdate[field];
    });

    const updateExpression = `set ${updateExpressionParts.join(", ")}`;

    const params = {
      TableName: tableName,
      Key: { id: numId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };

    return dynamoDB.update(params).promise();
  });
  return Promise.all(promises);
}

async function updateFieldsInDynamoDB(item, tableName) {
  const { id, ...fieldsToUpdate } = item;
  // Convert id to number if it's a string
  const numId =
    typeof id === "string" ? parseInt(id.replace(/\D/g, ""), 10) : id;

  const updateExpressionParts = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(fieldsToUpdate).forEach((field, index) => {
    const attributeName = `#field${index}`;
    const attributeValue = `:value${index}`;
    updateExpressionParts.push(`${attributeName} = ${attributeValue}`);
    expressionAttributeNames[attributeName] = field;
    expressionAttributeValues[attributeValue] = fieldsToUpdate[field];
  });

  const updateExpression = `set ${updateExpressionParts.join(", ")}`;

  const params = {
    TableName: tableName,
    Key: { id: numId },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
  };

  return await dynamoDB.update(params).promise();
}

async function deleteReviewsByBusinessIdInDynamoDB(b_id, tableName) {
  const itemsToDelete = await getReviewsByBusinessIdInDynamoDB(b_id, tableName);

  const promises = itemsToDelete.map((item) => {
    const params = {
      TableName: tableName,
      Key: {
        id:
          typeof item.id === "string"
            ? parseInt(item.id.replace(/\D/g, ""), 10)
            : item.id,
      },
    };

    return dynamoDB.delete(params).promise();
  });

  return Promise.all(promises);
}

async function deleteBusinessByIdInDynamoDB(b_id, tableName) {
  const params = {
    TableName: tableName,
    Key: {
      id:
        typeof b_id === "string" ? parseInt(b_id.replace(/\D/g, ""), 10) : b_id,
    },
  };

  return await dynamoDB.delete(params).promise();
}

async function getBusinessByQueryIdInDynamoDB(query_id, tableName) {
  const items = [];
  let params = {
    TableName: tableName,
    FilterExpression: "query_id = :query_id",
    ExpressionAttributeValues: {
      ":query_id": query_id,
    },
  };

  let data;
  do {
    data = await dynamoDB.scan(params).promise();
    items.push(...data.Items);
    params.ExclusiveStartKey = data.LastEvaluatedKey;
  } while (typeof data.LastEvaluatedKey !== "undefined");

  return items;
}

async function getBusinessByBCodeInDynamoDB(bcode, tableName) {
  const items = [];
  let params = {
    TableName: tableName,
    FilterExpression: "bcode = :bcode",
    ExpressionAttributeValues: {
      ":bcode": bcode,
    },
  };

  let data;
  do {
    data = await dynamoDB.scan(params).promise();
    items.push(...data.Items);
    params.ExclusiveStartKey = data.LastEvaluatedKey;
  } while (typeof data.LastEvaluatedKey !== "undefined");

  return items;
}

async function getReviewsByBusinessIdInDynamoDB(business_id, tableName) {
  const items = [];
  let params = {
    TableName: tableName,
    FilterExpression: "business_id = :business_id",
    ExpressionAttributeValues: {
      ":business_id": business_id,
    },
  };

  let data;
  do {
    data = await dynamoDB.scan(params).promise();
    items.push(...data.Items);
    params.ExclusiveStartKey = data.LastEvaluatedKey;
  } while (typeof data.LastEvaluatedKey !== "undefined");

  return items;
}

async function getEstimateByIdInDynamoDB(query_id, tableName) {
  const numId =
    typeof query_id === "string"
      ? parseInt(query_id.replace(/\D/g, ""), 10)
      : query_id;
  const params = {
    TableName: tableName,
    Key: { id: numId },
  };

  try {
    const data = await dynamoDB.get(params).promise();
    return data.Item;
  } catch (err) {
    console.error(
      "Unable to get estimate. Error:",
      JSON.stringify(err, null, 2)
    );
    throw err;
  }
}

async function storeDataInS3(bucketName, key, data) {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: JSON.stringify(data),
    ContentType: "application/json",
  };
  await s3.putObject(params).promise();
}

async function storeQueryDataInStorage(results, updateflag = false) {
  try {
    console.log("Processing query results for storage");

    // Get existing businesses from DynamoDB
    const existingBusinesses = await getBusinessByQueryIdInDynamoDB(
      results.threadindex,
      "Business"
    );
    console.log(`Found ${existingBusinesses.length} existing businesses`);

    let placelist = [];
    let google_idlist = [];
    let searchplacelist = [];
    let metrics = {
      G_reviews_count_max: 0,
      G_reviews_rating_max: 0,
      G_90day_reviews_rating_max: 0,
      G_90day_reviews_count_max: 0,
      B_reviews_average: {},
      B_reviews_count: {},
      B_90_reviews_average: {},
      B_90_reviews_count: {},
    };

    // Process each place in the results
    for (const result of results.data) {
      const placeInfo = result.placeInfo;
      const businessId = parseInt(result.cid.replace(/\D/g, ""), 10); // Convert to number
      const scraapingtime = "2024_07";

      // Store raw data in S3
      await storeDataInS3(
        "scraped-data-bucket-1",
        `businesses/${placeInfo.city}/${placeInfo.type}/${businessId}_${scraapingtime}.json`,
        result
      );

      // Skip if we've already processed this business
      if (google_idlist.includes(businessId)) continue;
      google_idlist.push(businessId);

      // Prepare business data for DynamoDB
      const businessData = {
        id: businessId,
        query_id: results.threadindex,
        google_link: placeInfo.google_link,
        place_info: JSON.stringify({
          logo: placeInfo.place_img || "",
          site: placeInfo.site_url || "",
          phone: placeInfo.phone || "",
          name: placeInfo.title || "",
          location_link: result.location_link || "",
          street: placeInfo.street || "",
          postal_code: placeInfo.postal_code
            ? placeInfo.postal_code.substring(0, 5)
            : "",
          country: placeInfo.country || "",
          full_address: placeInfo.address || "",
        }),
        score_data: JSON.stringify({
          rank: 0,
          br_score: 0,
          rating: placeInfo.rating || 0,
          review_num: placeInfo.reviews ? parseInt(placeInfo.reviews) : 0,
        }),
        city: placeInfo.city || "",
        type: placeInfo.type || "",
        us_state: placeInfo.us_state || "",
        bcode: "a",
        timestamp: new Date().toISOString(),
      };

      console.log("!!!!!!!!!!!!!!!!!!!!!! Test1 !!!!!!!!!!!!!!!!!!!!!!!!!!");

      // Store business data in DynamoDB
      await storeDataInDynamoDB([businessData], "Business");

      console.log("!!!!!!!!!!!!!!!!!!!!!! Test2 !!!!!!!!!!!!!!!!!!!!!!!!!!");

      // Process reviews
      const reviews = result.reviews
        .sort(
          (a, b) =>
            new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        )
        .slice(0, 100);

      const reviewsForDynamoDB = reviews.map((review, index) => ({
        id: parseInt(`${businessId}${index}`, 10), // Generate numeric ID
        business_id: businessId,
        author_id: review.user.link?.split("/")[5] || "",
        author_image: review.user.thumbnail || "",
        author_link: review.user.link || "",
        author_title: review.user.name || "",
        review_rating: review.rating || 0,
        review_text: review.snippet || "",
        review_timestamp: review.date ? new Date(review.date).getTime() : 0,
        review_img_url: review.images?.[0]?.thumbnail || "",
        owner_answer: review.owner_answer || "",
        timestamp: new Date().toISOString(),
      }));

      // Store reviews in DynamoDB
      if (reviewsForDynamoDB.length > 0) {
        await storeDataInDynamoDB(reviewsForDynamoDB, "Review");
      }

      // Calculate metrics
      calculateMetrics(reviews, businessId, metrics);
    }

    // Update business scores and rankings
    await updateBusinessScores(results.threadindex, metrics);

    console.log("Successfully stored all data");
    return true;
  } catch (error) {
    console.error("Error in storeQueryDataInStorage:", error);
    throw error;
  }
}

function calculateMetrics(reviews, businessId, metrics) {
  let daycount = 0,
    daysum = 0,
    totalsum = 0;
  const ninetyDaysAgo = new Date(2024, 3, 1).getTime();

  reviews.forEach((review) => {
    const rating = review.rating || 0;
    const timestamp = review.date ? new Date(review.date).getTime() : 0;

    totalsum += rating;

    if (timestamp >= ninetyDaysAgo) {
      daycount++;
      daysum += rating;
    }
  });

  metrics.B_reviews_count[businessId] = reviews.length;
  metrics.B_reviews_average[businessId] = reviews.length
    ? totalsum / reviews.length
    : 0;
  metrics.B_90_reviews_count[businessId] = daycount;
  metrics.B_90_reviews_average[businessId] = daycount ? daysum / daycount : 0;

  // Update max values
  metrics.G_reviews_count_max = Math.max(
    metrics.G_reviews_count_max,
    reviews.length
  );
  metrics.G_reviews_rating_max = Math.max(
    metrics.G_reviews_rating_max,
    metrics.B_reviews_average[businessId]
  );
  metrics.G_90day_reviews_rating_max = Math.max(
    metrics.G_90day_reviews_rating_max,
    metrics.B_90_reviews_average[businessId]
  );
  metrics.G_90day_reviews_count_max = Math.max(
    metrics.G_90day_reviews_count_max,
    daycount
  );
}

async function updateBusinessScores(queryId, metrics) {
  const businesses = await getBusinessByQueryIdInDynamoDB(queryId, "Business");
  const scoredBusinesses = calculateBusinessScores(businesses, metrics);

  // Update each business with new scores
  for (const business of scoredBusinesses) {
    await updateFieldsInDynamoDB(business, "Business");
  }
}

function calculateBusinessScores(businesses, metrics) {
  const makeid = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join("");
  };

  return businesses
    .map((business) => {
      const score = calculateScore(business, metrics);
      return { ...business, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((business, index) => ({
      ...business,
      rank: index + 1,
      bcode: index < 3 && businesses.length >= 5 ? makeid(5) : "a",
    }));
}

function calculateScore(business, metrics) {
  const {
    G_reviews_count_max,
    G_90day_reviews_count_max,
    G_90day_reviews_rating_max,
    B_reviews_count,
    B_reviews_average,
    B_90_reviews_count,
    B_90_reviews_average,
  } = metrics;

  const businessId = business.id;
  const c_display = G_reviews_count_max
    ? B_reviews_count[businessId] / G_reviews_count_max
    : 0;
  const p_display =
    G_90day_reviews_count_max && G_90day_reviews_rating_max
      ? (B_90_reviews_count[businessId] / G_90day_reviews_count_max) *
        (B_90_reviews_average[businessId] / G_90day_reviews_rating_max)
      : 0;

  const c_factor =
    B_reviews_count[businessId] <= G_reviews_count_max * 0.05 ? 1.5 : 1;
  const p_factor =
    B_reviews_count[businessId] <= G_reviews_count_max * 0.05 ? 1.5 : 1;

  const c_adjust = (c_display - 1) * c_factor;
  const p_adjust = (p_display - 1) * p_factor;

  return B_reviews_average[businessId] + c_adjust + p_adjust;
}

module.exports = {
  storeDataInDynamoDB,
  updateItemsFieldsInDynamoDB,
  updateFieldsInDynamoDB,
  deleteReviewsByBusinessIdInDynamoDB,
  deleteBusinessByIdInDynamoDB,
  getBusinessByQueryIdInDynamoDB,
  getBusinessByBCodeInDynamoDB,
  getReviewsByBusinessIdInDynamoDB,
  getEstimateByIdInDynamoDB,
  storeDataInS3,
  storeQueryDataInStorage,
};
