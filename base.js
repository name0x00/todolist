;
(function () {
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
    read_off: read_off,
    init_data: init_data
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