;
(function($) {
	var LightBox = function(settings) {
		var self = this;

		this.settings = {
			speed: 500
		};
		$.extend(this.settings, settings || {});


		//创建遮罩和弹出窗
		this.popupMask = $('<div id="mask">');
		this.popupWin = $('<div id="popup">');

		//保存body
		this.bodyNode = $(document.body);

		//渲染剩余的dom，并且插入到body
		this.renderDOM();
		this.picViewArea = this.popupWin.find("div.pic-view"); //图片预览区域
		this.popupPic = this.popupWin.find("img.image"); //图片
		this.picCaptionArea = this.popupWin.find("div.pic-info"); ////图片信息区域
		this.nextBtn = this.popupWin.find("span.next-btn");
		this.prevBtn = this.popupWin.find("span.prev-btn");
		this.captionText = this.popupWin.find("p.pic-desc"); //图片标题
		this.currentIndex = this.popupWin.find("span.pic-index"); //图片索引
		this.closeBtn = this.popupWin.find("span.close-btn");


		//准备开发事件委托，获取组数据
		this.groupName = null;
		this.groupData = []; //放置同一组数据
		this.bodyNode.delegate(".js-lightbox,*[data-role=lightbox]", "click", function(e) {
			/*alert(this);*/
			//阻止事件冒泡
			e.stopPropagation();
			/*alert($(this).attr("data-group"));*/
			var currentGroupName = $(this).attr("data-group");

			if (currentGroupName != self.groupName) {
				//下次点击不是同一组的进行数据获取，同一组的就不用进行数据获取
				self.groupName = currentGroupName;
				/*alert(currentGroupName);*/
				self.getGroup();
			}

			//初始化弹窗
			self.initPopup($(this));

		});

		//关闭弹出
		this.popupMask.click(function() {
			$(this).fadeOut();
			self.popupWin.fadeOut();
			self.clear = false;
		});
		this.closeBtn.click(function() {
			self.popupMask.fadeOut();
			self.popupWin.fadeOut();
			self.clear = false;
		});

		//绑定上下切换按钮事件
		this.flag = true;
		this.nextBtn.hover(function() {

			if (!$(this).hasClass("disabled") && self.groupData.length > 1) {
				$(this).addClass("next-btn-show");
			}
		}, function() {
			if (!$(this).hasClass("disabled") && self.groupData.length > 1) {
				$(this).removeClass("next-btn-show");
			}
		}).click(function(e) {
			if (!$(this).hasClass("disabled") && self.flag) {
				self.flag = false; //图片切换
				e.stopPropagation();
				self.goto("next");
			}
		});


		this.prevBtn.hover(function() {

			if (!$(this).hasClass("disabled") && self.groupData.length > 1) {
				$(this).addClass("prev-btn-show");
			}
		}, function() {
			if (!$(this).hasClass("disabled") && self.groupData.length > 1) {
				$(this).removeClass("prev-btn-show");
			}
		}).click(function(e) {
			if (!$(this).hasClass("disabled") && self.flag) {
				self.flag = false;
				e.stopPropagation();
				self.goto("prev");
			};
		});

		//绑定窗口调整事件
		var timer = null;
		this.clear = false;
		$(window).resize(function() {
			if (self.clear) {
				window.clearTimeout(timer);
				timer = window.setTimeout(function() {
					self.loadPicSize(self.groupData[self.index].src);
				}, 500);
			};
		}).keyup(function(e) {
			/*	console.log(e.which);*/
			var keyValue = e.which;
			if (self.clear) {
				if (keyValue == 38 || keyValue == 37) {
					self.prevBtn.click();
				} else if (keyValue == 39 || keyValue == 40) {
					self.nextBtn.click();
				};
			};
		});
	};
	LightBox.prototype = {
		goto: function(dir) {
			if (dir === "next") {
				this.index++;
				if (this.index >= this.groupData.length - 1) {
					this.nextBtn.addClass("disabled").removeClass('next-btn-show');
				}
				if (this.index != 0) {
					this.prevBtn.removeClass("disabled");
				};
				var src = this.groupData[this.index].src;
				this.loadPicSize(src);

			} else if (dir === "prev") {
				this.index--;
				if (this.index <= 0) {
					this.prevBtn.addClass("disabled").removeClass("prev-btn-show");
				};
				if (this.index != this.groupData.length - 1) {
					this.nextBtn.removeClass("disabled");
				};
				var src = this.groupData[this.index].src;
				this.loadPicSize(src);
			};
		},
		loadPicSize: function(sourceSrc) {
			console.log(sourceSrc); //图片地址
			var self = this;
			self.popupPic.css({
				width: "auto",
				height: "auto"
			}).hide();

			this.picCaptionArea.hide();


			this.preLoadImg(sourceSrc, function() {
				self.popupPic.attr("src", sourceSrc);
				var picWidth = self.popupPic.width(),
					picHeight = self.popupPic.height();
				console.log("宽度：" + picWidth + "," + "高度：" + picHeight);
				self.changePic(picWidth, picHeight);
			});
		},
		changePic: function(width, height) {
			var self = this;
			winWidth = $(window).width();
			winHeight = $(window).height();


			//如果图片的宽高大于浏览器的宽高比例，看是否溢出
			//运用比例缩小图片
			var scale = Math.min(winWidth / (width + 10), winHeight / (height + 10), 1);
			width = width * scale;
			height = height * scale;
			this.picViewArea.animate({
				width: width - 10,
				height: height - 10
			}, self.settings.speed);
			this.popupWin.animate({
				width: width,
				height: height,
				marginLeft: -(width / 2),
				top: (winHeight - height) / 2
			}, self.settings.speed, function() {
				self.popupPic.css({
					width: width - 10,
					height: height - 10,
				}).fadeIn();
				self.picCaptionArea.fadeIn();
				self.flag = true;
				self.clear = true;
			});
			/*this.captionText = this.popupWin.find("p.pic-desc"); //图片标题
			this.currentIndex = this.popupWin.find("span.pic-index"); //图片索引*/
			this.captionText.text(this.groupData[this.index].caption);
			this.currentIndex.text("当前索引：" + (this.index + 1) + " of " + this.groupData.length);
		},
		preLoadImg: function(src, callback) {
			var img = new Image();
			if (!!window.ActiveXObject) {
				img.onreadystatechange = function() {
					if (this.readState == "complete") {
						callback();
					};
				};
			} else {
				img.onload = function() {
					callback();
				};
			};
			img.src = src;
		},
		showMaskAndPopup: function(sourceSrc, currentId) {
			/*console.log(sourceSrc, currentId);*/
			var self = this;
			this.popupPic.hide();
			this.picCaptionArea.hide();

			this.popupMask.fadeIn();

			var winWidth = $(window).width();
			var winHeight = $(window).height();

			this.picViewArea.css({
				width: winWidth / 2,
				height: winHeight / 2
			});
			this.popupWin.fadeIn();

			var viewHeight = winHeight / 2 + 10;

			this.popupWin.css({
				width: winWidth / 2 + 10,
				height: winHeight / 2 + 10,
				marginLeft: -(winWidth / 2 + 10) / 2,
				top: -viewHeight
			}).animate({
				top: (winHeight - viewHeight) / 2
			}, self.settings.speed, function() {
				//加载图片
				self.loadPicSize(sourceSrc);
			});
			//根据当前点击的元素ID获取在当前组别里面的索引
			this.index = this.getIndexOf(currentId);
			/*	$(this).index()*/
			console.log(this.index);

			var groupDataLength = this.groupData.length;
			if (groupDataLength > 1) {
				//this.prevBtn this.nextBtn
				if (this.index === 0) {
					this.prevBtn.addClass("disabled");
					this.nextBtn.removeClass("disabled");
				} else if (this.index === groupDataLength - 1) {
					this.nextBtn.addClass("disabled");
					this.prevBtn.removeClass("disabled");
				} else {
					this.prevBtn.removeClass("disabled");
					this.nextBtn.removeClass("disabled");
				}
			};
		},
		getIndexOf: function(currentId) {
			var index = 0;
			$(this.groupData).each(function(i) {
				index = i;
				if (this.id === currentId) {
					return false;
				}
			});

			return index;
		},

		initPopup: function(currentObj) {
			var self = this,
				sourceSrc = currentObj.attr("data-source");
			currentId = currentObj.attr("data-id");

			this.showMaskAndPopup(sourceSrc, currentId);



		},

		getGroup: function() {
			var self = this;
			//根据当前的组名获取页面相同组别的对象
			var groupList = this.bodyNode.find("*[data-group=" + this.groupName + "]");

			//清空数组数据
			self.groupData.length = 0;
			groupList.each(function() {
				self.groupData.push({
					src: $(this).attr("data-source"),
					id: $(this).attr("data-id"),
					caption: $(this).attr("data-caption")
				});
			});
			console.log(self.groupData);
			/*alert(group.size());*/
		},

		renderDOM: function() {
			var strDom = '<div class="pic-view">' +
				'<span class="btn prev-btn"></span>' +
				'<img class="image" src="images/2-2.jpg" alt="" >' +
				'<span class="btn next-btn"></span>' +
				'</div>' +
				'<!-- 图片信息 -->' +
				'<div class="pic-info">' +
				'<div class="pic-info-area">' +
				'<p class="pic-desc">123</p>' +
				'<span class="pic-index">当前索引：0of0</span>' +
				'</div>' +
				'<span class="close-btn"></span>' +
				'</div>';
			//插入到this.popupWin=$('<div id="popup">');
			this.popupWin.html(strDom);
			//把遮罩和弹出框插入到body
			this.bodyNode.append(this.popupMask, this.popupWin);
		}
	}
	window["LightBox"] = LightBox;
})(jQuery);