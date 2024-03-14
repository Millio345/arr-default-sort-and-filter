# arr-default-sort-and-filter
Userscript to set default sort and filter options for Lidarr / Radarr/ Readarr / Sonarr / Whisparr

## Usage
1. Install the userscript using your preferred Userscript manager (FireMonkey/Tampermonkey/Greasemonkey/Violentmonkey/...)
2. Load your *arr installation in your website
3. Open your userscript manager's menu and under script commands for "*arr Default Sort And Filter", click "Configure Radarr default sort and filter"
4. Configure the default filter and sort and click "Save" and "Close". For icon columns, enter the text that apears when you move your mouse over the icon. A valid sort example for an english installation is "Custom Format Score".
5. Open a movie and do an interactive search, the sort and filter should be applied

## Known Issues / Limitations
- When an 'Interactive Search' table is open, the configuration values become impossible to edit. Reload the page and configure the script before loading the interactive search.
- The script only works for interactive searches which open in a separate Modal window. For example in 'Readarr', when on a book page, the search is on the page instead of in a separate modal window; Go to the author page and initiate the search from there.
- Only one configuration set per *arr type is possible: For example if you manage two Radarr sites, you cannot set different filter/sort options for each. 

Feel free to open an issue / PR on GitHub if one of these provide a problem in how you use the script.

## Troubleshooting
Open your developer console using F12.
If the script is correctly loaded and finds an *arr installation, you should see the message like "Radarr installation found. Watching for interactive search table".

If the script cannot find the sort column or filter it will log a warning and log a list of valid filters / columns.

## Feature Requests
If you'd like additional features, feel free to open an issue to request this.
