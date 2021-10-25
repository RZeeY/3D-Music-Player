import moment from 'moment';

// 工具方法
const utils = {
  /**
   * 获取url中的参数
   */
  getUrlQuery: function() {
    var qs = location.search.length > 0 ? location.search.substring(1) : '',
      args = {},
      // 取得每一项
      items = qs.length ? qs.split('&') : [],
      item = null,
      name = null,
      value = null,
      // 在 for 循环中使用
      i = 0,
      len = items.length;
    for (i = 0; i < len; i++) {
      item = items[i].split('=');
      name = decodeURIComponent(item[0]);
      value = decodeURIComponent(item[1]);
      if (name.length) {
        args[name] = value;
      }
    }
    return args;
  },
  /**
   * 返回含有年月日的对象
   * @param time 时间戳
   */
  getDateObj: function(time) {
    var date = new Date(time);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      text: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
    };
  },
  /**
   * 阿拉伯数字转换汉字数字
   * @param num 阿拉伯数字
   */
  arabToCnNumber: function(num) {
    const data = {
      '0': '零',
      '1': '一',
      '2': '二',
      '3': '三',
      '4': '四',
      '5': '五',
      '6': '六',
      '7': '七',
      '8': '八',
      '9': '九',
    };
    let result = num
      .toString()
      .split('')
      .map(v => data[v] || v)
      .join('');
    return result;
  },
  /**
   * 分转元
   * @param cent 人民币元
   * @param isFloat 是否保留两位小数
   */
  centToYuan: function(cent, isFloat) {
    if (typeof cent === 'number') {
      if (isFloat === undefined) {
        return (cent / 100).toFixed(2);
      }
      if (isFloat === true) {
        return (cent / 100).toFixed(2);
      } else {
        return (cent / 100).toFixed(0);
      }
    } else {
      return cent;
    }
  },
  /**
   * 元转分
   * @param cent 人民币分
   */
  yuanToCent: function(yuan) {
    return Number(yuan) * 100;
  },
  /**
   * 校验
   */
  verify: {
    // 金额校验
    money: function(str) {
      return /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/.test(str);
    },
    // 手机号校验
    phone: function(str) {
      return /^1\d{10}$/.test(str);
    },
    // 身份证号校验
    idCard: function(str) {
      return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/gi.test(str);
    },
  },
  /**
   * 数字转xxxx.xxk
   * @param n 数字
   */
  numberToK: function(n) {
    if (n >= 1000) {
      let a = Math.floor(n / 1000);
      let b = Math.floor((n % 1000) / 100);
      if (b === 0) {
        return `${a}k`;
      } else {
        return `${a}.${b}k`;
      }
    } else {
      return `${n}`;
    }
  },
  /**
   * 为MobileSelect插件组装日期数据
   * @param start 开始日期（moment对象）
   * @param end 结束日期（moment对象）
   */
  generateDateDataForMobileSelect: function(start, end) {
    let dateArrayForMobileSelect = [];
    let dateInitObj = {};
    for (let d = 0; d < moment.duration(end.diff(start)).asDays(); d++) {
      let _start = moment(Object.assign({}, start));
      _start.add(d, 'd');
      if (!(_start.year() in dateInitObj)) {
        dateInitObj[_start.year()] = {
          [_start.month() + 1]: {
            [_start.date()]: {},
          },
        };
      } else {
        if (!(_start.month() + 1 in dateInitObj[_start.year()])) {
          dateInitObj[_start.year()][_start.month() + 1] = {
            [_start.date()]: {},
          };
        } else {
          if (!(_start.date() in dateInitObj[_start.year()][_start.month() + 1])) {
            dateInitObj[_start.year()][_start.month() + 1][_start.date()] = {};
          }
        }
      }
    }
    for (let year in dateInitObj) {
      dateArrayForMobileSelect.push({
        id: `${year}`,
        value: `${year}`,
        title: `${year}年`,
        childs: [],
      });
      for (let month in dateInitObj[year]) {
        for (let i = 0; i < dateArrayForMobileSelect.length; i++) {
          if (dateArrayForMobileSelect[i].id === `${year}`) {
            dateArrayForMobileSelect[i].childs.push({
              id: `${year}${month < 10 ? `0${month}` : month}`,
              value: `${year}-${month < 10 ? `0${month}` : month}`,
              title: `${month < 10 ? `0${month}` : month}月`,
              childs: [],
            });
            break;
          }
        }
        for (let date in dateInitObj[year][month]) {
          for (let i = 0; i < dateArrayForMobileSelect.length; i++) {
            if (dateArrayForMobileSelect[i].id === `${year}`) {
              for (let j = 0; j < dateArrayForMobileSelect[i].childs.length; j++) {
                if (dateArrayForMobileSelect[i].childs[j].id === `${year}${month < 10 ? `0${month}` : month}`) {
                  dateArrayForMobileSelect[i].childs[j].childs.push({
                    id: `${year}${month < 10 ? `0${month}` : month}${date < 10 ? `0${date}` : date}`,
                    value: `${year}-${month < 10 ? `0${month}` : month}-${date < 10 ? `0${date}` : date}`,
                    title: `${date < 10 ? `0${date}` : date}日`,
                    childs: [],
                  });
                }
              }
              break;
            }
          }
        }
      }
    }
    return dateArrayForMobileSelect;
  },
  /**
   * 根据日期数组为MobileSelect插件组装日期数据
   * @param dateArr 日期数组 如['2020-03-04', '2020-03-05', '2020-04-01', '2021-01-31']
   */
  generateDateDataByDateArrayForMobileSelect: function(dateArr) {
    let dateObj = {};
    let selectData = [];
    for (let i = 0; i < dateArr.length; i++) {
      let momentDate = moment(dateArr[i]);
      let year = momentDate.year();
      let month = momentDate.month() + 1;
      let date = momentDate.date();
      if (!dateObj[year]) {
        dateObj[year] = {};
      }
      for (let j in dateObj) {
        if (parseInt(j) === year && !dateObj[year][month]) {
          dateObj[year][month] = {};
        }
        for (let z in dateObj[year]) {
          if (parseInt(z) === month) {
            dateObj[year][month][date] = {};
          }
        }
      }
    }
    for (let year in dateObj) {
      selectData.push({
        id: `${year}`,
        value: `${year}`,
        title: `${year}年`,
        childs: [],
      });
      for (let month in dateObj[year]) {
        for (let i = 0; i < selectData.length; i++) {
          if (selectData[i].id === `${year}`) {
            selectData[i].childs.push({
              id: `${year}${month < 10 ? `0${month}` : month}`,
              value: `${year}${month < 10 ? `0${month}` : month}`,
              title: `${month < 10 ? `0${month}` : month}月`,
              childs: [],
            });
          }
          for (let date in dateObj[year][month]) {
            for (let j = 0; j < selectData[i].childs.length; j++) {
              if (selectData[i].childs[j].id === `${year}${month < 10 ? `0${month}` : month}`) {
                selectData[i].childs[j].childs.push({
                  id: `${year}${month < 10 ? `0${month}` : month}${date < 10 ? `0${date}` : date}`,
                  value: `${year}-${month < 10 ? `0${month}` : month}-${date < 10 ? `0${date}` : date}`,
                  title: `${date < 10 ? `0${date}` : date}日`,
                  childs: [],
                });
              }
            }
          }
        }
      }
    }
    return selectData;
  },
  /**
   * 根据日期查询该日期在MobileSelect日期数据里对应的索引值
   * @param dateData 日期数据元
   * @param target 时间戳
   */
  getDateDataForMobileSelectIndexByDate: function(dateData, target) {
    let index = [];
    for (let y = 0; y < dateData.length; y++) {
      for (let m = 0; m < dateData[y].childs.length; m++) {
        for (let d = 0; d < dateData[y].childs[m].childs.length; d++) {
          // eslint-disable-next-line eqeqeq
          if (dateData[y].childs[m].childs[d].id == moment(Number(target)).format('YYYYMMDD')) {
            index = [y, m, d];
            break;
          }
        }
      }
    }
    return index;
  },
  /**
   * 判断是否为微信浏览器
   */
  isWeiXin: function() {
    var ua = window.navigator.userAgent.toLowerCase();
    // eslint-disable-next-line eqeqeq
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
      return true;
    } else {
      return false;
    }
  },
  /**
   * 后端时间戳转前端时间戳
   * @param timestamp 后端时间戳
   */
  backendToFrontendTimestamp: function(timestamp) {
    return timestamp * 1000;
  },
  /**
   * 格式化日期
   */
  formatDate: {
    /**
     * 转为 YYYY-MM-DD hh:mm 格式
     * @param timestamp 时间戳
     */
    toYYYYMMDDhhmm: function(timestamp) {
      return moment(timestamp).format('YYYY-MM-DD HH:mm');
    },
    /**
     * 转为 YYYY-MM-DD 格式
     * @param timestamp 时间戳
     */
    toYYYYMMDD: function(timestamp) {
      return moment(timestamp).format('YYYY-MM-DD');
    },
  },
  /**
   * 游玩时间 转换为分钟
   * @param minutes 分钟数
   */
  formatMinutes: function(minutes) {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes - days * 1440) / 60);
    const mins = minutes % 60;
    let string = '';
    if (days > 0) {
      string += `${days}天`;
    }
    if (hours > 0) {
      string += `${hours}小时`;
    }
    if (mins > 0) {
      string += `${mins}分`;
    }
    return string;
  },
  /**
   * 数字转xxxx.xxW
   * @param n 数字
   */
  numberToW: function(n) {
    if (n >= 10000) {
      if (n >= 9999000) {
        return '999w+';
      } else {
        var a = Math.floor(n / 10000);
        var b = Math.floor((n % 10000) / 1000);
        if (b === 0) {
          return `${a}w`;
        } else {
          return `${a}.${b}w`;
        }
      }
    } else {
      return `${n}`;
    }
  },
  /**
   * 返回一个新数组，新数组为传入数组增加 key 属性, key 属性等于原数组的 dataIndex 属性
   * @param arr {Object[]} 需要处理的数组
   * @return {Object[]} 处理后的数组
   */
  addKey: function(arr = []) {
    return arr.map((item, index) => {
      return {
        ...item,
        key: index.dataIndex,
      };
    });
  },
  /**
   * 返回一个新数组，新数组为传入数组增加 index 属性
   * @param arr {Object[]} 需要处理的数组
   * @returns {Object[]} 处理后的新数组
   */
  addIndex: function(arr = []) {
    return arr.map((item, index) => {
      return {
        ...item,
        index: index + 1,
      };
    });
  },
  /**
   * 将 antd 的 moment 对象转换为 YYYY-MM-DD HH:mm:ss，传入为空时返回空
   * @param timestamp
   * @returns {String}
   */
  momentToYYYYMMDDhhmmss: function(timestamp) {
    if (!timestamp) return timestamp;
    return timestamp.format('YYYY-MM-DD HH:mm:ss');
  },
  /**
   * 导出文件
   * @param blob Blob 对象
   * @param fileName 导出文件名
   */
  exportFile: function(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const aLink = document.createElement('a');
    aLink.style.display = 'none';
    aLink.href = url;
    aLink.setAttribute('download', fileName);
    document.body.appendChild(aLink);
    aLink.click();
    document.body.removeChild(aLink);
    window.URL.revokeObjectURL(url);
  },
};

export default utils;
