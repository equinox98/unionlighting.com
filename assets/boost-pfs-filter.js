// Override Settings
var boostPFSFilterConfig = {
	general: {
		limit: boostPFSThemeConfig.custom.products_per_page,
		/* Optional */
		//loadProductFirst: true,
		showLimitList: '24,36,48',
		collapseOnMobileByDefault: true,
		//paginationType: boostPFSThemeConfig.custom.pagination == 'infinite_scroll' ? 'infinite' : (boostPFSThemeConfig.custom.pagination == 'click_to_load' ? 'load_more' : 'default'),
		//filterTreeMobileStyle: 'style1'
	},
};

// Declare Templates
var boostPFSTemplate = {
	// Grid Template
	'productGridItemHtml': '<li class="{{customClass}}" data-product-item tabindex="1" data-boost-theme-quickview="{{itemId}}">' +
								'{{itemJson}}' +
								'<article id="{{itemHandle}}" class="productitem" data-product-item-content>' +
									'<a class="productitem--image-link" href="{{itemUrl}}" data-product-page-link>' +
										'<figure class="productitem--image" data-product-item-image>' +
											'{{itemImages}}' +
											'{{itemLabels}}' +
										'</figure>' +
									'</a>' +
									'<div class="productitem--info">' +
										'{{itemSwatchesAlways}}' +
										'{{emphasizePrice}}'  +
										'{{itemVendor}}' +
										'<h2 class="productitem--title">' +
											'<a href="{{itemUrl}}" tabindex="1" data-product-page-link>' +
												'{{itemTitle}}' +
											'</a>' +
										'</h2>' +
										'{{noEmphasizePrice}}'  +
										'{{itemReviews}}' +
										'{{itemSwatchesOnHover}}' +
										'{{itemDescription}}' +
									'</div>' +
									'<div class="productitem--actions" data-product-actions>'+
										'<div class="productitem--listview-price">{{itemPrice}}</div>' +
										'<div class="productitem--listview-badge">{{itemLabels}}</div>' +
										'{{itemActions}}' +
									'</div>' +
								'</article>' +
								'{{itemQuickShopSettings}}' +
							'</li>',

	// Pagination Template
	'previousActiveHtml': '<li class="pagination--previous"><a class="bc-pagination--item" href="{{itemUrl}}"><span class="pagination--chevron-left" aria-hidden="true"><svg aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" > <g fill="currentColor" fill-rule="evenodd"> <polygon class="icon-chevron-down-left" points="4 5.371 7.668 1.606 6.665 .629 4 3.365"/> <polygon class="icon-chevron-down-right" points="4 3.365 1.335 .629 1.335 .629 .332 1.606 4 5.371"/> </g> </svg></span>' + boostPFSConfig.label.prev + '</a></li>',
	'previousDisabledHtml': '',
	'nextActiveHtml': '<li class="pagination--next"><a class="bc-pagination--item" href="{{itemUrl}}">' + boostPFSConfig.label.next + '<span class="pagination--chevron-right" aria-hidden="true"><svg aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" > <g fill="currentColor" fill-rule="evenodd"> <polygon class="icon-chevron-down-left" points="4 5.371 7.668 1.606 6.665 .629 4 3.365"/> <polygon class="icon-chevron-down-right" points="4 3.365 1.335 .629 1.335 .629 .332 1.606 4 5.371"/> </g> </svg></span></a></li>',
	'nextDisabledHtml': '',
	'pageItemHtml': '<li><a class="bc-pagination--item" href="{{itemUrl}}">{{itemTitle}}</a></li>',
	'pageItemSelectedHtml': '<li class="pagination--active"><span class="pagination--item">{{itemTitle}}</span></li>',
	'pageItemRemainHtml': '<li class="pagination--ellipsis"><span class="pagination--item">{{itemTitle}}</span></li>',
	'paginateHtml': '<div class="bc-pagination--container"><ul class="pagination--inner">{{previous}}{{pageItems}}{{next}}</ul></div>',

	// Sorting Template
    'sortingHtml':  '<label class="utils-sortby-title" for="boost-pfs-filter-top-sorting-select">' + boostPFSConfig.label.sorting + '</label>' +
                    '<div class="utils-sortby-select form-field-select-wrapper no-label">' +
                        '<select class="boost-pfs-filter-top-sorting-select utils-sortby-select form-field-select" class="form-field form-field-select">{{sortingItems}}</select>' +
                        '<svg aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" > <g fill="currentColor" fill-rule="evenodd"> <polygon class="icon-chevron-down-left" points="4 5.371 7.668 1.606 6.665 .629 4 3.365"/> <polygon class="icon-chevron-down-right" points="4 3.365 1.335 .629 1.335 .629 .332 1.606 4 5.371"/> </g> </svg>' +
                    '</div>',

	// Show limit Template
	'showLimitHtml': '<li><span class="utils-showby-title">' + boostPFSConfig.label.show_per_page + '</span></li>{{showLimitItems}}',
};

