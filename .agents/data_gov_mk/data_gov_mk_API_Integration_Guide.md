**Here is a highly detailed, technical documentation reference for the data.gov.mk API, specifically tailored for integration into software applications.**

# ---

**Comprehensive API Documentation: data.gov.mk (CKAN v3)**

## **1\. Overview & Architecture**

The data.gov.mk portal is powered by **CKAN (Comprehensive Knowledge Archive Network)**. The API is implemented as an **RPC-style Action API (version 3\)**.

- **Base URL:** https://data.gov.mk/api/3/action/
- **Protocol:** HTTPS
- **Data Format:** JSON
- **HTTP Methods:** Both GET and POST are supported for most endpoints. However, it is highly recommended to use POST with a JSON body for complex queries (like deeply nested searches or large parameters).

## **2\. Core Concepts**

To navigate the API effectively, you must understand CKAN's data hierarchy:

1. **Package (Dataset):** The high-level container (e.g., "Budget of the Municipality of Kumanovo 2024"). It contains metadata like the title, author, and license.
2. **Resource:** The actual data files or links inside a dataset (e.g., a specific CSV file, an XML feed, or a PDF).
3. **DataStore:** An active database within CKAN that parses tabular resources (like CSVs) and allows you to run SQL-like queries directly against the rows via the API, rather than downloading the entire file.
4. **Organization:** The entity that owns the data (e.g., a specific ministry or municipality).

## **3\. Standard Response Schema**

Every API request returns a standard wrapper object. You should always check the success boolean before parsing the result.

JSON

{  
 "help": "https://data.gov.mk/api/3/action/help\_show?name=...",  
 "success": true,  
 "result": { ... },  
 "error": { // Only present if success is false  
 "\_\_type": "Validation Error",  
 "message": "Access denied"  
 }  
}

## **4\. Authentication**

Public data can be queried without authentication. However, accessing private, draft, or restricted datasets—or creating/updating data—requires an API Key.

- **Header:** Authorization
- **Value:** \[Your API Key\] (Obtained from your user profile on data.gov.mk)

Bash

curl \-H "Authorization: my-api-key-here" https://data.gov.mk/api/3/action/package\_list

## ---

**5\. Core Endpoints Reference**

### **5.1 Dataset (Package) Endpoints**

#### **package_list**

Returns a list of the names of the site's datasets.

- **Endpoint:** /api/3/action/package_list
- **Method:** GET
- **Parameters:**
    - limit (int): Number of datasets to return.
    - offset (int): When paginating, where to start.
- **Returns:** Array of strings (Dataset IDs/Names).

#### **package_show**

Returns complete metadata for a specific dataset, including all its associated resources (files).

- **Endpoint:** /api/3/action/package_show
- **Method:** GET
- **Parameters:**
    - id (string, required): The ID or name of the dataset.
- **Returns:** A Dataset dictionary containing lists of Resources, Tags, and Organization details.

#### **package_search**

The most powerful endpoint for finding datasets. Uses Apache Solr syntax for querying.

- **Endpoint:** /api/3/action/package_search
- **Method:** GET / POST
- **Parameters:**
    - q (string): The search query (e.g., "budget").
    - fq (string): Filter query. Used to filter by specific fields (e.g., organization:ministry-of-health).
    - rows (int): Number of results to return (Pagination limit). Default is 10\.
    - start (int): Pagination offset.
    - sort (string): Sorting order (e.g., metadata_modified desc).
- **Example Request:** ?q=education\&fq=res_format:CSV\&rows=5

### **5.2 Organization Endpoints**

#### **organization_list**

- **Endpoint:** /api/3/action/organization_list
- **Method:** GET
- **Parameters:**
    - all_fields (bool): If true, returns full dictionary objects instead of just names.
    - include_dataset_count (bool): Returns the number of datasets per organization.

### **5.3 DataStore Endpoints (Row-level Data)**

_Note: This only works if the specific resource has been ingested into the CKAN DataStore (typically CSV or XLS files)._

#### **datastore_search**

Allows you to query the actual rows of a tabular data file without downloading the whole file.

- **Endpoint:** /api/3/action/datastore_search
- **Method:** POST
- **Parameters:**
    - resource_id (string, required): The UUID of the resource.
    - filters (dictionary): Key-value pairs for exact matching (e.g., {"status": "active"}).
    - q (string): Full-text search across all columns.
    - limit (int): Number of rows.
    - offset (int): Pagination.
    - fields (list of strings): Specific columns to return (e.g., \["id", "amount", "date"\]).

