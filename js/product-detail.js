function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars;
}

function getSizeList() {
  $.ajax({
    method: 'GET',
    url: '/sizes',
    success: res => {
      if (res.success == 0) handle_error(res.error);
      else {
        res.data.rows.forEach(row => {
          const option = `<option value="${row.size_id}">${
            row.description
          }</option>`;
          $('#size').append(option);
        });
      }
    }
  });
}

$(document).ready(function(e) {
  const itemId = parseInt(getUrlVars()['itemid']);

  if (!itemId) window.location.href = '/product';
  else {
    $.ajax({
      method: 'GET',
      url: '/item/' + itemId,
      success: res => {
        if (res.success == 0) handle_error(res.error);
        else {
          const result = res.data.rows[0];
          $('#detail_item_id').text(result.item_id);
          $('#detail_title').text(result.title);
          $('#detail_price').text(result.price);
          $('#detail_description').text(result.description);
          $('#detail_image').attr('src', result.picture);
          $('#detail_stock').text(result.stock);
        }
      }
    });

    getSizeList();
  }
});
