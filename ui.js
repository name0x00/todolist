window.onload = function () {
  /*----------ui.js-----------*/
  ;
  (function () {
    'use strict'
    window.u = {

    }
    /*先获取正在进行卡片、已经完成卡片和输入表单*/
    var el_to_do_items = document.getElementById('to-do-items').firstElementChild;
    var el_off_the_items = document.getElementById('off-the-items').firstElementChild;
    var el_to_do_form = document.getElementById('to-do-form');

    init();

    function init() {
      /*开始即渲染一次*/
      render();
      /*监听表单提交事件*/
      bind_submit();
    }

    function bind_submit() {
      /* 当表单提交时 */
      el_to_do_form.addEventListener('submit', function (event) {
        /*禁止默认操作*/
        event.preventDefault();
        /*把表单中的数据变成对象*/
        var item = get_form_value(el_to_do_form);
        /*如果不输入*/
        if (!item.content) {
          return;
        }
        /*如果其中有id说明是要更新*/
        if (item.id) {
          b.update(parseInt(item.id), item);
        }
        /*如果没有id说明是要新增*/
        else {
          b.add(item);
        }
        /*更新或添加后重新渲染*/
        render();
      });
    }

    function get_form_value(el) {
      /*初始化新条目*/
      var data = {};
      /*获取表单下所有的子项*/
      var input_list = el.children;

      /*迭代表单的子项*/
      for (var i = 0; i < input_list.length; i++) {
        var input = input_list[i];
        /*如果子项是<input>*/
        if (input.nodeName == 'INPUT') {
          /*这个子项的name的值为新条目的一个键*/
          var key = input.getAttribute('name');
          /*获取输入框中的值*/
          var val = input.value;

          /*获取后清空元素中的值*/
          input.value = '';

          /*为新条目添加一条属性*/
          data[key] = val;
        }
      }

      return data;
    }

    /* 给表单填充数据
    @param el 表单元素，指定给哪张表单添加数据
    @param pack 数据，指定要添加的数据
    * */
    function set_form_value(el, pack) {
      /*迭代要写入的数据对象*/
      for (var key in pack) {
        var val = pack[key];
        var input = el.querySelector('[name=' + key + ']');
        if (!input) continue;
        input.value = val;
      }
    }

    function bin_del_btn(el, id) {
      el.addEventListener('click', function () {
        b.del(id);
        render();
      }, false)
    }

    function bin_restore_btn(el, item) {
      el.addEventListener('click', function () {
        set_form_value(el_to_do_form, item);
        el_to_do_form.firstElementChild.focus();
      }, false)
    }

    function bind_done_btn(el, id) {
      el.addEventListener('click', function () {
        b.addToDone(id);
        render();
      }, false)
    }

    function render() {
      /*先清空条目列表*/
      el_to_do_items.innerHTML = '';
      el_off_the_items.innerHTML = '';
      /*获取所有条目数据*/
      var list = b.read();
      var off_list = b.read_off();
      /*遍历正在进行里每一条条目*/
      list.forEach(function (item) {
        var del_btn;
        var update_btn;
        var done_btn;
        /*生成一条条目卡片*/
        var el_to_do_item = document.createElement('li');
        /*给条目卡片添加一个类，方便css选择*/
        el_to_do_item.classList.add('list-group-item', 'list-group-item-actio');
        /*在条目卡片中写入各种内容*/
        el_to_do_item.innerHTML = `
                    <button type="button" id="del-btn-${item.id}" class="btn btn-light float-right">删除</button>
                    <button type="button" id="update-btn-${item.id}" class="btn btn-light float-right">修改</button>
                    <button type="button" id="done-btn-${item.id}" class="btn btn-light float-right">完成</button>
                    <p>${item.content}</p>
                `;
        /*选中删除按钮和更新按钮*/
        del_btn = el_to_do_item.querySelector('#del-btn-' + item.id);
        update_btn = el_to_do_item.querySelector('#update-btn-' + item.id);
        done_btn = el_to_do_item.querySelector('#done-btn-' + item.id);
        /*为他们绑定点击事件*/
        bin_del_btn(del_btn, item.id);
        bin_restore_btn(update_btn, item);
        bind_done_btn(done_btn, item.id);
        /*将卡片追加到条目列表中*/
        el_to_do_items.appendChild(el_to_do_item);
      });

      /*遍历已经完成里每一条条目*/
      off_list.forEach(function (item) {
        var el_off_the_item = document.createElement('li');
        el_off_the_item.classList.add('list-group-item', 'list-group-item-light');
        el_off_the_item.innerHTML = `
                    <button type="button" id="del-btn-${item.id}" class="btn btn-light float-right">删除</button>
                    <p>${item.content}</p>
                `;
        /*绑定点击事件*/
        var off_del_btn = el_off_the_item.firstElementChild;
        var del_off_the_item = function () {
          b.del_off(item.id);
          render();
        }
        off_del_btn.addEventListener('click', del_off_the_item, false);

        /*将卡片追加到条目列表中*/
        el_off_the_items.appendChild(el_off_the_item);
      });
    }

    document.getElementById('clear-all').addEventListener('click', function () {
      localStorage.clear();
      b.init_data();
      el_to_do_items.innerHTML = '';
      el_off_the_items.innerHTML = '';
    }, false)

  })();
}