#### **datastore_search_sql**

Allows executing raw SQL queries against a resource.

- **Endpoint:** /api/3/action/datastore_search_sql
- **Method:** POST
- **Parameters:**
    - sql (string, required): The SQL query. Use the resource_id as the table name.
    - _Example:_ SELECT \* FROM "resource_id_here" WHERE amount \> 1000 ORDER BY date DESC

## ---

**6\. Implementation Example (Python / Requests)**

Below is a robust Python wrapper class demonstrating how to properly handle pagination, DataStore querying, and error handling for this API.

Python

import requests  
import urllib.parse  
from typing import List, Dict, Optional, Any

class DataGovMkAPI:  
 def \_\_init\_\_(self, api_key: Optional\[str\] \= None):  
 self.base_url \= "https://data.gov.mk/api/3/action/"  
 self.headers \= {"Content-Type": "application/json"}  
 if api_key:  
 self.headers\["Authorization"\] \= api_key

    def \_make\_request(self, endpoint: str, payload: Dict \= None) \-\> Any:
        """Internal method to handle requests and CKAN's standard response format."""
        url \= urllib.parse.urljoin(self.base\_url, endpoint)
        try:
            \# CKAN handles POST better for complex queries
            response \= requests.post(url, json=payload or {}, headers=self.headers, timeout=10)
            response.raise\_for\_status()

            data \= response.json()
            if not data.get("success"):
                error\_msg \= data.get("error", {}).get("message", "Unknown CKAN error")
                raise Exception(f"API Error: {error\_msg}")

            return data\["result"\]
        except requests.exceptions.RequestException as e:
            raise Exception(f"Network error connecting to data.gov.mk: {str(e)}")

    def search\_datasets(self, query: str, rows: int \= 10, offset: int \= 0\) \-\> Dict:
        """Search for datasets by keyword."""
        payload \= {
            "q": query,
            "rows": rows,
            "start": offset
        }
        return self.\_make\_request("package\_search", payload)

    def get\_dataset\_metadata(self, dataset\_id: str) \-\> Dict:
        """Get full metadata for a specific dataset, including resource IDs."""
        return self.\_make\_request("package\_show", {"id": dataset\_id})

    def query\_datastore(self, resource\_id: str, limit: int \= 100, filters: Dict \= None) \-\> List\[Dict\]:
        """Fetch actual row data from a tabular resource (CSV)."""
        payload \= {
            "resource\_id": resource\_id,
            "limit": limit
        }
        if filters:
            payload\["filters"\] \= filters

        result \= self.\_make\_request("datastore\_search", payload)
        return result.get("records", \[\])

\# \==========================================  
\# Example Usage  
\# \==========================================  
if \_\_name\_\_ \== "\_\_main\_\_":  
 client \= DataGovMkAPI()

    try:
        \# 1\. Search for datasets related to "finances"
        print("Searching for datasets...")
        search\_results \= client.search\_datasets(query="финансии", rows=1)

        if search\_results\["results"\]:
            first\_dataset \= search\_results\["results"\]\[0\]
            print(f"Found Dataset: {first\_dataset\['title'\]}")

            \# 2\. Extract the ID of the first CSV resource in this dataset
            csv\_resources \= \[res for res in first\_dataset\['resources'\] if res\['format'\].upper() \== 'CSV'\]

            if csv\_resources:
                resource\_id \= csv\_resources\[0\]\['id'\]
                print(f"Found CSV Resource ID: {resource\_id}")

                \# 3\. Query the actual rows from the DataStore
                print("Fetching rows from DataStore...")
                rows \= client.query\_datastore(resource\_id=resource\_id, limit=5)
                for i, row in enumerate(rows):
                    print(f"Row {i+1}: {row}")
            else:
                print("No CSV resources found in this dataset.")

    except Exception as e:
        print(f"Failed: {e}")

## **7\. Common Pitfalls & Tips**

1. **Trailing Slashes:** Do not add a trailing slash to the endpoint names (e.g., use /package_show, not /package_show/).
2. **Resource Formats:** Relying purely on file extensions is risky. Always check the format field in the resource metadata (e.g., "format": "CSV").
3. **DataStore Availability:** Not all tabular files are ingested into the DataStore automatically. If datastore_search returns a "Resource not found" error, it means the file is hosted, but not parsed into the DB. In this case, you must fetch the url from the resource metadata and download/parse the CSV manually.
