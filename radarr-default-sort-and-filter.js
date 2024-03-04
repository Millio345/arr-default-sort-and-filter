// ==UserScript==
// @name        Radarr default sort & filter
// @namespace   https://github.com/Millio345/arr-default-sort-and-filter
/* Since Radarr's installation url is different for every user we need to match all links; Script checks for a 'Radarr' metadata tag before actually doing anything */
// @include http://*
// @include https://*
// @require     https://openuserjs.org/src/libs/sizzle/GM_config.js
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @version     1.1
// @author      Millio
// @description Sets default sort and filter options for Radarr's interactive search
// @license      MIT
// ==/UserScript==

/* This script allows you to define default sorting and filter for your interactive movie searches for Radarr
As of version 1.1 you no longer need to make any changes to this file.
USAGE:
After installing the extension, visit your Radarr installation and click the 'Configure Radarr default sort & filter' button which should show up in your Userscript extension's menu on your browser

Problems? Suggestions? Improvements? GitHub at https://github.com/Millio345/arr-default-sort-and-filter

CHANGELOG:
1.1 - Move all configuration to UI to prevent users having to override this file with every update. Allow sorting by icon columns by entering the label text you see when moving your mouse over the element (span title)
1.0 - Initial release, basic sort & filter functionality
*/
(function() {
    'use strict';

    /* FUNCTIONS */
    // Sort the table by sortColumn and click "Filter" button if filterName is set
    function clickColumnAndFilter(tableDiv) {
        if(!(sortColumn === null || sortColumn === ""))
        {
            // Find all table headers
            let thElements = tableDiv.getElementsByTagName('th');
            let correctHeaderFound = false
            let headerList = [];
            // Loop through all table headers
            for (let i = 0; i < thElements.length; i++) {
                // Check if this is the table header we want to sort by
                if (thElements[i].textContent.trim().toLowerCase() === sortColumn.toLowerCase()) {
                    correctHeaderFound = true;
                }
                // Not it, let's check if it has a span with the correct title for icon columns
                else if(thElements[i].querySelector('span') && thElements[i].querySelector('span').getAttribute('title').toLowerCase() === sortColumn.toLowerCase()) {
                    correctHeaderFound = true;
                }
                else {
                    if(thElements[i].textContent!==""){
                        headerList.push(thElements[i].textContent);
                    }
                    else if(thElements[i].querySelector('span')){
                        headerList.push(thElements[i].querySelector('span').getAttribute('title'));
                    }
                }

                if(correctHeaderFound){
                    // Click the <th> element
                    thElements[i].click();

                    // If we don't want ascending order, click again
                    if(!sortAscending)
                        thElements[i].click();

                    break; // Stop the loop since we found the target column
                }
            }
            if(!correctHeaderFound){
                console.warn("Sort column '"+sortColumn+"' not found in table headers.")
                console.log("Valid columns: "+headerList.join(','))
            }
        }
        //If no filterName's set, or we've already clicked the filter button for this page load for this movie, this function is done. Otherwise, continue to clicking the filter button
        if(filterName === null || filterName === "" || filterButtonClicked)
            return

        // "Filter" button is first child of tableDiv parent
        let divs = tableDiv.parentElement.getElementsByTagName('div')
        for(let i =0; i < divs.length;i++){
            if(divs[i].className.startsWith('FilterMenu-filterMenu-'))
            {
                let filter = divs[i]
                let button = filter.querySelector('button')
                button.click()
                return;
            }
        }
        console.warn("Filter button not found. Unable to apply filter.");
    }

    // Click the filterName as soon as the filter menu is opened
    function clickChosenFilter(filterListNode) {

        // First make sure filterName is set
        if(filterName === null || filterName === ""){
            return
        }

        // Only click filter button once per movie until page is changed; Otherwise the user would not be able to override the filter since the script would always take over
        if(filterButtonClicked){
            return
        }

        // Get all filters
        let filters = filterListNode.getElementsByTagName('button')

        // Create a filterList for debug logging in case filter is not found
        let filterList = [];

        for(let i = 0; i < filters.length; i++) {
            let div = filters[i].querySelector('div');
            if(div !== null){
                if(div.textContent.trim()===filterName){
                    // Got the right filter, click it
                    filters[i].click();

                    // Set filterButtonClicked to true
                    filterButtonClicked = true
                    return;
                }
                else
                    filterList.push(div.textContent.trim());
            }
        }
        console.warn("Filter '"+filterName+"' not found in filter list.")
        console.log("Valid filters:"+filterList.join(','));
    }

    // This function is called by the mutationObserver when additional page content is added. Check if it contains the search table or the filter 'scroller'
    function handleMutations(mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Check if the added nodes include the target element
                if (mutation.addedNodes) {
                    for (let node of mutation.addedNodes) {
                        // Check if the added node is an element (type 1) which has classes
                        if (node.nodeType === 1 && typeof node.className === 'string')
                        {
                            // Was a tableContainer in a modal added?
                            if(node.className.includes('Table-tableContainer-')&&node.parentElement.parentElement.className.startsWith('ModalBody')) {
                                clickColumnAndFilter(node);
                                return;
                            }
                            // Was a menu scroller added (This is the opened filter list)? Click the chosen filter
                            else if(node.className.includes('MenuContent-scroller-')) {
                                clickChosenFilter(node)
                            }
                        }
                    }
                }
            }
        }
    }

    // Check current page url to see if we're on a movie page or not ; returns true/false
    function onMoviePage(){
        // movie links end in /movie/NUMBER
        let pattern = /\/movie\/\d+$/;

        // Return true / false depending on whether we're on a movie page
        return pattern.test(window.location.href);
    }

    // When a movie page is loaded, start mutation observer and set filter clicked to false
    function movieLoaded(){
        filterButtonClicked = false
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    // To prevent unintended consequences on other tables/buttons, stop observer when another page is loaded
    function nonMoviePageLoaded(){
        observer.disconnect()
    }
    function loadScript()
    {
        // Setup GM Config, which provides a nice UI to set the options
        gmc = new GM_config(
            {
                'id': 'RadarrDefaultSortAndFilter',
                "css": `#RadarrDefaultSortAndFilter {background: #2a2a2a;}
                #RadarrDefaultSortAndFilter .field_label {color: #fff;}
                #RadarrDefaultSortAndFilter .config_header {color: #fff; padding-bottom: 10px;}
                #RadarrDefaultSortAndFilter .reset {color: #f00; text-align: center;}
                #RadarrDefaultSortAndFilter .section_header {color: #fff; text-align: left; margin-top: 15px;margin-bottom: 5px; padding:5px;}
                #RadarrDefaultSortAndFilter .section_desc {background: #2a2a2a; color: #fff; text-align: left; border:none;}
                #RadarrDefaultSortAndFilter .config_var {text-align: left;}
                #RadarrDefaultSortAndFilter input { display: block; margin-top:5px; margin-bottom: 20px}
                #RadarrDefaultSortAndFilter .reset_holder {display: none;}`,
                'title': 'Radarr Default Sort and Filter', // Panel Title
                'fields': // Fields object
                    {
                        'InteractiveSearchFilterName': // This is the id of the field
                            {
                                'label': 'Name of default filter to apply (leave empty to disable)', // Appears next to field
                                'section': [GM_config.create('Automatic Filter'), 'Automatically applies a filter when loading interactive search table'],
                                'type': 'text', // Makes this setting a text field
                                'title': 'Enter the name of the filter exactly as you see it in Radarr',
                                'default': '' // Default value if user doesn't change it
                            },
                        'InteractiveSearchSortColumn': // This is the id of the field
                            {
                                'label': 'Default interactive search column to sort by (leave empty to disable)', // Appears next to field
                                'section': [GM_config.create('Automatic Sort'), 'If you want the script to automatically apply a filter when loading interactive search, enter the exact name of the filter here'],
                                'title':  'Column title exactly as you see it. For icons enter the value that appears when you move your mouse over the icon.',
                                'type': 'text', // Makes this setting a text field
                                'default': '' // Default value if user doesn't change it
                            },
                        'InteractiveSearchSortAscending': // This is the id of the field
                            {
                                'label': 'Sort Ascending? (Check to sort A-Z / 0 - 9)', // Appears next to field
                                'type': 'checkbox', // Makes this setting a text field
                                'default': false // Default value if user doesn't change it
                            },
                    },
                'events': {
                    'init': () => {
                        // initialization complete, load values
                        filterName = gmc.get('InteractiveSearchFilterName');
                        sortColumn = gmc.get('InteractiveSearchSortColumn');
                        sortAscending = gmc.get('InteractiveSearchSortAscending');
                    },
                    'save': function () { // runs after values are saved
                        // settings may have been changed, reload values
                        filterName = gmc.get('InteractiveSearchFilterName');
                        sortColumn = gmc.get('InteractiveSearchSortColumn');
                        sortAscending = gmc.get('InteractiveSearchSortAscending');
                    }
                }
            });

        // Add configuration menu item to extension
        GM_registerMenuCommand("Configure Radarr default sort & filter", show_config, "c");

        // Initial page load - Are we on a movie page?
        if(onMoviePage())
            movieLoaded()

        // Code below to detect page change without reload radarr uses - https://stackoverflow.com/questions/6390341/how-to-detect-if-url-has-changed-after-hash-in-javascript
        let oldPushState = history.pushState;
        history.pushState = function pushState() {
            let ret = oldPushState.apply(this, arguments);
            window.dispatchEvent(new Event('pushstate'));
            window.dispatchEvent(new Event('locationchange'));
            return ret;
        };

        let oldReplaceState = history.replaceState;
        history.replaceState = function replaceState() {
            let ret = oldReplaceState.apply(this, arguments);
            window.dispatchEvent(new Event('replacestate'));
            window.dispatchEvent(new Event('locationchange'));
            return ret;
        };

        window.addEventListener('popstate', () => {
            window.dispatchEvent(new Event('locationchange'));
        });

        // locationchange event is fired when url is changed thanks to code above
        window.addEventListener('locationchange', function () {
            //Are we on a movie page? Call appropriate function
            if(onMoviePage())
                movieLoaded()
            // When on another page, disable the mutation observer
            else
                nonMoviePageLoaded()
        });

    }

    function show_config()
    {
        gmc.open();
    }

    /* END FUNCTIONS */


    // First check if we're on a Radarr site (site with metadata description 'Radarr')
    let description = document.querySelector('meta[name="description"]');
    if(description && description.content==="Radarr"){
        console.log("Radarr installation found. Watching for interactive search table")
        // Define some variables for global use through the script
        // Create a new MutationObserver since Radarr dynamically adds elements after pageload
        var observer = new MutationObserver(handleMutations);

        // Radarr uses ajax to change pages; We only want to click the filter button once per movie (otherwise the filter button is completely blocked from user interaction)
        var filterButtonClicked = false;

        // Variable to store gm config
        var gmc;

        // filter and sort options. Variables automatically get populated by the GMC config menu on init
        var filterName;
        var sortColumn;
        var sortAscending;

        // Load the script functionality
        loadScript();

    }
})();
