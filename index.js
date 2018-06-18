window.onload = function () {
    /*----------storage.js-----------*/
    ; (function () {
        'use strict'
        window.s = {};

        s.set = function (key, val) {
            var json = JSON.stringify(val);
            localStorage.setItem(key, json);
        }

        s.get = function (key) {
            var json = localStorage.getItem(key);
            return JSON.parse(json);
        }

    })();
    /*----------base.js-----------*/
    ; (function () {
        'use strict'

        var to_do_items, end_id, off_the_items;

        window.b = {
            to_do_items: to_do_items,
            off_the_items: off_the_items,
            end_id: end_id,
            add: add,
            addToDone: addToDone,
            del: del,
            del_off: del_off,
            update: update,
            read: read,
            read_off: read_off
        }

        init_data();

        function init_data() {
            to_do_items = s.get('to_do_items');
            off_the_items = s.get('off_the_items');
            end_id = s.get('end_id');

            if (!to_do_items) {
                to_do_items = [];
                sync();
            }

            if (!off_the_items) {
                off_the_items = [];
                sync();
            }

            if (!end_id) {
                end_id = 0;
                s.set('end_id', end_id);
            }
        }

        function add(pack) {

            var new_item = pack;
            new_item.id = end_id + 1;

            to_do_items.push(new_item);

            sync();

            end_id = end_id + 1;
            s.set('end_id', end_id);
        }

        function addToDone(id) {
            var off = b.read(id);
            b.del(id);
            if (off) {
                off_the_items.push(off);
            }
            sync();
        }

        function del(id) {
            var shit_index = find_index(id);

            if (shit_index === -1)
                return;

            to_do_items.splice(shit_index, 1);
            sync();
        }

        function del_off(id) {
            var shit_index = find_off_index(id);

            if (shit_index === -1)
                return;

            off_the_items.splice(shit_index, 1);
            sync();
        }

        function update(id, pack) {
            var index = find_index(id);
            var item = to_do_items[index];

            if (!item)
                return;

            item.id = parseInt(item.id)
            pack.id = parseInt(pack.id)

            to_do_items[index] = Object.assign({}, item, pack);
            sync();
        }

        function read(id) {
            if (id)
                return find(id);
            return to_do_items;
        }

        function read_off(id) {
            if (id)
                return find(id);
            return off_the_items;
        }

        function find_index(id) {
            return to_do_items.findIndex(function (item) {
                return item.id === id;
            });
        }

        function find_off_index(id) {
            return off_the_items.findIndex(function (item) {
                return item.id === id;
            });
        }

        function find(id) {
            return to_do_items.find(function (item) {
                return item.id === id;
            });
        }

        function sync() {
            s.set('to_do_items', to_do_items);
            s.set('off_the_items', off_the_items);
        }
    })();

    /*----------ui.js-----------*/
    ; (function () {
        'use strict'
        var el_to_do_items = document.getElementById('to-do-items').firstElementChild;
        var el_off_the_items = document.getElementById('off-the-items').firstElementChild;
        var el_to_do_form = document.getElementById('to-do-form');

        init();

        function init() {
            /*一开始就渲染一次*/
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
                /*如果其中有id说明是想更新*/
                if (item.id) {
                    b.update(parseInt(item.id), item);
                }
                /*如果没有id说明是想新增*/
                else {
                    b.add(item);
                }
                /*更新或添加后重新渲染*/
                render();
            });
        }

        function get_form_value(el) {
            /*初始化新文章*/
            var data = {};
            /*获取表单下所有的儿子*/
            var input_list = el.children;

            /*迭代表单的儿子*/
            for (var i = 0; i < input_list.length; i++) {
                var input = input_list[i];
                /*如果儿子是<input>*/
                if (input.nodeName == 'INPUT') {
                    /*这个儿子的name的值为新文章的一个键*/
                    var key = input.getAttribute('name');
                    /*获取输入框中的值*/
                    var val = input.value;

                    /*过河拆桥，清空元素中的值*/
                    input.value = '';

                    /*为新文章添加一条属性*/
                    data[key] = val;
                }
            }

            return data;
        }

        /* 给表单填充数据
        @param el 表单元素，指定给哪张表单添加数据
        @param pack 数据，指定要添加的数据，如： {title: 'Yo', content: 'Yo Yo Yo'}
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

        function render() {
            /*先清空文章列表*/
            el_to_do_items.innerHTML = '';
            el_off_the_items.innerHTML = '';
            /*获取所有文章数据*/
            var list = b.read();
            var off_list = b.read_off();
            /*遍历每一条文章*/
            list.forEach(function (item) {
                /*生成一条文章卡片*/
                var el_to_do_item = document.createElement('li');
                /*给文章卡片添加一个类，方便css选择*/
                el_to_do_item.classList.add('list-group-item', 'list-group-item-actio');
                /*在文章卡片中写入各种内容*/
                el_to_do_item.innerHTML = `
                    <button type="button" id="del-btn-${item.id}" class="btn btn-light float-right">删除</button>
                    <button type="button" id="update-btn-${item.id}" class="btn btn-light float-right">修改</button>
                    <button type="button" id="done-btn-${item.id}" class="btn btn-light float-right">完成</button>
                    <p>${item.content}</p>
                `;

                /*为他们绑定点击事件*/
                var for_all_click = function (event) {
                    switch (event.target.id) {
                        case 'del-btn-' + item.id:
                            b.del(item.id);
                            render();
                            break;

                        case 'update-btn-' + item.id:
                            set_form_value(el_to_do_form, item);
                            break;

                        case 'done-btn-' + item.id:
                            b.addToDone(item.id);
                            render();
                            break;
                    }
                }
                document.addEventListener('click', for_all_click, false);
                /*将卡片追加到文章列表中*/
                el_to_do_items.appendChild(el_to_do_item);
            });

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

                /*将卡片追加到文章列表中*/
                el_off_the_items.appendChild(el_off_the_item);
            });
        }

    })();
}

window.onunload = function () {
    document.removeEventListener('click', for_all_click, false);
}