const itemListHTML = `
     <div class="col-sm-12 col-md-6 col-lg-4 p-b-50">
         <!-- Block2 -->
         <div class="block2">
             <div class="block2-img wrap-pic-w of-hidden pos-relative block2-labelnew" id="itemLabel">
                 <img alt="IMG-PRODUCT" id="itemImage">

                 <div class="block2-overlay trans-0-4">
                     <!--<a href="#" class="block2-btn-addwishlist hov-pointer trans-0-4">
                         <i class="icon-wishlist icon_heart_alt" aria-hidden="true"></i>
                         <i class="icon-wishlist icon_heart dis-none" aria-hidden="true"></i>
                     </a>-->

                     <div class="block2-btn-addcart w-size1 trans-0-4">
                         <!-- Button -->
                         <button class="flex-c-m size1 bg4 bo-rad-23 hov1 s-text1 trans-0-4" onclick="addToCart()" >
                             Add to Cart
                         </button>
                     </div>
                 </div>
             </div>

             <div class="block2-txt p-t-20">
                 <a href="javascript:void(0);" class="block2-name dis-block s-text3 p-b-5" onclick="getItemDetails(event)" id="itemLink">
                    <span id="itemId" hidden></span><span id="itemTitle"></span>
                 </a>

                 <span class="block2-price m-text6 p-r-5">
                     $<span id="itemPrice"></span>
                 </span>
             </div>  
         </div>
     </div>
`;
var weather = 0;
function getitems() {
  $.ajax({
    method: 'GET',
    url: '/items',
    success: res => {
      if (res.success == 0) handle_error(res.error);
      else {
        res.data.rows.forEach(row => {
          const $itemList = $(itemListHTML);
          item = $itemList.find('#itemTitle').text(row.title);
          i = item[0].innerHTML;
          if (weather > 14) {
            if (i.includes('shorts')) {
              $itemList.find('#itemImage').attr('src', row.picture);
              $itemList.find('#itemId').text(row.item_id);
              //$itemList.find("#itemTitle").text(row.title);
              $itemList.find('#itemPrice').text(row.price);
              $('#item-list').append($itemList);
            }
          } else {
            if (i.includes('jacket')) {
              $itemList.find('#itemImage').attr('src', row.picture);
              $itemList.find('#itemId').text(row.item_id);
              $itemList.find('#itemPrice').text(row.price);
              $('#item-list').append($itemList);
            }
          }
          //$itemList.find("#itemImage").attr("src", row.picture);
          //$itemList.find("#itemId").text(row.item_id);
          //$itemList.find("#itemTitle").text(row.title);
          //$itemList.find("#itemPrice").text(row.price);
          if (row.sale == true) {
            $itemList
              .find('#itemLabel')
              .removeClass('block2-labelnew')
              .addClass('block2-labelsale');
          }
          //$("#item-list").append($itemList);
        });
      }
    }
  });
}

function addToCart() {
  console.log('add to cart');
}

function getItemDetails(event) {
  const itemId = $(event.target)
    .siblings('span')
    .text();
  window.location.href = '/product-detail?itemid=' + itemId;
}

$(document).ready(function(e) {
  $.ajax({
    method: 'GET',
    url: '/recommend',
    success: res => {
      if (res.success == 0) console.log(res.error);
      else {
        weather = res.w;
        console.log(weather);
        getitems();
      }
    }
  });
});
