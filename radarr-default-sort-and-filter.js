// ==UserScript==
// @name        Radarr default sort & filter
// @namespace   https://github.com/Millio345/arr-default-sort-and-filter
/* EDIT THE LINE BELOW TO MATCH YOUR RADARR LINK */
// @match       http://localhost:8989/*
// @grant       none
// @version     1.0
// @author      Millio
// @description Sets default sort and filter options for Radarr's interactive search
// @author      MIT
// ==/UserScript==


(function() {
    /* This script allows you to define default sorting and filter for your interactive movie searches for Radarr
    INSTRUCTIONS:
    1) Change the @match line ABOVE to point to the homepage of your local radarr installation. Open the homepage, copy the link and add '*' to the end.
    For example, if your radarr homepageis at 'https://myserver.com/radarr/' the line should be like this:
    // @match       https://myserver.com/radarr/*
    2) Edit the values below
    3) If the script does not work, open the developer options with F12 and look at the console to try to figure out what's going wrong

    Problems? Suggestions? Improvements? Github at https://github.com/Millio345/arr-default-sort-and-filter
    */

    // Default filter to use exactly like it appears in Radarr; f.e. filterName = '1080p'. Set to null without quotes (filterName = null) to disable a default filter
    var filterName = '1080p'

    // Default sort column to use, surrounded by quotes, f.e. sortColumn = 'Age', set to null without quotes to disable a default sort column.
    // Enter the column EXACTLY as you see it in Radarr, so if Radarr is set to another language, put the word in your language as you see it;
    var sortColumn = 'Peers'

    // Should results be sorted in ascending order?  true / false (don't use quotation quotes) |  Sorts A -Z / 0 - 9 if true or Z-A 9 - 0 if false
    var sortAscending = false

    //DO NOT EDIT ANYTHING BEYOND THIS POINT UNLESS YOU KNOW WHAT YOU ARE DOING
    'use strict';

    /* FUNCTIONS */
    // Sort the table by sortColumn and click "Filter" button if filterName is set
    function clickColumnAndFilter(tableDiv) {
        // Find all table headers
        var thElements = tableDiv.getElementsByTagName('th');

        // Loop through all table headers
        for (var i = 0; i < thElements.length; i++) {
            // Check if this is the talbe header we want to sort by
            if (thElements[i].textContent.trim() === sortColumn) {
                // If found, click on the <th> element
                thElements[i].click();

                // If we don't want ascending order, click again
                if(!sortAscending)
                  thElements[i].click();
                break; // Stop the loop since we found the target column
            }
        }

      //If no filterName's set or we've already clicked the filter button for this page load for this movie, this function is done. Otherwise, continue to clicking the filter button
      if(filterName === null || filterButtonClicked)
        return

      // "Filter" button is first child of tableDiv parent
      var divs = tableDiv.parentElement.getElementsByTagName('div')

      for(var i =0; i < divs.length;i++){
        if(divs[i].className.contains('FilterMenu-filterMenu-'))
        {
          var filter = divs[i]
          var button = filter.querySelector('button')
          button.click()
          var divChildren = button.getElementsByTagName('div')
          for (var j = 0; j < divChildren.length; j++)
          {
            if (divChildren[j].textContent.trim() === filterName)
            {
                console.log("Found the filter "+filterName)
                divChildren[j].click()
                break;
            }
          }
      }
    }
  }

  // Click the filterName as soon as the filter menu is opened
  function clickChosenFilter(filterListNode) {

    // First make sure filterName is set
    if(filterName === null){
      console.log("filterName is not set")
      return
    }

    // Only click filter button once per movie until page is changed; Otherwise the user would not be able to override the filter since the script would always take over
    if(filterButtonClicked){
      console.log("We already clicked filter button for this movie")
      return
    }

    // Get all filters
    var filters = filterListNode.getElementsByTagName('button')
    console.log("Found "+filters.length+" filter buttons.")
    for(var i = 0; i < filters.length; i++) {
      var div = filters[i].querySelector('div')
      if(div !== null){
        if(div.textContent.trim()==filterName){
          // Got the right filter, click it
          filters[i].click();

          // Set filterButtonClicked to true
          filterButtonClicked = true
          break;
        }
      }
    }
  }

    // This function is called by the mutationObserver when additional page content is added. Check if it contains the search table or the filter 'scroller'
    function handleMutations(mutationsList, observer) {
        for (var mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Check if the added nodes include the target element
                if (mutation.addedNodes) {
                    for (var node of mutation.addedNodes) {
                        // Check if the added node is an element (type 1) which has classes
                        if (node.nodeType === 1 && typeof node.className === 'string')
                        {
                            // Was a tableContainer added? Currently this also detects the file list but as far as I have found this does not have any unintended consequences
                            if(node.className.includes('Table-tableContainer-')) {
                              console.log("Tablecontainer added to movie page - Attempting to sort and filter");
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
    var pattern = /\/movie\/\d+$/;

    if(pattern.test(window.location.href))
      return true
    else
      return false
  }

  // When a movie page is loaded, start mutation observer and set filter clicked to false
  function movieLoaded(){
    filterButtonClicked = false
    console.log("Movie loaded - starting mutation observer...");
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

   // To prevent unintended consequences on other tables/buttons, stop observer when another page is loaded
  function nonMoviePageLoaded(){
    observer.disconnect()
  }
  /* END FUNCTIONS */

  // Create a new MutationObserver
  var observer = new MutationObserver(handleMutations);

  // Radarr uses ajax to change pages; We only want to click the filter button once per movie (otherwise the filter button is completely blocked from user interaction)
  var filterButtonClicked = false

  // Initial script load - Are we on a movie page?
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
        otherPageLoaded()
    });
})();
