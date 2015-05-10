var Board = function(token) {
  var svg = null,
    elements = {};

  var init = function() {
    var width = 1240,
      height = 840;

    svg = d3.select('#board')
      .append('svg')
      .attr('width', width)
      .attr('height', height);
  };

  var addElement = function(item) {
    var id = item.id,
      element = {};
      console.log(item.x);

    if (item.type === 2) {
      element = {
        'type': 'text',
        'x': ~~(item.x),
        'y': ~~(item.y  / 3.6),
        'width': ~~item.width,
        'height': ~~item.height,
        'size': item.styles.size + 'px',
        'text': item.styles.text
      };
    } else {
      element = {
        'type': 'image',
        'x': ~~(item.x),
        'y': ~~(item.y / 3.6),
        'width': ~~(item.width / 2),
        'height': ~~(item.height / 2),
        'url': item.imageUrl
      };
    }
    elements[id] = element;
  };

  var removeElement = function(id) {
    elements[id] = null;
  };

  var repaint = function() {
    d3.select('#board svg')
      .remove();
    init();

    for (var id in elements) {
      if (elements.hasOwnProperty(id)) {
        var item = elements[id];

        if (item.type === 'text') {
          svg.append('text')
            .text(item.text)
            .attr('x', item.x)
            .attr('y', item.y)
            .attr('width', item.width)
            .attr('height', item.height)
            .attr('font-size', item.size);
        } else if (item.type === 'image') {
          svg.append('svg:image')
            .attr('x', item.x)
            .attr('y', item.y)
            .attr('width', item.width)
            .attr('height', item.height)
            .attr('xlink:href', item.url);
        }
      }
    }
  };

  var applicationHubProxy = $.connection.applicationHub;
  $.signalR.ajaxDefaults.headers = {
    Authorization: 'Bearer ' + token
  };
  $.connection.hub.start()
    .done(function() {
      console.log('Now connected, connection ID=' + $.connection.hub.id);

      init();

      var id = '2f4723eb-c11f-4f91-82a1-9e7e709026b7';
      applicationHubProxy.server.openBoard(id);
      applicationHubProxy.server.readItems(id)
        .done(function(items) {
          items.forEach(function(item) {
            console.log(item);
            addElement(item);
          });
          repaint();
        });
    })
    .fail(function() {
      console.log('Could not Connect!');
    });

  applicationHubProxy.client.onCreateItem = function(item) {
    console.log(item);
    addElement($.parseJSON(item));
    repaint();
  };
  applicationHubProxy.client.onDeleteItem = function (item) {
    var id = $.parseJSON(item).id;
    removeElement(id);
    repaint();
  };
  applicationHubProxy.client.onUpdateItem = function(item) {
    console.log(item);
    addElement($.parseJSON(item));
    repaint();
  };

  applicationHubProxy.client.onError = function(message) {
    console.log(item);
  };
};
