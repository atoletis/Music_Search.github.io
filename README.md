# Shoe Finder  
ShoeFinder is a semantic search-based application designed to help users find shoes based on their specific needs, even with minimal brand knowledge. It offers personalized recommendations, typo corrections, and links to compare prices before purchasing.  

## Features  
Semantic Search using Elasticsearch.
Personalized Recommendations based on search history.
Autocorrect for typos (e.g., "Nikey" → "Nike").
Price Comparison Links to Google Search.
## Prerequisites
Node.js installed on your system.  
Elasticsearch instance set up and running.  
## Installation
Clone the repository:  
```git clone https://github.com/your-repository-url/ShoeFinder.git```  
```cd ShoeFinder```  
```npm install```  
## Running the Application  
### Start the server:  
```node server.js```  
### Run the proxy script  
```cd public```   
```node proxy.js```  
### Open the application in your browser:
```http://localhost:8000/login.html```  
## Usage
Navigate to the login page and log in with your credentials.
Search for shoes by description or keyword.
Click on results to explore price comparisons via Google Search.
## Notes  
Ensure Elasticsearch is running before starting the server.
