# arr-default-sort-and-filter
Userscript to set default sort and filter options for Radarr

## Usage
1. Install the userscript using your preferred Userscript manager (FirMonkey/Tampermonkey/Greasemonkey/Violentmonkey/...)
2. Load your Radarr installation in your website
3. Open your userscript manager's menu and under script commands for "Radarr Default Sort And Filter", click "Configure Radarr default sort and filter"
4. Configure the default filter and sort and click "Save" and "Close". For icon columns, enter the text that apears when you move your mouse over the icon. A valid sort example for an english installation is "Custom Format Score".
5. Open a movie and do an interactive search, the sort and filter should be applied

## Known Issues
When an 'Interactive Search' table is open, the configuration values become impossible to edit. Reload the page and configure the script before loading the interactive search. 

## Troubleshooting
Open your developer console using F12.
If the script is correctly loaded and finds a Radarr installation, you should see the message "Radarr installation found. Watching for interactive search table".

If the script cannot find the sort column or filter it will log a warning and log a list of valid filters / columns.

## Feature Requests
Currently the script only supports Radarr and only Interactive Search, but if you'd like support for other *arrs or other sortable tables in Radarr, feel free to open an issue to request this.
