# Open Finance MK API Specification (Extended)

This document details the internal REST API for [open.finance.gov.mk](https://open.finance.gov.mk), supporting server-side pagination, column filtering, and advanced search via DataTables.

## Transaction Search Endpoint

**URL:** `https://open.finance.gov.mk/api/datatable/search/transactions`  
**Method:** `GET`  
**Response Format:** `JSON` (DataTables Object)

---

### 1. Primary Filter Parameters

These parameters define the specific search criteria for the Macedonian financial database.

| Parameter      | Type    | Description                                                                                                                   |
| :------------- | :------ | :---------------------------------------------------------------------------------------------------------------------------- |
| `term`         | String  | URL-encoded search keyword (e.g., `Образование`). Must be in Macedonian Cyrillic. Results will be empty if not in this format |
| `month_from`   | Integer | Starting month (1-12). The default value is 1.                                                                                |
| `year_from`    | Integer | Starting year (e.g., 2026). The default value is the current year.                                                            |
| `month_to`     | Integer | Ending month (1-12). The default value is the current month.                                                                  |
| `year_to`      | Integer | Ending year (e.g., 2026). The default value is the current year.                                                              |
| `action`       | String  | Query scope; Always set to `global`.                                                                                          |
| `payer`        | String  | Name of the paying entity.                                                                                                    |
| `recipient`    | String  | Name of the recipient entity.                                                                                                 |
| `payerEDB`     | String  | Tax Number (EDB) of the payer.                                                                                                |
| `recipientEDB` | String  | Tax Number (EDB) of the recipient.                                                                                            |

---

### 2. Pagination & Metadata Parameters

These control the "window" of data returned by the server.

| Parameter | Type    | Description                                                        |
| :-------- | :------ | :----------------------------------------------------------------- |
| `draw`    | Integer | Sequence counter used by the frontend to keep track of requests.   |
| `start`   | Integer | The starting record index (0-based) for the current page.          |
| `length`  | Integer | Number of records to return in a single batch (e.g., 10, 50, 100). |
| `_`       | Long    | Unix Timestamp (used as a cache-buster).                           |

---

### 3. Column Definition Parameters

The API uses indexed arrays to define the schema of the expected response.

| Pattern                  | Description                                                  |
| :----------------------- | :----------------------------------------------------------- |
| `columns[i][data]`       | The specific data key mapped to the column (see list below). |
| `columns[i][name]`       | The logical name of the column.                              |
| `columns[i][searchable]` | `true` or `false`                                            |
| `columns[i][orderable]`  | `true` or `false`                                            |

**Available Data Keys (`[data]`):**

- `data_valuta`: Transaction Date
- `naziv_primac`: Recipient Name
- `naziv_davac`: Payer Name
- `smetka_davac`: Payer Account Number
- `ec_code_davac`: Economic Category Code
- `bu_program_davac`: Budget Program Code
- `iznos`: Amount (Transaction Value)

---

### Request Example (cURL)

```bash
curl -X GET "https://open.finance.gov.mk/api/datatable/search/transactions?term=Македонија&month_from=1&year_from=2026&month_to=4&year_to=2026&action=global&start=0&length=10&draw=1"
```
