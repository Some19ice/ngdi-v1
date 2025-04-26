/**
 * Client-side hydration script for search page components
 *
 * This script hydrates client-side components that need to be interactive
 * but aren't part of the initial server-side render.
 */

;(function () {
  // Wait for the DOM to be fully loaded
  document.addEventListener("DOMContentLoaded", function () {
    // Get the search parameters from the hidden JSON element
    const hydrationDataElement = document.getElementById(
      "search-hydration-data"
    )
    if (!hydrationDataElement) return

    // Parse the JSON data
    try {
      const hydrationData = JSON.parse(hydrationDataElement.textContent || "{}")
      const { searchParams, total } = hydrationData

      // Set up view toggle
      const viewToggleContainer = document.getElementById(
        "view-toggle-container"
      )
      if (viewToggleContainer) {
        const currentView = searchParams.viewMode || "list"

        // Create view toggle component
        const viewToggle = document.createElement("div")
        viewToggle.className =
          "flex items-center border rounded-md overflow-hidden bg-background"
        viewToggle.innerHTML = `
          <button class="px-3 h-9 rounded-none ${currentView === "list" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}" data-view-mode="list">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2 inline-block">
              <rect width="7" height="7" x="3" y="3" rx="1"></rect>
              <rect width="7" height="7" x="14" y="3" rx="1"></rect>
              <rect width="7" height="7" x="14" y="14" rx="1"></rect>
              <rect width="7" height="7" x="3" y="14" rx="1"></rect>
            </svg>
            <span class="sr-only sm:not-sr-only">List View</span>
          </button>
          <button class="px-3 h-9 rounded-none ${currentView === "map" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}" data-view-mode="map">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2 inline-block">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
              <line x1="9" x2="9" y1="3" y2="18"></line>
              <line x1="15" x2="15" y1="6" y2="21"></line>
            </svg>
            <span class="sr-only sm:not-sr-only">Map View</span>
          </button>
        `

        // Add event listeners to view toggle buttons
        viewToggle.querySelectorAll("button").forEach((button) => {
          button.addEventListener("click", function () {
            const viewMode = this.getAttribute("data-view-mode")
            if (viewMode === currentView) return

            // Build the query string preserving existing parameters
            const params = new URLSearchParams(window.location.search)
            params.set("viewMode", viewMode)

            // Navigate to the updated URL
            window.location.href = `/search?${params.toString()}`
          })
        })

        viewToggleContainer.appendChild(viewToggle)
      }

      // Set up saved searches
      const savedSearchesContainer = document.getElementById(
        "saved-searches-container"
      )
      if (savedSearchesContainer) {
        // Create a simple saved searches UI
        const savedSearchesComponent = document.createElement("div")
        savedSearchesComponent.className = "relative"

        const buttonElement = document.createElement("button")
        buttonElement.className =
          "flex items-center gap-1 h-9 px-3 border rounded-md bg-background text-foreground hover:bg-muted"
        buttonElement.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>
          </svg>
          <span>Saved Searches</span>
        `

        savedSearchesComponent.appendChild(buttonElement)
        savedSearchesContainer.appendChild(savedSearchesComponent)

        // Add click listener
        buttonElement.addEventListener("click", function () {
          const dropdownMenu = document.createElement("div")
          dropdownMenu.className =
            "absolute z-50 top-full mt-1 left-0 w-64 p-2 bg-white shadow-md rounded-md border border-gray-200"

          // Get saved searches from localStorage
          const savedSearches = JSON.parse(
            localStorage.getItem("ngdi_saved_searches") || "[]"
          )

          if (savedSearches.length === 0) {
            dropdownMenu.innerHTML = `
              <div class="text-sm text-gray-500 p-2 text-center">
                No saved searches yet
              </div>
              <button class="w-full text-sm mt-2 p-2 bg-primary text-primary-foreground rounded-md">
                Save Current Search
              </button>
            `
          } else {
            let innerHtml = `
              <div class="text-sm font-medium mb-2">Your Saved Searches</div>
              <div class="max-h-48 overflow-y-auto">
            `

            savedSearches.forEach((search) => {
              innerHtml += `
                <div class="flex items-center justify-between hover:bg-gray-100 p-2 rounded cursor-pointer" data-query="${search.query}">
                  <div>
                    <div class="text-sm font-medium">${search.name}</div>
                    <div class="text-xs text-gray-500">${new Date(search.timestamp).toLocaleDateString()}</div>
                  </div>
                  <button class="text-gray-500 hover:text-red-500" data-id="${search.id}" data-action="delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              `
            })

            innerHtml += `
              </div>
              <button class="w-full text-sm mt-2 p-2 bg-primary text-primary-foreground rounded-md" data-action="save">
                Save Current Search
              </button>
            `

            dropdownMenu.innerHTML = innerHtml
          }

          // Add the dropdown to the page
          document.addEventListener("click", closeDropdown)
          savedSearchesComponent.appendChild(dropdownMenu)

          // Add event listeners to dropdown items
          dropdownMenu
            .querySelectorAll('[data-action="delete"]')
            .forEach((button) => {
              button.addEventListener("click", function (e) {
                e.stopPropagation()
                const id = this.getAttribute("data-id")
                const savedSearches = JSON.parse(
                  localStorage.getItem("ngdi_saved_searches") || "[]"
                )
                const updatedSearches = savedSearches.filter(
                  (search) => search.id !== id
                )
                localStorage.setItem(
                  "ngdi_saved_searches",
                  JSON.stringify(updatedSearches)
                )
                this.closest("[data-query]").remove()

                // Show empty state if no more searches
                if (updatedSearches.length === 0) {
                  closeDropdown()
                }
              })
            })

          // Save current search
          dropdownMenu
            .querySelector('[data-action="save"]')
            ?.addEventListener("click", function () {
              // Show save dialog
              const dialog = document.createElement("div")
              dialog.className =
                "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              dialog.innerHTML = `
              <div class="bg-white p-4 rounded-md w-full max-w-md">
                <h3 class="text-lg font-semibold mb-4">Save Current Search</h3>
                <div class="mb-4">
                  <label class="block text-sm font-medium mb-1">Search Name</label>
                  <input type="text" class="w-full p-2 border rounded-md" placeholder="e.g., Lagos Boundary Data" />
                </div>
                <div class="flex justify-end gap-2">
                  <button class="px-3 py-1 border rounded-md" data-action="cancel">Cancel</button>
                  <button class="px-3 py-1 bg-primary text-primary-foreground rounded-md" data-action="confirm-save">Save</button>
                </div>
              </div>
            `

              document.body.appendChild(dialog)

              // Cancel save
              dialog
                .querySelector('[data-action="cancel"]')
                ?.addEventListener("click", function () {
                  dialog.remove()
                })

              // Confirm save
              dialog
                .querySelector('[data-action="confirm-save"]')
                ?.addEventListener("click", function () {
                  const nameInput = dialog.querySelector("input")
                  const name = nameInput?.value.trim()

                  if (!name) {
                    // Show error
                    nameInput?.classList.add("border-red-500")
                    return
                  }

                  // Create new saved search
                  const newSearch = {
                    id: Date.now().toString(),
                    name,
                    query: window.location.search.substring(1),
                    timestamp: Date.now(),
                    params: searchParams,
                  }

                  // Add to saved searches
                  const savedSearches = JSON.parse(
                    localStorage.getItem("ngdi_saved_searches") || "[]"
                  )
                  savedSearches.push(newSearch)
                  localStorage.setItem(
                    "ngdi_saved_searches",
                    JSON.stringify(savedSearches)
                  )

                  // Remove dialog
                  dialog.remove()
                  closeDropdown()

                  // Show success message
                  const message = document.createElement("div")
                  message.className =
                    "fixed top-4 right-4 bg-green-100 text-green-800 p-3 rounded-md shadow-md z-50"
                  message.innerText = `Search "${name}" saved successfully`
                  document.body.appendChild(message)

                  // Remove message after 3 seconds
                  setTimeout(() => {
                    message.remove()
                  }, 3000)
                })
            })

          // Apply saved search
          dropdownMenu.querySelectorAll("[data-query]").forEach((item) => {
            item.addEventListener("click", function (e) {
              if (e.target.closest('[data-action="delete"]')) return

              const query = this.getAttribute("data-query")
              window.location.href = `/search?${query}`
            })
          })

          function closeDropdown(e) {
            if (e && savedSearchesComponent.contains(e.target)) return
            dropdownMenu.remove()
            document.removeEventListener("click", closeDropdown)
          }
        })
      }

      // Set up advanced filters
      const advancedFiltersContainer = document.getElementById(
        "advanced-filters-container"
      )
      const advancedFiltersMobileContainer = document.getElementById(
        "advanced-filters-mobile-container"
      )

      if (advancedFiltersContainer || advancedFiltersMobileContainer) {
        const advancedFiltersButton = document.createElement("button")
        advancedFiltersButton.className =
          "flex items-center gap-1 h-9 px-3 border rounded-md bg-background text-foreground hover:bg-muted"
        advancedFiltersButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
            <line x1="4" x2="20" y1="8" y2="8"></line>
            <line x1="4" x2="20" y1="16" y2="16"></line>
            <circle cx="8" cy="8" r="2"></circle>
            <circle cx="16" cy="16" r="2"></circle>
          </svg>
          <span>Advanced Filters</span>
        `

        // Add click handler for advanced filters button
        advancedFiltersButton.addEventListener("click", function () {
          // Show a notification that real implementation would need backend changes
          const notification = document.createElement("div")
          notification.className =
            "fixed top-4 right-4 bg-yellow-100 text-yellow-800 p-3 rounded-md shadow-md z-50 max-w-md"
          notification.innerHTML = `
            <div class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 mt-1">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" x2="12" y1="9" y2="13"></line>
                <line x1="12" x2="12.01" y1="17" y2="17"></line>
              </svg>
              <div>
                <p class="font-medium">Advanced Filters Implementation</p>
                <p class="text-sm mt-1">Full implementation of advanced filters requires backend API changes to support spatial filtering, quality filters, and more.</p>
              </div>
            </div>
            <button class="absolute top-2 right-2 text-yellow-800" id="close-notification">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" x2="6" y1="6" y2="18"></line>
                <line x1="6" x2="18" y1="6" y2="18"></line>
              </svg>
            </button>
          `

          document.body.appendChild(notification)

          // Add close button handler
          document
            .getElementById("close-notification")
            ?.addEventListener("click", function () {
              notification.remove()
            })

          // Auto-remove after 5 seconds
          setTimeout(() => {
            notification.remove()
          }, 5000)
        })

        // Add the button to both containers if they exist
        if (advancedFiltersContainer) {
          advancedFiltersContainer.appendChild(
            advancedFiltersButton.cloneNode(true)
          )
          advancedFiltersContainer.lastChild.addEventListener(
            "click",
            advancedFiltersButton.onclick
          )
        }

        if (advancedFiltersMobileContainer) {
          advancedFiltersMobileContainer.appendChild(
            advancedFiltersButton.cloneNode(true)
          )
          advancedFiltersMobileContainer.lastChild.addEventListener(
            "click",
            advancedFiltersButton.onclick
          )
        }
      }
    } catch (error) {
      console.error("Error hydrating search components:", error)
    }
  })
})()
