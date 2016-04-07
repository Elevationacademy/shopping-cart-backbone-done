var ItemModel = Backbone.Model.extend({
  defaults: {
    name: '',
    price: 0
  }
});

var ItemCollection = Backbone.Collection.extend({
  model: ItemModel
});

var ItemView = Backbone.View.extend({
  className: 'item',

  template: Handlebars.compile($('#item-template').html()),

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    
    return this;
  }
});

var AppModel = Backbone.Model.extend({
  defaults: {
    cart: new ItemCollection(),
    show_cart: false,
    total: 0
  },

  initialize: function () {
    this.listenTo(this.get('cart'), {
      'add remove reset': this._calculateTotal
    });

    this._calculateTotal();
  },

  _calculateTotal: function () {
    var total = 0;

    this.get('cart').each(function (m) {
      total += m.get('price');
    });

    this.set('total', total);
  }
});

var AppView = Backbone.View.extend({
  el: 'body',

  events: {
    'click .view-cart': 'toggleCart',
    'click .add-to-cart': 'addItem',
    'click .clear-cart': 'clearCart'
  },

  initialize: function () {
    // array for keep track of all our item subviews so we can remove them later
    this.itemViews = [];

    this.$shoppingCart = this.$('.shopping-cart');
    this.$cartList = this.$('.cart-list');
    this.$total = this.$('.total');

    this.listenTo(this.model.get('cart'), 'add', this.renderItem);
    this.listenTo(this.model, 'change:show_cart', this.renderShowCart);
    this.listenTo(this.model, 'change:total', this.renderTotal);

    this.renderShowCart();
  },

  toggleCart: function () {
    this.model.set('show_cart', !this.model.get('show_cart'));
  },

  clearCart: function () {
    // loop through all the views and call remove on them
    for (var i = 0; i < this.itemViews.length; i += 1) {
      this.itemViews[i].remove();
    }

    // empty out the 'cart' by resetting the collection
    this.model.get('cart').reset();
  },

  addItem: function (e) {
    var $item = $(e.currentTarget).closest('.item');
    var data = $item.data();
    this.model.get('cart').add(data);

    this.model.set('show_cart', true);
  },

  renderShowCart: function () {
    this.$shoppingCart.toggleClass('show', this.model.get('show_cart'));
  },

  renderItem: function (item) {
    var view = new ItemView({ model: item });
    this.itemViews.push(view);
    this.$cartList.append(view.render().el);
  },

  renderTotal: function () {
    this.$total.html(this.model.get('total'));
  }
});

var appModel = new AppModel();
var appView = new AppView({model: appModel});