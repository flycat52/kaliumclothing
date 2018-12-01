(function($) {
  var username = '';
  var visible = false;
  ('use strict');

  /*[ Load page ]
    ===========================================================*/
  $('.animsition').animsition({
    inClass: 'fade-in',
    outClass: 'fade-out',
    inDuration: 1500,
    outDuration: 800,
    linkElement: '.animsition-link',
    loading: true,
    loadingParentElement: 'html',
    loadingClass: 'animsition-loading-1',
    loadingInner: '<div data-loader="ball-scale"></div>',
    timeout: false,
    timeoutCountdown: 5000,
    onLoadEvent: true,
    browser: ['animation-duration', '-webkit-animation-duration'],
    overlay: false,
    overlayClass: 'animsition-overlay-slide',
    overlayParentElement: 'html',
    transition: function(url) {
      window.location.href = url;
    }
  });

  $('.header-icon1').on('click', function() {
    console.log('click');
    $.ajax({
      url: '/user-info',
      method: 'GET',
      success: function(response) {
        console.log(response);
        log = response.log;
        console.log(log);

        if (response.log === true) {
          console.log('LOGGED');
          var login = document.getElementById('userP');
          console.log(login);
          var loginf = document.getElementById('loginform');
          var views = document.getElementById('pView');
          var logout = document.getElementById('logout');
          login.style.visibility = 'hidden';
          loginf.style.visibility = 'hidden';
          views.style.visibility = 'visible';
          logout.style.visibility = 'visible';
          visible = false;
        } else {
          console.log('UNK');
          var login = document.getElementById('login');
          var loginf = document.getElementById('loginform');

          if (visible === false) {
            console.log('VER');
            login.style.visibility = 'visible';
            loginf.style.visibility = 'visible';
            visible = true;
          } else {
            visible = false;
            login.style.visibility = 'hidden';
            loginf.style.visibility = 'hidden';
          }
        }
      }
    });
    //console.log(log)
  });

  $('#register').on('click', function() {
    var loginf = document.getElementById('loginform');
    loginf.style.visibility = 'hidden';
    var login = document.getElementById('login');
    login.style.visibility = 'hidden';
    location.href = 'register.html';
  });

  $('#signup').on('click', function() {
    var emailsignup = $('#email').val();
    var usernamesignup = $('#username').val();
    var passwordsignup = $('#password').val();
    $.ajax({
      url: '/user/create',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        passwordsignup: passwordsignup,
        usernamesignup: usernamesignup,
        emailsignup: emailsignup
      }),
      success: function(response) {
        console.log(response);
        swal(response.msg, '', response.tag);
        if (response.tag == 'succes') {
          location.href = '/';
        }
      }
    });
  });

  $('#updateP').on('click', function(res) {
    console.log(res);
    console.log('update password');
    var newP = $('#passwordRes').val();
    var userEmail = $('#emailRes').val();
    $.ajax({
      url: '/reset/:',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        password: newP,
        email: userEmail
      }),
      success: function(response) {
        console.log(response);
        location.href = '/';
      }
    });
  });

  /*document.getElementById("register").onclick = function() {
    var loginf = document.getElementById("loginform")
    loginf.style.visibility ='hidden'
    var login = document.getElementById("login")
    login.style.visibility ='hidden'
    location.href = "register.html";
};*/

  /*[ Back to top ]
    ===========================================================*/
  $('.animsition').animsition({
    inClass: 'fade-in',
    outClass: 'fade-out',
    inDuration: 1500,
    outDuration: 800,
    linkElement: '.animsition-link',
    loading: true,
    loadingParentElement: 'html',
    loadingClass: 'animsition-loading-1',
    loadingInner: '<div data-loader="ball-scale"></div>',
    timeout: false,
    timeoutCountdown: 5000,
    onLoadEvent: true,
    browser: ['animation-duration', '-webkit-animation-duration'],
    overlay: false,
    overlayClass: 'animsition-overlay-slide',
    overlayParentElement: 'html',
    transition: function(url) {
      window.location.href = url;
    }
  });

  /*[ Back to top ]
    ===========================================================*/
  var windowH = $(window).height() / 2;

  $(window).on('scroll', function() {
    if ($(this).scrollTop() > windowH) {
      $('#myBtn').css('display', 'flex');
    } else {
      $('#myBtn').css('display', 'none');
    }
  });

  $('#myBtn').on('click', function() {
    $('html, body').animate(
      {
        scrollTop: 0
      },
      300
    );
  });

  /*[ Show header dropdown ]
    ===========================================================*/
  $('.js-show-header-dropdown').on('click', function(event) {
    //$(this).parent().find('.header-dropdown')
    window.location.href = '/cart';
    event.stopPropagation();
  });

  /* [ Update the number of cart items ] */
  updateNumberOfCartItems();
  // let cartItems = JSON.parse(window.sessionStorage.getItem('items'));
  // const num = cartItems ? cartItems.length : 0;
  // $('.header-icons-noti').text(num);
  // $(".js-show-header-dropdown, .header-dropdown").click(function (event) {
  //     event.stopPropagation();
  // });

  /*[ Fixed Header ]
    ===========================================================*/
  var posWrapHeader = $('.topbar').height();
  var header = $('.container-menu-header');

  $(window).on('scroll', function() {
    if ($(this).scrollTop() >= posWrapHeader) {
      $('.header1').addClass('fixed-header');
      $(header).css('top', -posWrapHeader);
    } else {
      var x = -$(this).scrollTop();
      $(header).css('top', x);
      $('.header1').removeClass('fixed-header');
    }

    if ($(this).scrollTop() >= 200 && $(window).width() > 992) {
      $('.fixed-header2').addClass('show-fixed-header2');
      $('.header2').css('visibility', 'hidden');
      $('.header2')
        .find('.header-dropdown')
        .removeClass('show-header-dropdown');
    } else {
      $('.fixed-header2').removeClass('show-fixed-header2');
      $('.header2').css('visibility', 'visible');
      $('.fixed-header2')
        .find('.header-dropdown')
        .removeClass('show-header-dropdown');
    }
  });

  /*[ Show menu mobile ]
    ===========================================================*/
  $('.btn-show-menu-mobile').on('click', function() {
    $(this).toggleClass('is-active');
    $('.wrap-side-menu').slideToggle();
  });

  var arrowMainMenu = $('.arrow-main-menu');

  for (var i = 0; i < arrowMainMenu.length; i++) {
    $(arrowMainMenu[i]).on('click', function() {
      $(this)
        .parent()
        .find('.sub-menu')
        .slideToggle();
      $(this).toggleClass('turn-arrow');
    });
  }

  $(window).resize(function() {
    if ($(window).width() >= 992) {
      if ($('.wrap-side-menu').css('display') == 'block') {
        $('.wrap-side-menu').css('display', 'none');
        $('.btn-show-menu-mobile').toggleClass('is-active');
      }
      if ($('.sub-menu').css('display') == 'block') {
        $('.sub-menu').css('display', 'none');
        $('.arrow-main-menu').removeClass('turn-arrow');
      }
    }
  });

  /*[ remove top noti ]
    ===========================================================*/
  $('.btn-romove-top-noti').on('click', function() {
    $(this)
      .parent()
      .remove();
  });

  /*[ Block2 button wishlist ]
    ===========================================================*/
  $('.block2-btn-addwishlist').on('click', function(e) {
    e.preventDefault();
    $(this).addClass('block2-btn-towishlist');
    $(this).removeClass('block2-btn-addwishlist');
    $(this).off('click');
  });

  /*[ +/- num product ]
    ===========================================================*/
  $('.btn-num-product-down').on('click', function(e) {
    e.preventDefault();
    var numProduct = Number(
      $(this)
        .next()
        .val()
    );
    if (numProduct > 1)
      $(this)
        .next()
        .val(numProduct - 1);
  });

  $('.btn-num-product-up').on('click', function(e) {
    e.preventDefault();
    var numProduct = Number(
      $(this)
        .prev()
        .val()
    );
    $(this)
      .prev()
      .val(numProduct + 1);
  });

  /*[ Show content Product detail ]
    ===========================================================*/
  $('.active-dropdown-content .js-toggle-dropdown-content').toggleClass(
    'show-dropdown-content'
  );
  $('.active-dropdown-content .dropdown-content').slideToggle('fast');

  $('.js-toggle-dropdown-content').on('click', function() {
    $(this).toggleClass('show-dropdown-content');
    $(this)
      .parent()
      .find('.dropdown-content')
      .slideToggle('fast');
  });

  /*[ Play video 01]
    ===========================================================*/
  var srcOld = $('.video-mo-01')
    .children('iframe')
    .attr('src');

  $('[data-target="#modal-video-01"]').on('click', function() {
    $('.video-mo-01').children('iframe')[0].src += '&autoplay=1';

    setTimeout(function() {
      $('.video-mo-01').css('opacity', '1');
    }, 300);
  });

  $('[data-dismiss="modal"]').on('click', function() {
    $('.video-mo-01').children('iframe')[0].src = srcOld;
    $('.video-mo-01').css('opacity', '0');
  });
})(jQuery);

function handle_error() {
  alert('error occurred!');
}

function updateNumberOfCartItems() {
  $.ajax({
    method: 'GET',
    url: '/numcartitems',
    success: res => {
      if (res.success === 0) {
        if (res.data === 0) $('.header-icons-noti').text(0);
        else handle_error(res.error);
      } else {
        $('.header-icons-noti').text(res.data.rows[0].num);
      }
    }
  });
}
