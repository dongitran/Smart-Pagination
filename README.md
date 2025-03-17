# 🚀 Smart Pagination

## 🌠 Overview

A smart solution for paginating large, constantly changing PostgreSQL datasets using materialized views, solving challenges that traditional pagination methods can't handle effectively.

## ✨ Features

- 🧠 Smart caching system using `big_table_views` for consistent pagination
- ⚡ Efficient handling of new records through intelligent offset calculations

## 🛠️ Getting Started

```bash
# Clone the repository
git clone https://github.com/dongitran/smart-pagination.git

# Navigate to the project directory
cd smart-pagination

# Install dependencies
npm install

# Set up your environment variables
cp .env.sample .env
```

## 🧩 How It Works

```mermaid
flowchart TD
    GetInfo([Get latest_mapping_id </br>and max_page_number]) --> CheckDataPosition{Page in new data?}
    
    CheckDataPosition -->|Yes| QueryNewData([Query new data directly])
    CheckDataPosition -->|No| GetPagePositions([Calculate page positions])
    
    GetPagePositions --> QueryView([Query materialized view])
    
    QueryView --> ProcessResults([Process and format results])
    QueryNewData --> Return([Return data])
    ProcessResults --> Return
    
    classDef start fill:#c6ffdd,stroke:#008a4c,stroke-width:2px,color:#000
    classDef decision fill:#ffd3b6,stroke:#ff7e24,stroke-width:2px,color:#000
    classDef process fill:#a1c4fd,stroke:#3e6fff,stroke-width:2px,color:#000
    classDef returnData fill:#cfbaf0,stroke:#8a6be9,stroke-width:2px,color:#000
    classDef query fill:#bde0fe,stroke:#3e8eff,stroke-width:2px,color:#000
    
    class GetInfo start
    class CheckDataPosition decision
    class GetPagePositions,ProcessResults process
    class QueryNewData,QueryView query
    class Return returnData
```

The Smart Pagination system:

1. 🔍 Checks if new records exist by comparing with the latest ID in view table
2. 📊 Decides if the page is in new or cached data
3. 🔀 Fetches directly from main table for new data, or from view for cached data
4. 🔢 Handles pages that overlap between new and cached data

## 📜 License

This demo code is licensed under the ISC License.