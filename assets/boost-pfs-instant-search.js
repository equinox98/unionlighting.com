// Override Settings
var boostPFSInstantSearchConfig = {
	search: {
		//suggestionMode: 'test',
		//suggestionPosition: 'left',
      suggestionMobileStyle: 'style2', // style1, style2
	}
};

(function () {  // Add this
	
	BoostPFS.inject(this);  // Add this
	// Customize style of Suggestion box
	SearchInput.prototype.customizeInstantSearch = function(suggestionElement, searchElement, searchBoxId) {
	};
})();  // Add this at the end