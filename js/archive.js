const orderHistory = `
    <tr class="table-row">
        <td class="column-1">
            <input type="checkbox" class="history_archive" />
        </td>
        <td class="column-4 history_title"></td>
        <td class="column-1 history_size"></td>
        <td class="column-1 history_quantity"></td>
        <td class="column-1 history_price"></td>
        <td class="column-1 history_orderdate"></td>
        <td class="column-1 history_orderid" hidden></td>
        <td class="column-1 history_cartid" hidden></td>
    </tr>
`;

$(document).ready(function(e) {
  getUserList();

  $('#btn-search').on('click', function() {
    if (parseInt($('#archiveUser').val()) === 0) {
      swal('Please select a user! ');
    } else {
      const userid = parseInt($('#archiveUser').val());
      getOrderHistory(userid);
    }
  });

  $('#btn-archive').on('click', function() {
    if (parseInt($('#archiveUser').val()) === 0) {
      swal('Please select a user! ');
    } else if ($('.archive tbody tr').length === 0) {
      swal('Nothing to archive!');
    } else {
      const userid = parseInt($('#archiveUser').val());
      let cartids = [];
      let orderids = [];
      $('.archive tbody tr').each(function(index, row) {
        const $row = $(row);
        const checked = $row.find('input')[0].checked;
        if (checked) {
          const cartid = $row.find('.history_cartid').text();
          const orderid = $row.find('.history_orderid').text();
          cartids.push(cartid);
          orderids.push(orderid);
        }
      });

      archiveHistory(cartids, orderids, userid);
    }
  });
});

function getUserList() {
  $.ajax({
    method: 'GET',
    url: '/users',
    success: res => {
      if (res.success == 0) handle_error(res.error);
      else {
        res.data.rows.forEach(row => {
          const option = `<option value="${row.user_id}">${row.email}</option>`;
          $('#archiveUser').append(option);
        });
      }
    }
  });
}

function getOrderHistory(userid) {
  $.ajax({
    method: 'GET',
    url: '/orderhistory/' + userid,
    success: res => {
      if (res.success == 0) handle_error(res.error);
      else {
        //  console.log(res.data);
        if (res.data.rowCount === 0) {
          $('.archive').empty();
          $('.archive').removeClass('table-shopping-cart');
          $('.archive').append(
            `<tr><td> Your don't have any order! </td></tr>`
          );
        } else {
          $('.table-row').empty();

          res.data.rows.forEach(row => {
            const $history = $(orderHistory);

            $history.find('.history_title').text(row.title);
            $history.find('.history_size').text(row.description);
            $history
              .find('.history_price')
              .text(parseFloat(row.price).toFixed(2));
            $history.find('.history_quantity').text(row.quantity);
            $history.find('.history_orderdate').text(row.order_date);
            $history.find('.history_orderid').text(row.order_id);
            $history.find('.history_cartid').text(row.cart_id);

            $('.archive').append($history);
          });
        }
      }
    }
  });
}

function archiveHistory(cartids, orderids, userid) {
  $.ajax({
    method: 'PUT',
    url: '/orderhistory/' + userid,
    data: {
      cartids: JSON.stringify(cartids),
      orderids: JSON.stringify(orderids)
    },
    success: res => {
      if (res.success == 0) handle_error(res.error);
      else {
        $.ajax({
          method: 'GET',
          url: '/archive/' + userid,
          data: {
            cartids: JSON.stringify(cartids),
            orderids: JSON.stringify(orderids)
          },
          success: res => {
            if (res.success === 0) handle_error(res.error);
            else {
              getOrderHistory(userid);
              swal('Selected order history has been archived ! ');
            }
          }
        });
      }
    }
  });
}
