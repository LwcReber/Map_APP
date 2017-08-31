var mapModel = {
  // 预设的地点 title: 地点名称， location: 地点经纬度 lat 纬度、lng 经度，category：地点属性分类  作为筛选下拉列表的值
  locations: [
    { title: '世界之窗', location: { lat: 22.534717, lng: 113.973417 }, category: 'scenic' },
    { title: '深圳欢乐谷', location: { lat: 22.540292, lng: 113.981859 }, category: 'scenic' },
    { title: '深圳大学', location: { lat: 22.532893, lng: 113.932986 }, category: 'university' },
    { title: '南方科技大学', location: { lat: 22.593842, lng: 113.995071 }, category: 'university' },
    { title: '深圳职业技术学院', location: { lat: 22.587492, lng: 113.952206 }, category: 'university' },
    { title: '深圳信息职业技术学院', location: { lat: 22.68737, lng: 114.217627 }, category: 'university' },
    { title: '深圳会展中心', location: { lat: 22.530732, lng: 114.059951 }, category: 'scenic' },
    { title: '深圳宝安国际机场', location: { lat: 22.636828, lng: 113.814606 }, category: 'scenic' },
    { title: '沃尔玛购物广场深圳蛇口店', location: { lat: 22.503374, lng: 113.923642 }, category: 'market' },
    { title: '南头沃尔玛（深圳南新分店）', location: { lat: 22.539438, lng: 113.919678 }, category: 'market' },
    { title: '海雅缤纷城', location: { lat: 22.559261, lng: 113.904427 }, category: 'market' },
    { title: '港隆城百货', location: { lat: 22.582196, lng: 113.880805 }, category: 'market' },
    { title: '罗湖区东门商业步行街', location: { lat: 22.546237, lng: 114.119385 }, category: 'scenic' },
    { title: '深圳湾公园', location: { lat: 22.50292, lng: 113.952903 }, category: 'scenic' },
    { title: '深圳仙湖植物园', location: { lat: 22.573886, lng: 114.170688 }, category: 'scenic' },
    { title: '福田区红树林自然保护区', location: { lat: 22.524569, lng: 114.00961 }, category: 'scenic' },
    { title: '肯德基（港隆城店）', location: { lat: 22.581809, lng: 113.88163 }, category: 'restaurant' },
    { title: '肯德基（桃源村店）', location: { lat: 22.557867, lng: 113.984546 }, category: 'restaurant' },
    { title: '麦当劳（深圳海城路餐厅)', location: { lat: 22.566553, lng: 113.868129 }, category: 'restaurant' },
    { title: '麦当劳（高新路店)', location: { lat: 22.523109, lng: 113.947803 }, category: 'restaurant' },
  ],
  // 没有符合地点时列表显示
  noPlace: { title: '没有搜索到该地点', location: { lat: '', lng: '' }, category: 'none' },
  // 创建marker的数组
  markers: [],
  // 收藏地点
  collectPlace: []
};
/**
* 选中列表的地点，使地图中对应悬浮标出现动画
* title：html中地点的title
*/
function animateMaker(title) {
  for (var i = 0; i < mapModel.markers.length; i++) {
    if (title === mapModel.markers[i].title) {
      // 如果悬浮标已经有动画就返回
      if (mapModel.markers[i].getAnimation() !== null) return;
      // 停止所有maker的悬浮标动画
      stopAllBounce();
      // 设置该地点的marker有动画
      mapModel.markers[i].setAnimation(google.maps.Animation.BOUNCE);
      // 显示info窗口
      populateInfoWindow(mapModel.markers[i], largeInfoWindow);
      // 地图视图偏移
      map.panTo(mapModel.markers[i].position);
    }
  }
}

/*
* 显示对应的地点maker
* marker: mapModel.markers里的marker元素
*/
function showSearchPlaceMarker(marker) {
  try {
    marker.setMap(map);
  } catch (e) {
    function setMapException(message) {
      this.message = message;
    }
    throw new setMapException('地图没有被加载，无法设置显示marker');
  }
}

// 移除所有的maker
function removeMaker(marker) {
  try {
    marker.setMap(null);
  } catch (e) {
    function setMapException(message) {
      this.message = message;
    }
    throw new setMapException('地图没有被加载，无法移除marker');
  }
}