(function () {
	BoostPFS.inject(this);

	// Build Product Grid Item
	ProductGridItem.prototype.compileTemplate = function (data) {
		if (!data) data = this.data;
		/*** Prepare data ***/
		var images = data.images_info;
		// Displaying price base on the policy of Shopify, have to multiple by 100
		var soldOut = !data.available; // Check a product is out of stock
		var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
		var priceVaries = data.price_min != data.price_max; // Check a product has many prices
		// Get First Variant (selected_or_first_available_variant)
		var firstVariant = data['variants'][0];
		if (Utils.getParam('variant') !== null && Utils.getParam('variant') != '') {
			var paramVariant = data.variants.filter(function (e) { return e.id == Utils.getParam('variant'); });
			if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
		} else {
			for (var i = 0; i < data['variants'].length; i++) {
				if (data['variants'][i].available) {
					firstVariant = data['variants'][i];
					break;
				}
			}
		}
		/*** End Prepare data ***/

		// Get Template
		var itemHtml = boostPFSTemplate.productGridItemHtml;

		// Add custom class
		var customClass = 'productgrid--item imagestyle--' + boostPFSConfig.custom.product_grid_image_style;
		if (onSale) customClass += ' productitem--sale';
		if (boostPFSConfig.custom.emphasize_price) customClass += ' productitem--emphasis';
		itemHtml = itemHtml.replace(/{{customClass}}/g, customClass);

		var itemImages = '';
		if (images.length > 0) {
			if (images.length > 1 && boostPFSConfig.custom.product_grid_show_second_image) {
				itemImages += buildImage(images[1], '100x', 'productitem--image-alternate');
			}
			itemImages += buildImage(images[0], '100x', 'productitem--image-primary');
		} else {
			itemImages += '<img alt="{{itemTitle}}" src="{{itemThumbUrl}}">';
		}
		itemHtml = itemHtml.replace(/{{itemImages}}/g, itemImages);

		// Add Thumbnail
		var itemThumbUrl = images.length > 0 ? Utils.optimizeImage(images[0]['src'], '384x') : boostPFSConfig.general.no_image_url;
		itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, itemThumbUrl);

		// Add Label
		var itemLabelsHtml = '';
		if (soldOut) {
			itemLabelsHtml += '<span class="productitem--badge badge--soldout">' + boostPFSConfig.label.sold_out + '</span>';
		} else {
			if (onSale && boostPFSConfig.custom.product_sales_badge) {
				var savePrice = data.compare_at_price_min - data.price_min;
                var percentOff = Math.round(((data.compare_at_price_min - data.price_min)*100)/data.compare_at_price_min);
				var savePriceHtml = '<span class="money" data-price-money-saved>' + Utils.formatMoney(savePrice) + '</span>';
				var percentSavePriceHtml = '<span data-price-percent-saved>' + percentOff + '</span>';
				itemLabelsHtml += '<span class="productitem--badge badge--sale" data-badge-sales>';
				switch (boostPFSConfig.custom.product_sales_badge_style) {
					case 'percentile':
						itemLabelsHtml += boostPFSConfig.label.sale_percentile_html.replace(/{{ saved }}/g, percentSavePriceHtml);
						break;
					case 'money':
						itemLabelsHtml += boostPFSConfig.label.sale_money_html.replace(/{{ saved }}/g, Utils.formatMoney(savePrice));
						break;
					default:
						itemLabelsHtml += boostPFSConfig.label.sale;
						break;
				}
				itemLabelsHtml += '</span>';
			}
		}
		itemHtml = itemHtml.replace(/{{itemLabels}}/g, itemLabelsHtml);

		// Add Price
		var priceHtml = '';
		var classVaries = priceVaries ? 'price--varies' : '';
		var visibleClass = onSale || boostPFSConfig.custom.emphasize_price ? 'visible' : '';
		priceHtml += '<div class="productitem--price ' + classVaries + '">';
		priceHtml += '<div class="price--compare-at ' + visibleClass + '" data-price-compare-at>';
		var comparePrice = '<span class="money">' + Utils.formatMoney(data.compare_at_price_min) + '</span>';
		if (priceVaries && onSale) {
			priceHtml += boostPFSConfig.label.range_html.replace(/{{ price }}/g, comparePrice);
		} else {
			if (onSale) {
				priceHtml += comparePrice;
			} else {
				if (boostPFSConfig.custom.emphasize_price) {
					priceHtml += '<span class="price--spacer"></span>';
				} else {
					priceHtml += '<span class="money"></span>';
				}
			}
		}
  
		priceHtml += '</div>';
		priceHtml += '<div class="price--main" data-price>';
		var price = '<span class="money">' + Utils.formatMoney(data.price_min) + '</span>';
		if (priceVaries) {
			priceHtml += boostPFSConfig.label.range_html.replace(/{{ price }}/g, price);
		} else {
			priceHtml += price;
		}
      
		priceHtml += '</div>';
		priceHtml += '</div>';
     
		// Add emphasize price
		var emphasizePriceHtml = '';
		var noEmphasizePriceHtml = '';
		if (boostPFSConfig.custom.emphasize_price) {
			emphasizePriceHtml += priceHtml;
		} else {
			noEmphasizePriceHtml += priceHtml;
		}
		itemHtml = itemHtml.replace(/{{emphasizePrice}}/g, emphasizePriceHtml);
		itemHtml = itemHtml.replace(/{{noEmphasizePrice}}/g, noEmphasizePriceHtml);
		itemHtml = itemHtml.replace(/{{itemPrice}}/g, priceHtml);

		// Add vendor
		var itemVendorHtml = '';
		if (boostPFSConfig.custom.show_vendor && data.vendor !== '') {
			itemVendorHtml += '<h3 class="productitem--vendor">' + data.vendor + '</h3>';
		}
		itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

		// Add review rating
		var itemReviewsHtml = '';
		if (boostPFSConfig.custom.product_ratings_reviews) {
			itemReviewsHtml += '<div class="productitem--ratings"><span class="shopify-product-reviews-badge" data-id="{{itemId}}"></span></div>';
		}
		itemHtml = itemHtml.replace(/{{itemReviews}}/g, itemReviewsHtml);

		// Add swatches
		var itemSwatchesHtml = buildSwatch(data);
		if (boostPFSConfig.custom.swatches_product_card_hover == 'on-hover'){
			itemHtml = itemHtml.replace(/{{itemSwatchesAlways}}/g, '');
			itemHtml = itemHtml.replace(/{{itemSwatchesOnHover}}/g, itemSwatchesHtml);
		} else {
			itemHtml = itemHtml.replace(/{{itemSwatchesAlways}}/g, itemSwatchesHtml);
			itemHtml = itemHtml.replace(/{{itemSwatchesOnHover}}/g, '');
		}

		// Add description
		var itemDescriptionHtml = '';
		if (data.body_html) {
			var description = jQ('<div></div>').html(data.body_html).text(); // Strips html tags
			itemDescriptionHtml += '<div class="productitem--description">';
			itemDescriptionHtml += '<p>' + (description.length > 150 ? description.substring(0, 150) : description) + '</p>';
			if (description.length > 150){
				itemDescriptionHtml += '<a href="{{itemUrl}}" class="productitem--link" data-product-page-link>' + boostPFSConfig.label.view_details + '</a>'
			}
			itemDescriptionHtml += '</div>';
		}
		itemHtml = itemHtml.replace(/{{itemDescription}}/g, itemDescriptionHtml);

		// Add data json
		var itemJson = {
			"id": data.id,
			"title": data.title,
			"handle": data.handle,
			"vendor": data.vendor,
			"variants": data.variants,
			"url": Utils.buildProductItemUrl(data),
			"options_with_values": data.options_with_values,
			"images": data.images,
			"available": data.available,
			"price_min": data.price_min,
			"price_max": data.price_max,
			"compare_at_price_min": data.compare_at_price_min,
			"compare_at_price_max": data.compare_at_price_max
		};
		itemHtml = itemHtml.replace(/{{itemJson}}/g, '<script type="application/json" data-product-data>' + JSON.stringify(itemJson) + '</script>');

		// Add quickBtn
		var itemActionsHtml = buildActions(data, firstVariant);
		itemHtml = itemHtml.replace(/{{itemActions}}/g, itemActionsHtml);

		// Add main attribute (Always put at the end of this function)
		itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
		itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
		itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
		itemHtml = itemHtml.replace(/{{itemUrl}}/g, Utils.buildProductItemUrl(data));

		var itemQuickShopSettings = '';
		if (boostPFSConfig.custom.enable_quick_buy) {
			itemQuickShopSettings += '<script type="application/json" data-quick-buy-settings>';
			itemQuickShopSettings += '{';
			itemQuickShopSettings += '"cart_redirection": ' + boostPFSConfig.custom.quickshop_product_cart_redirect + ','
			itemQuickShopSettings += '"money_format": "' + boostPFSConfig.custom.money_format + '"'
			itemQuickShopSettings += '}'
			itemQuickShopSettings += '</script>';
		}
		itemHtml = itemHtml.replace(/{{itemQuickShopSettings}}/g, itemQuickShopSettings);

		return itemHtml;
	};

	// Build Product List Item
	ProductListItem.prototype.compileTemplate = function (data) {
		return ProductGridItem.compileTemplate(data);
	};

	function buildActions(data, firstVariant){
		var actionsHtml = '';
		var has_variants = firstVariant['option_title'] == 'Default Title' ? false : true;

		if (boostPFSConfig.custom.enable_quick_look != 'disabled' || boostPFSConfig.custom.enable_quick_buy != 'disabled') {
			var quick_look_text = boostPFSConfig.label.quick_look_text;
			var quick_buy_text = boostPFSConfig.label.quick_buy_text;
			var quick_look_classes = 'productitem--action-trigger productitem--action-qs button-secondary';
			var quick_buy_classes = 'productitem--action-trigger productitem--action-atc button-primary';
			var atcDesktopClass = boostPFSConfig.custom.enable_quick_buy == 'desktop' ? 'productitem-action--desktop' : '';
			var qsDesktopClass = boostPFSConfig.custom.enable_quick_look == 'desktop' ? 'productitem-action--desktop' : '';

			if (has_variants) {
				quick_buy_text = boostPFSConfig.label.quick_choose_options;
			}
			if (!data.available) {
				quick_buy_text = boostPFSConfig.label.sold_out;
				quick_buy_classes = quick_buy_classes + ' disabled';
			}
			//actionsHtml += '<div class="productitem--actions" data-product-actions>';

			if (boostPFSConfig.custom.enable_quick_buy) {
				if (!has_variants) {
					var temp = ' data-quick-buy ';
				} else {
					var temp = '  data-quickshop-trigger="slim" ';
				}
				actionsHtml += '<div class="productitem--action quickshop-button ' + atcDesktopClass + '">' +
									'<button class="' + quick_buy_classes + '" tabindex="1" type="button" aria-label="' + quick_buy_text + '"' +
									temp + 'data-variant-id="' + data.variants[0].id + '"';
				if (!data.available) {
					actionsHtml += ' disabled';
				}
				actionsHtml += '>';
				actionsHtml += '<span class="atc-button--text">' + quick_buy_text + '</span>';
				actionsHtml += '<span class="atc-button--icon">';
				actionsHtml += '<svg aria-hidden="true" focusable="false" role="presentation" width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" > <g fill-rule="nonzero" fill="currentColor"> <path d="M13 26C5.82 26 0 20.18 0 13S5.82 0 13 0s13 5.82 13 13-5.82 13-13 13zm0-3.852a9.148 9.148 0 1 0 0-18.296 9.148 9.148 0 0 0 0 18.296z" opacity=".29"/><path d="M13 26c7.18 0 13-5.82 13-13a1.926 1.926 0 0 0-3.852 0A9.148 9.148 0 0 1 13 22.148 1.926 1.926 0 0 0 13 26z"/> </g> </svg>';
				actionsHtml += '</span>';
				actionsHtml += '</button>';
				actionsHtml += '</div>';
			}

			if (boostPFSConfig.custom.enable_quick_look) {
				actionsHtml += '<div class="productitem--action atc--button ' + atcDesktopClass + '">' +
									'<button class="'+ quick_look_classes +'"  data-quickshop-trigger="full" data-id="{{itemId}}" type="button" tabindex="1">' + quick_look_text +
									'</button>' +
								'</div>';
			}

			//actionsHtml += '</div>';
		}
		return actionsHtml;
	}

	function buildImage(imageInfo, size, className) {
		if (!imageInfo) {
			imageInfo = {
				src: boostPFSConfig.general.no_image_url,
				width: 480,
				height: 480,
				aspect_ratio: 1
			}
		}

		var html = '<img ' +
			'src="' + Utils.optimizeImage(imageInfo.src, size) + '" ' +
			'class="' + className + '" ' +
			'alt="{{itemTitle}}" ' +
			'data-rimg="lazy" ' +
			'data-rimg-scale="1" ' +
			'data-rimg-template="' + Utils.optimizeImage(imageInfo.src, '{size}') + '" ' +
			'data-rimg-max="' + imageInfo.width + 'x' + imageInfo.height + '" ' +
			'data-rimg-crop ' +
			'srcset="data:image/svg+xml;utf8,<svg%20xmlns=\'http://www.w3.org/2000/svg\'%20width=\''+ imageInfo.width +'\'%20height=\''+ imageInfo.height +'\'></svg>">';

		html += '<div data-rimg-canvas></div>';
		return html;
	}

	function buildSwatch(data) {
		var html = '';
		var swatches = [];
		var swatchValues = [];
		var swatchOptionIndex = 1;
		if (boostPFSConfig.custom.swatches_enable && boostPFSConfig.custom.swatches_swatch_trigger && !boostPFSConfig.custom.swatches_product_page_only){
			var customColors = boostPFSConfig.custom.swatches_custom_colors.split('\n');
			data.variants.forEach(function(variant){
				var swatchValue = '';
				variant.options = variant.merged_options; // Use for theme function
				variant.merged_options.forEach(function(merged_option, index){
					var key = merged_option.split(':')[0].trim();
					var value = merged_option.split(':')[1].trim();
					if (key.toLowerCase() == boostPFSConfig.custom.swatches_swatch_trigger.toLowerCase() && swatchValues.indexOf(value.toLowerCase()) == -1){
						swatchValue = value;
						swatchValues.push(value.toLowerCase());
						swatchOptionIndex = index + 1;
					}
				})
				if (swatchValue){
					var swatch ='<label>' +
									'<input class="productitem--swatches-input" type="radio" name="swatch" value="{{swatchValue}}">' +
									'<div class="productitem--swatches-swatch-wrapper" data-swatch-tooltip="{{swatchValue}}" data-swatch>' +
										'<div class="productitem--swatches-swatch">' +
											'<div class="productitem--swatches-swatch-inner" '+
											'style="background-color:{{backgroundColor}}; background-color:{{customColor}}; background-image:url({{backgroundImage}}); background-size:cover"></div>' +
										'</div>' +
									'</div>' +
								'</label>';
					var customColor = '';
					customColors.forEach(function(color){
						if (color.split(':').length == 2){
							var customColorName = color.split(':')[0].trim().toLowerCase();
							var customColorValue = color.split(':')[1].trim().toLowerCase();
							if (customColorName == swatchValue.toLowerCase()){
								customColor = customColorValue;
							}
						}
					})

					var slugifyValue = Utils.slugify(swatchValue);
					var backgroundColor = slugifyValue.split('-').pop();
					var backgroundImage = boostPFSAppConfig.general.file_url.split('?')[0] + slugifyValue + '.png';

					swatch = swatch.replace(/{{swatchValue}}/g, swatchValue);
					swatch = swatch.replace(/{{backgroundColor}}/g, backgroundColor);
					swatch = swatch.replace(/{{backgroundImage}}/g, backgroundImage);
					swatch = swatch.replace(/{{customColor}}/g, customColor);
					swatches.push(swatch);
				}
			})

			if (swatchValues.length > 0){
				var html = '';
				if (boostPFSConfig.custom.swatches_product_card_hover == 'on-hover'){
					var swatchesCountLabel = swatchValues.length > 1 ? boostPFSConfig.label.swatches_count_other : boostPFSConfig.label.swatches_count_one;
					swatchesCountLabel = swatchesCountLabel.replace(/{{ count }}/g, swatchValues.length);
					html += '<div class="productitem--swatches-summary">' + swatchesCountLabel + '</div>';
				}
				html +=  '<div class="productitem--swatches productitem--swatches-show-'+ boostPFSConfig.custom.swatches_product_card_hover +'" data-swatches>' +
							'<script type="application/json" data-swatch-data>' +
							'{' +
								'"hash": "{{itemDataSha256}}",' +
								'"swatchOptionKey": "{{swatchOptionKey}}",' +
								'"swatchesProductCardHover": "'+ boostPFSConfig.custom.swatches_product_card_hover + '"' +
							'}' +
							'</script>' +
							'<form class="productitem--swatches-container" data-swatches-container>' +
								swatches.join(' ') +
							'</form>' +
							(
							boostPFSConfig.custom.swatches_product_card_hover == 'on-hover' ?
							'' :
							'<div class="productitem--swatches-count-wrapper" data-swatch-count-wrapper>' +
								'<div class="productitem--swatches-count" data-swatch-count>+</div>' +
							'</div>'
							) +
						'</div>';

				html = html.replace(/{{swatchOptionKey}}/g, 'option' + swatchOptionIndex);
				html = html.replace(/{{variantsJson}}/g, JSON.stringify(data.variants));
			}
		}

		return html;
	}

	// Build Pagination
	ProductPaginationDefault.prototype.compileTemplate = function (totalProduct) {

		if (!totalProduct) totalProduct = this.totalProduct;
		// Get page info
		var currentPage = parseInt(Globals.queryParams.page);
		var totalPage = Math.ceil(totalProduct / Globals.queryParams.limit);

		if (totalPage > 1) {
			var paginationHtml = boostPFSTemplate.paginateHtml;

			// Build Previous
			var previousHtml = (currentPage > 1) ? boostPFSTemplate.previousActiveHtml : boostPFSTemplate.previousDisabledHtml;
			previousHtml = previousHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage - 1));
			paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

			// Build Next
			var nextHtml = (currentPage < totalPage) ? boostPFSTemplate.nextActiveHtml : boostPFSTemplate.nextDisabledHtml;
			nextHtml = nextHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage + 1));
			paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

			// Create page items array
			var beforeCurrentPageArr = [];
			for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
				beforeCurrentPageArr.unshift(iBefore);
			}
			if (currentPage - 4 > 0) {
				beforeCurrentPageArr.unshift('...');
			}
			if (currentPage - 4 >= 0) {
				beforeCurrentPageArr.unshift(1);
			}
			beforeCurrentPageArr.push(currentPage);

			var afterCurrentPageArr = [];
			for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
				afterCurrentPageArr.push(iAfter);
			}
			if (currentPage + 3 < totalPage) {
				afterCurrentPageArr.push('...');
			}
			if (currentPage + 3 <= totalPage) {
				afterCurrentPageArr.push(totalPage);
			}

			// Build page items
			var pageItemsHtml = '';
			var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
			for (var iPage = 0; iPage < pageArr.length; iPage++) {
				if (pageArr[iPage] == '...') {
					pageItemsHtml += boostPFSTemplate.pageItemRemainHtml;
				} else {
					pageItemsHtml += (pageArr[iPage] == currentPage) ? boostPFSTemplate.pageItemSelectedHtml : boostPFSTemplate.pageItemHtml;
				}
				pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
				pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, pageArr[iPage]));
			}
			paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

			return paginationHtml;
		}
		return '';
	};

	// Build Sorting
	ProductSorting.prototype.compileTemplate = function () {
		if (boostPFSTemplate.hasOwnProperty('sortingHtml')) {
			var sortingArr = Utils.getSortingList();
			if (sortingArr) {
				// Build content
				var sortingItemsHtml = '';
				for (var k in sortingArr) {
					sortingItemsHtml += '<option value="' + k + '">' + sortingArr[k] + '</option>';
				}
				var html = boostPFSTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
				return html;
			}
		}
		return '';
	};

	// Build Show Limit
	ProductLimit.prototype.compileTemplate = function () {
		if (boostPFSTemplate.hasOwnProperty('showLimitHtml')) {

			var numberList = Settings.getSettingValue('general.showLimitList');
			if (numberList != '') {
				// Build content
				var showLimitItemsHtml = '';
				var arr = numberList.split(',');
				for (var k = 0; k < arr.length; k++) {
					if (arr[k] == Globals.queryParams.limit) {
						showLimitItemsHtml += '<li><a class="utils-showby-item active" href="' + arr[k] + '">' + arr[k] + '</a></li>';
					} else {
						showLimitItemsHtml += '<li><a class="utils-showby-item" href="' + arr[k] + '">' + arr[k] + '</a></li>';
					}
				}
				var html = boostPFSTemplate.showLimitHtml.replace(/{{showLimitItems}}/g, showLimitItemsHtml);
				return html;
			}
		}
		return '';
	};

	ProductLimit.prototype.bindEvents = function () {
		var _this = this;
		jQ(Selector.topShowLimit + ' li a').click(function(e) {
			event.preventDefault();
			Globals.internalClick = true;
			FilterApi.setParam('limit', jQ(this).attr('href'));
			FilterApi.applyFilter();
		})
	};

	// Build Breadcrumb
	Breadcrumb.prototype.compileTemplate = function (colData, apiData) {
		if (typeof colData !== 'undefined' && colData.hasOwnProperty('collection')) {
			var colInfo = colData.collection;
			var delimiter = '<span class="breadcrumbs-delimiter" aria-hidden="true"><svg aria-hidden="true" focusable="false" role="presentation" xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5"><path fill="currentColor" fill-rule="evenodd" d="M1.002.27L.29.982l3.712 3.712L7.714.982 7.002.27l-3 3z"/></svg></span>';
			var breadcrumbHtml = '<a href="/">' + boostPFSConfig.label.breadcrumb_home + '</a> ';
			breadcrumbHtml += delimiter;
			breadcrumbHtml += ' <span>' + colInfo.title + '</span>';
			return breadcrumbHtml;
		}
		return '';
	};

	// Build Display type event
	ProductDisplayType.prototype.bindEvents = function () {
		// Fix heigh issue on list view
		jQ('#boost-pfs-filter-products li[data-product-item]').css('height', 'initial').css('min-height', 'initial').css('max-height', 'initial');

		// Bind events
		var _this = this;
		jQ(Selector.topDisplayType + ' button').off('click');
		jQ(Selector.topDisplayType + ' button').on('click', function (e) {
			var newValue = jQ(this).attr('data-display-type');
			sessionStorage.setItem('data-display-type', newValue);
			jQ(this).parent().children('button').removeClass('active');
			jQ(this).addClass('active');
			if (newValue == 'list-view') {
				jQ('.productgrid--outer').removeClass('productgrid-gridview');
				jQ('.productgrid--outer').addClass('productgrid-listview');

				// Fix heigh issue on list view
				jQ('#boost-pfs-filter-products li[data-product-item]').each(function(){
					var height = jQ(this).height() + 'px';
					jQ(this).css('height', height).css('min-height', height).css('max-height', height);
				});
			} else {
				jQ('.productgrid--outer').removeClass('productgrid-listview');
				jQ('.productgrid--outer').addClass('productgrid-gridview');

				// Fix heigh issue on list view
				jQ('#boost-pfs-filter-products li[data-product-item]').css('height', 'initial').css('min-height', 'initial').css('max-height', 'initial');
			}
		});
	};

	// Add additional feature for product list, used commonly in customizing product list
	ProductList.prototype.afterRender = function (data, eventType) {
		if (!data) data = this.data;
		// Build Quick view data
		if (boostPFSConfig.custom.enable_quick_buy || boostPFSConfig.custom.enable_quick_look) {
			this.buildExtrasProductListByAjax(data, 'boost-pfs-quickview', function(results) {
				results.forEach(function(result) {
					if (jQ('[data-boost-theme-quickview="'+ result.id +'"] .productitem-quickshop').length == 0) {
						jQ('[data-boost-theme-quickview="'+ result.id +'"]').append(result.quickview);
						jQ('[data-boost-theme-quickview="'+ result.id +'"] .productitem--action').css('display', 'block');
					}
				});
				buildTheme();
			});
		} else {
			buildTheme();
		}
	};

	// Build additional elements
	FilterResult.prototype.afterRender = function (data, eventType) {

		if (!data) data = this.data;
		// Build search page breadcrumbs
		// if (Utils.isSearchPage()) {
		// 	var content = '';
		// 	var searchTerm = Utils.escape(Utils.getSearchTerm());
		// 	if (searchTerm != null) {
		// 		content = boostPFSConfig.label.search_breadcrumbs_count_other;
		// 		if (data.total_product == 1) {
		// 			content = boostPFSConfig.label.search_breadcrumbs_count_one;
		// 		} else if (data.total_product == 0) {
		// 			content = boostPFSConfig.label.search_breadcrumbs_count_zero;
		// 		}
		// 		content = content.replace(/{{ count }}/g, data.total_product).replace(/{{ terms }}/g, searchTerm);
		// 		content = content.replace(/&lt;strong&gt;/g, '<strong>').replace(/&lt;\/strong&gt;/g, '</strong>');
		// 	}
		// 	jQ('.breadcrumbs-container span:last-child').html(content);
		// 	jQ('.breadcrumbs-container span').css('display', 'inline-block');
		// }
	};

	function buildTheme() {
		// In superstore.js or superstore.min.js:
		// - Add "var bcSections; var bcStaticCollection;" to the begining
		// - Find "var sections = new Sections();", replace like below:

		// var sections = new Sections();
		// bcSections = sections;
		// bcStaticCollection = StaticCollection_StaticCollection;
		// sections.register....

		// Clear recently viewed
		// if (jQ('[data-recently-viewed-container]').length > 0) {
		// 	jQ('[data-recently-viewed-container]').html('');
		// }

		// Reinit theme
		if (window.bcSections && window.bcStaticCollection){
			bcSections.unbind('static-collection');
			bcSections.register('static-collection', function (section) {
				return new bcStaticCollection(section);
			});
		}
		if (window.bcImage){
			bcImage.init('[data-rimg="lazy"]', {
				round: 1
			});
		}

		var display = sessionStorage.getItem('data-display-type');
		if (display == 'list-view'){
			jQ('[data-display-type="list-view"]').click();
		} else {
			jQ('[data-display-type="grid-view"]').click();
		}
	}

})();