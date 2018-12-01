const cartItem = `
<tr class="table-row">
    <td class="column-1">
        <div class="cart-img-product b-rad-4 o-f-hidden">
            <span class="cart_id" hidden></span>
            <img alt="IMG-PRODUCT" class="cart_image">
        </div>
    </td>
    <td class="column-4 cart_title"></td>
    <td class="column-1 cart_size"></td>
    <td class="column-1 cart_price"></td>
    <td class="column-1 cart_quantity"></td>
    <td class="column-1 cart_total"></td>
    <td class="column-3">
        <button class="flex-c-m size1 bg0 bo-rad-20 hov1 s-text1 trans-0-4" onclick="removeItem(event)" >
            Remove
        </button>
    </td>
</tr>
`;

$(document).ready(function(e) {
  getCartItems();

  $('.checkout').on('click', function() {
    const num = parseInt($('.header-icons-noti').text());
    if (num === 0) {
      swal("You don't have anything to check out! ");
    } else {
      checkoutItems();
    }
  });

  // $("#remove-item").on("click", function() {});
});

function removeItem(e) {
  const $element = $(e.target)
    .parent('td')
    .parent('tr');
  const cartid = $element.find('.cart_id').text();

  $.ajax({
    method: 'DELETE',
    url: '/cartitem/' + cartid,
    success: res => {
      if (res.success == 0) handle_error(res.error);
      else {
        swal('You have deleted this item from your shopping cart ! ');
        updateNumberOfCartItems();
        getCartItems();
      }
    }
  });
}

function getCartItems() {
  $.ajax({
    method: 'GET',
    url: '/cartitems',
    success: res => {
      if (res.success == 0) handle_error(res.error);
      else {
        window.sessionStorage.clear();
        console.log(res.data);
        if (res.data.rowCount === 0) {
          $('.cartItem').empty();
          $('.cartItem').removeClass('table-shopping-cart');
          $('.cartItem').append(`<tr><td> Your cart is empty! </td></tr>`);
          $('.cartTotal').text('$ 0');
        } else {
          $('.table-row').empty();
          let cartTotal = 0;
          let checkoutItems = [];

          res.data.rows.forEach(row => {
            //console.log(row);
            const $cartItem = $(cartItem);
            $cartItem.find('.cart_id').text(row.cart_id);
            $cartItem.find('.cart_title').text(row.title);
            $cartItem.find('.cart_size').text(row.description);
            // $cartItem.find("#cart_size_id").text(row.sizeid);
            $cartItem
              .find('.cart_price')
              .text(parseFloat(row.price).toFixed(2));
            $cartItem.find('.cart_image').attr('src', row.picture);
            $cartItem.find('.cart_quantity').text(row.quantity);
            const total = parseFloat(
              parseFloat(row.price) * parseInt(row.quantity)
            );
            cartTotal += total;
            $cartItem.find('.cart_total').text(total.toFixed(2));
            row.price = parseFloat(row.price);
            row.total_price = total;
            checkoutItems.push(row);
            $('.cartItem').append($cartItem);
          });

          $('.cartTotal').text('$ ' + cartTotal.toFixed(2));

          //console.log(JSON.stringify(checkoutItems));
          window.sessionStorage.setItem(
            'checkoutItems',
            JSON.stringify(checkoutItems)
          );
        }
      }
    }
  });
}

function checkoutItems() {
  let cartItems = window.sessionStorage.getItem('checkoutItems');

  $.ajax({
    method: 'POST',
    url: '/orders',
    data: JSON.stringify({
      items: cartItems
    }),
    contentType: 'application/json',
    dataType: 'json',
    success: res => {
      if (res.success == 0) handle_error(res.error);
      else {
        swal('You have successfully purchased! ');
        getCartItems();
        updateNumberOfCartItems();
      }
    }
  });
}
