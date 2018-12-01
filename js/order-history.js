const orderHistory = `
    <tr class="table-row">
        <td class="column-4 history_title"></td>
        <td class="column-1 history_size"></td>
        <td class="column-1 history_quantity"></td>
        <td class="column-1 history_price"></td>
        <td class="column-1 history_orderdate"></td>
    </tr>
`;
$(document).ready(function(e) {
  getOrderHistory();
});

function getOrderHistory() {
  $.ajax({
    method: "GET",
    url: "/orderhistory/0", //current user: userid=0
    success: res => {
      if (res.success == 0) handle_error(res.error);
      else {
        console.log(res.data);
        if (res.data.rowCount === 0) {
          $(".history").empty();
          $(".history").removeClass("table-shopping-cart");
          $(".history").append(
            `<tr><td> Your don't have any order! </td></tr>`
          );
        } else {
          $(".table-row").empty();

          res.data.rows.forEach(row => {
            const $history = $(orderHistory);
            $history.find(".history_title").text(row.title);
            $history.find(".history_size").text(row.description);
            $history
              .find(".history_price")
              .text(parseFloat(row.price).toFixed(2));
            $history.find(".history_quantity").text(row.quantity);
            $history.find(".history_orderdate").text(row.order_date);

            $(".history").append($history);
          });
        }
      }
    }
  });
}
