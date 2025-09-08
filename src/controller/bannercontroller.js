const cheerio = require('cheerio');
const yaml = require('yamljs');
const fs = require('fs');
const response = require("../../helper/response");
const axios = require("axios");

const { connectWithVendorDb } = require("../../config/mongodb_connections");
const createBannerModel = require("../../mongo_models_new/credexon_vendor/BannersSchema");
const { getDBName } = require('../../helper/common');
const env = process.env;

module.exports = {
    banner_list: async (req, res, next) => {
        try {
            const dbName = await getDBName(req.user.apikey);
            const vendorDbConnection = await connectWithVendorDb(dbName);
            const BannerSchema = createBannerModel(vendorDbConnection);

            const params = req.body;
            let device = (params?.device) ? params.device : "web";
            let banner_list = await BannerSchema.find({ type: params.type, device, status: 1 }, { _id: 1, type: 1, image: 1, sequence: 1, status: 1, banner_link: 1 });//.lean()

            banner_list = banner_list?.map((item) => {
                let checkhttpurl = isValidHttpUrl(item.image)
                if (checkhttpurl) {
                    item.image = item.image
                } else {
                    item.image = `${env.awsimgurl}profile_doc/${item.image}`
                }
                return (item)
            })

            return res.send(response({ banner_list }, "Banner created successfully.!!!", true))
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, error));
        }
    },
    page_scroll: async (req, res, next) => {
        try {
            const fetchURL = req.query.fetchURL;
            console.log("fetchURL--->>", fetchURL);
            let allAPIs = [];

            // Loop through each page to fetch APIs
            //for (let page = 1; page <= totalPages; page++) {
            const url = fetchURL;//`${baseUrl}?page=${page}`; // Example: URL with pagination

            // Fetch HTML content
            const html = await fetchHTML(url);
            // if (!html) {
            //     console.error(`Failed to fetch HTML content from ${url}`);
            //     continue; // Skip to next page on error
            // }
            console.log("htmlhtml===>>", html)
            // Extract APIs from HTML content
            const apis = extractAPIsFromHTML(html);
            allAPIs = allAPIs.concat(apis); // Append extracted APIs to allAPIs array
            //}

            // Generate Swagger format
            const swaggerData = generateSwaggerFormat(allAPIs);

            // Save Swagger file (JSON or YAML)
            const swaggerYaml = yaml.stringify(swaggerData, 4); // Use 4 spaces for indentation
            fs.writeFileSync('swagger.yaml', swaggerYaml, 'utf8');
            console.log('Swagger file generated successfully.');

            return res.send(response({}, "Scroll page successfully.!!!", true))
        } catch (error) {
            console.log("errorBanner--->>", error)
            return res.status(400).send(response({}, "Something went wrong.!!!", false, error));
        }
    }
}


async function fetchHTML(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching the HTML:', error);
        return null;
    }
}

// Function to extract APIs from HTML content
function extractAPIsFromHTML(html) {
    const $ = cheerio.load(html);
    const apis = [];

    // Example: find all anchor tags with href attribute (you'll need to adapt this to your page structure)
    $('a[href]').each((index, element) => {
        const apiEndpoint = $(element).attr('href');
        const httpMethod = 'GET'; // You would need to determine this based on your page structure

        // Example: extract other details like parameters, headers, etc. based on your page structure

        // Store API details
        apis.push({
            url: apiEndpoint,
            method: httpMethod,
            // Add other fields as needed (parameters, responses, etc.)
        });
    });

    return apis;
}

// Function to generate Swagger/OpenAPI format from extracted APIs
function generateSwaggerFormat(apis) {
    const swaggerData = {
        openapi: '3.0.0', // Example OpenAPI version
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Generated from web scraping',
        },
        paths: {},
    };

    // Convert extracted APIs into Swagger format
    apis.forEach((endpoint) => {
        const url = endpoint.url;
        const method = endpoint.method.toLowerCase(); // Ensure method is in lower case

        // Example: define path and method
        swaggerData.paths[url] = swaggerData.paths[url] || {};
        swaggerData.paths[url][method] = {
            responses: {
                '200': {
                    description: 'Successful response',
                },
            },
        };
        // Add other fields (parameters, request body, etc.) as needed
    });

    return swaggerData;
}

const isValidHttpUrl = (string) => {
    //return new Promise((resolve, reject) => {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
    // })
}