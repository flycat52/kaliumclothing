const itemListHTML = `
     <div class="col-sm-12 col-md-6 col-lg-4 p-b-50">
         <!-- Block2 -->
         <div class="block2">
             <div class="block2-img wrap-pic-w of-hidden pos-relative block2-labelnew" id="itemLabel">
                 <img alt="IMG-PRODUCT" id="itemImage">
             </div>

             <div class="block2-txt p-t-20">
                 <a href="javascript:void(0);" class="block2-name dis-block s-text3 p-b-5" onclick="getItemDetails(event)">
                    <span id="itemId" hidden></span><span id="itemTitle"></span>
                 </a>

                 <span class="block2-price m-text6 p-r-5">
                     $<span id="itemPrice"></span>
                 </span>
             </div>  
         </div>
     </div>
`;
function getitems() {
  $.ajax({
    method: 'GET',
    url: '/items',
    success: res => {
      if (res.success == 0) handle_error(res.error);
      else {
        res.data.rows.forEach(row => {
          const $itemList = $(itemListHTML);
          $itemList.find('#itemImage').attr('src', row.picture);
          $itemList.find('#itemId').text(row.item_id);
          $itemList.find('#itemTitle').text(row.title);
          $itemList.find('#itemPrice').text(row.price);
          if (row.sale == true) {
            $itemList
              .find('#itemLabel')
              .removeClass('block2-labelnew')
              .addClass('block2-labelsale');
          }
          $('#item-list').append($itemList);
        });
      }
    }
  });
}

function getItemDetails(event) {
  const itemId = $(event.target)
    .siblings('span')
    .text();
  window.location.href = '/product-detail?itemid=' + itemId;
}

$(document).ready(function(e) {
  getitems();
});
