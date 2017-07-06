var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 22.543389, lng: 114.060508 },
    zoom: 13,
    // 添加地图控件
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_CENTER
    },
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_CENTER
    },
    // 街区实景
    streetViewControl: true,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.LEFT_TOP,
    },
    // 全屏
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: google.maps.ControlPosition.LEFT_TOP
    },
    disableDefaultUI: true
  });
  // 地点信息窗口
  var largeInfoWindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  // 默认的marker样式
  var defaultIcon = makeMarkerIcon('0287D0');
  // marker高亮的颜色
  var highlightedIcon = makeMarkerIcon('BCBCBC');
  // 为每个地点创建marker
  for (var i = 0; i < mapModel.locations.length; i++) {
    // 获取地点的经纬度
    var position = mapModel.locations[i].location;
    // 获取地点的title
    var title = mapModel.locations[i].title;

    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });

    mapModel.markers.push(marker);

    // 添加信息窗口
    marker.addListener('click', function() {
      toggleBounce(this);
      // 地图视图偏移
      map.panTo(this.position);
      populateInfoWindow(this, largeInfoWindow);
    });

    // 改变marker的样式
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
    // 扩大地图的边界
    bounds.extend(marker.position);
  }
  // 设置边界
  map.fitBounds(bounds);
}

/**
* 点击maker 时构建一个信息窗口
*/
function populateInfoWindow(marker, infoWindow) {
  // 判断这个信息窗口是不是已经打开, 没有打开才重新打开信息窗口
  if (infoWindow.marker !== marker) {
    infoWindow.marker = marker;
    infoWindow.setContent('<div>' + marker.title + '</div>');
    infoWindow.open(map, marker);
    infoWindow.addListener('closeclick', function() {
      infoWindow.setMarker = null;
    });
    infoWindow.open(map, marker);
  }
}

// 制作marker样式
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34));
  return markerImage;
}

// 停止所有marker的悬浮动画
function stopAllBounce() {
  for (var i = 0; i < mapModel.markers.length; i++) {
    mapModel.markers[i].setAnimation(null);
  }
}

// 为maker添加悬浮动画效果
function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    // 先停止所有的marker的悬浮
    stopAllBounce();
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}