/**
* 为mapModel.locations的地点都创建一个ko的对象
*/
var Location = function(data) {
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
  this.category = ko.observable(data.category);
  this.address = ko.observable('');
  this.area = ko.observable('');
  // 地点在列表中是否可见
  this.isPlaceShow = ko.observable(true);
  // 收藏按钮是否显示
  this.showCollectBtn = ko.observable(true);
};

// 搜索无结果时，locations绑定该对象
var NoPlace = function(data) {
  this.title = ko.observable(data.title);
  this.address = ko.observable('');
  this.area = ko.observable('');
  this.isPlaceShow = ko.observable(true);
  this.noPlaceStatus = ko.observable(true);
  // 收藏按钮不显示
  this.showCollectBtn = ko.observable(false);
};

var ViewModel = function() {
  var self = this;
  // 获取地点输入框
  var address = $('#address');
  // 保存address的value
  var addressVal;
  // 获取筛选器按钮
  var filter = $('#filter');
  // 筛选器的值
  var filterVal;
  // 选中的地点
  this.activePlace = ko.observable();
  // 左边菜单栏切换按钮 默认不添加class
  this.toggleBtnStatus = ko.observable(null);
  this.activePlace = ko.observable(null);
  // 保存mapModel的location
  this.locationList = ko.observableArray([]);

  mapModel.locations.forEach(function(place) {
    self.locationList.push(new Location(place));
  });
  // 用在html中作地点数据绑定
  this.locations = ko.observable(self.locationList());
  // 无符合的地点，地点列表文本的显示
  this.noPlace = ko.observable(new NoPlace(mapModel.noPlace));
  // 收藏地点
  this.collectPlaces = ko.observableArray([]);
  if (!localStorage.collectPlace) {
    localStorage.collectPlace = JSON.stringify(mapModel.collectPlace);
  }
  // 收藏按钮显示
  this.collectBtn = ko.observable(true);
  /**
  * 菜单切换按钮，点击隐藏或显示左边菜单栏
  */
  this.toggleMenu = function() {
    self.toggleBtnStatus() === null ?
    self.toggleBtnStatus(false) : self.toggleBtnStatus(!self.toggleBtnStatus());
  };

  // 地点输入框请求
  address.on('input', function() {
    // 重置筛选列表的选中状态
    filter.prop('selectedIndex', 0);
    // 重置locations
    self.locations(self.locationList());
    // 不请求的情况
    // 与上次输入的地点相同
    // 输入为空
    if (addressVal == address.val() || address.val() == ' ') {
      return;
    }
    // 保留input的值，下次输入用作对比前后值
    addressVal = address.val();

    // 使用正则表达式，查找输入的地址是否有空格， 至少1个空格
    if (addressVal !== null) {
      var response = addressVal.match(/\s+$/g);
      // 如果找到有空格符就返回
      if (response !== null) {
        return;
      }
    }

    // 有符合条件的地点标记，搜索不到符合条件的地方时，用该标记作错误处理
    var havePlaces = false;
    // 创建正则表达式
    var placeReg = new RegExp(addressVal, 'g');
    // 搜索文本地点
    for (var i = 0; i < mapModel.locations.length; i++) {
      // 地图上移除不符合条件的的地点marker
      removeMaker(mapModel.markers[i]);
      var search = mapModel.locations[i].title.match(placeReg);
      if (search !== null) {
        self.locations()[i].isPlaceShow(true);
        showSearchPlaceMarker(mapModel.markers[i]);
        havePlaces = true;
      } else {
        self.locations()[i].isPlaceShow(false);
      }
    }
    // 搜索不到的地点显示
    if (havePlaces === false) {
      self.locations(self.noPlace());
    }
  });

  // 筛选地点下拉列表
  filter.change(function() {
    filterVal = filter.val();
    // 清空地点输入框的内容
    address.val('');
    // 如果locations的值为收藏的值或者是无符合地点的值，就重置locations
    if (self.locations() === self.collectPlaces() || self.locations() === self.noPlace()) {
      self.locations(self.locationList());
    }
    // 如果不选择就返回
    if (filterVal === 'none') {
      return;
    }
    // 清除选中的地点
    self.activePlace('');
    // 如果等于全部就重置地点
    if (filterVal === 'all') {
      // 显示所有的地点maker
      for (var i = 0; i < mapModel.markers.length; i++) {
        showSearchPlaceMarker(mapModel.markers[i]);
        self.locations()[i].isPlaceShow(true);
      }
      return;
    }
    // 收藏类
    if (filterVal === 'collect') {
      var newClps = JSON.parse(localStorage.collectPlace);
      if (newClps.length === 0) {
        alert('还没有收藏的地点，赶紧收藏您喜欢的地点吧！！！');
        // 重置筛选列表的选中状态
        filter.prop('selectedIndex', 0);
        return;
      }
      // 清除原有的值
      self.collectPlaces([]);
      newClps.forEach(function(item) {
        var clp = new Location(item);
        // 隐藏收藏按钮
        clp.showCollectBtn(false);
        self.collectPlaces.push(clp);
      });
      self.locations(self.collectPlaces());
      // 显示marker
      for (var k = 0; k < mapModel.locations.length; k++) {
        removeMaker(mapModel.markers[k]);
        // 如果收藏的地点title与mapModel.locations的title相同
        newClps.forEach(function(item) {
          if (mapModel.locations[k].title === item.title) {
            showSearchPlaceMarker(mapModel.markers[k]);
          }
        });
      }
      return;
    }

    for (var j = 0; j < mapModel.locations.length; j++) {
      removeMaker(mapModel.markers[j]);
      // 如果地点的属性与筛选器选择的值一样，就添加到搜索到的地方
      if (mapModel.locations[j].category === filterVal) {
        self.locations()[j].isPlaceShow(true);
        showSearchPlaceMarker(mapModel.markers[j]);
      } else {
        self.locations()[j].isPlaceShow(false);
      }
    }
  });

  /**
  * 判断该地点是否被选中 ，选中的改变title的背景颜色
  */
  this.isPlaceChosen = function(place) {
    return self.activePlace() === place;
  };

  /**
  * 点击列表的地点,地图中的对应地点marker浮动
  * place： html中传进来的地点对象
  */
  this.goToThisPlace = function(place) {
    // 如果没搜索到地点，点击无效
    if (place.noPlaceStatus) return;
    // 设置选中的地点
    self.activePlace(place);
    // 显示地图悬浮标
    animateMaker(place.title());
    // 获取经纬度
    var lat = place.location().lat;
    var lng = place.location().lng;

    // 手动定义超时响应报错，网络问题或者服务器一直不响应时，用来提示使用者
    // var handleOverTime = setTimeout(function() {
    //   alert('响应超时，请刷新页面重试');
    // }, 15000);
    // 使用jquery的ajax请求地点详细信息
    // 使用高德地图API获取
    $.ajax({
      url: 'http://restapi.amap.com/v3/geocode/regeo?&key=c9f0e0d3698d77a99521d30be23978df&location=' + lng
      + ',' + lat + '&output=json&extensions=all',
    }) // 成功响应
    .done(function(result) {
      // clearTimeout(handleOverTime);
      // 返回的结果是一个对象才处理
      if (Object.prototype.toString.call(result).indexOf('Object') !== -1) {
        // 成功查询
        if (result.status === '1') {
          if (result.regeocode) {
            // 地址
            place.address('地址： ' + result.regeocode.formatted_address);
            // 面积
            if (result.regeocode.aois.length > 0) {
              var area = Math.round(parseFloat(result.regeocode.aois[0].area));
              place.area('面积：' + area + ' 平方米');
            }
          }
        } else {
          alert('请求失败');
        }
      } else {
        alert('返回的结果类型有错');
      }
    })
    .fail(function(result) {
      // clearTimeout(handleOverTime);
      alert('请求超时,请重试');
    });
  };

  /**
  * 收藏地点
  */
  this.collectPlace = function(place) {
    // 用ko.toJS转换ko的对象
    var collect = ko.toJS(place);
    // 收藏状态
    var collectStatus = false;
    // 先获取localStorage本来的值
    mapModel.collectPlace = JSON.parse(localStorage.collectPlace);
    mapModel.collectPlace.forEach(function(index) {
      if (index.title === collect.title) {
        collectStatus = true;
      }
    });
    // 如果已经收藏就返回
    if (collectStatus === true) {
      alert('该地点已经收藏');
      return;
    }
    // 再加上现在点击的值
    mapModel.collectPlace.push(collect);
    localStorage.collectPlace = JSON.stringify(mapModel.collectPlace);
    alert('成功收藏该地点');
  };
};

ko.applyBindings(new ViewModel());
