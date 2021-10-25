const vglobal = function(context) {
  return {
    // sessionStorage 的方法
    sessionStorage: {
      // 用户信息
      userInfo: {
        // 获取
        get: function() {
          return JSON.parse(window.sessionStorage.getItem('userInfo'));
        },
        /**
         * 设置
         * @param obj 需要存下来的对象
         */
        set: function(obj) {
          window.sessionStorage.setItem('userInfo', JSON.stringify(obj));
        },
        // 移除
        remove: function() {
          window.sessionStorage.removeItem('userInfo');
        },
      },
      // 企业认证信息
      enterpriseCertification: {
        // 获取
        get: function() {
          return JSON.parse(window.sessionStorage.getItem('enterpriseCertification'));
        },
        /**
         * 设置
         * @param obj 需要存下来的对象
         */
        set: function(obj) {
          window.sessionStorage.setItem('enterpriseCertification', JSON.stringify(obj));
        },
        // 移除
        remove: function() {
          window.sessionStorage.removeItem('enterpriseCertification');
        },
      },
    },
    // sessionStorage 的方法
    localStorage: {
      // token
      t: {
        /**
         * 获取
         */
        get: function() {
          return JSON.parse(window.localStorage.getItem('t'));
        },
        /**
         * 设置
         * @param obj 需要存下来的对象
         */
        set: function(obj) {
          window.localStorage.setItem('t', JSON.stringify(obj));
        },
        /**
         * 移除
         */
        remove: function() {
          window.localStorage.removeItem('t');
        },
      },
      // 语言
      lang: {
        /**
         * 获取
         */
        get: function() {
          return JSON.parse(window.localStorage.getItem('lang'));
        },
        /**
         * 设置
         * @param obj 需要存下来的对象
         */
        set: function(obj) {
          window.localStorage.setItem('lang', JSON.stringify(obj));
        },
        /**
         * 移除
         */
        remove: function() {
          window.localStorage.removeItem('lang');
        },
      },
    },
    // loading
    loading: {
      obj: null,
      show: function(content) {
        const _this = this;
        let _content = content ? content : context.$t('public.network.loading');
        _this.obj = context.$message.loading(_content, 0);
      },
      hide: function() {
        const _this = this;
        _this.obj();
      },
    },
    /**
     * 下拉框筛选方法
     */
    selectFilterOption: function(inputValue, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
    },
    /**
     * 获取从今天倒数x天的日期范围
     */
    getDateRangeFromToday(daysCount) {
      return {
        startDate: moment()
          .add(daysCount, 'days')
          .format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
      };
    },
    /**
     * 递归重写权限数据里的 title 值
     */
    recursionForRewriteAuthorityTitle(context, data) {
      const _this = this;
      for (let i = 0; i < data.length; i++) {
        if (context.localLang === 'zh-CN') {
          data[i].title = `${data[i].functionNames[0].name}`;
        } else if (context.localLang === 'en-US') {
          data[i].title = data[i].functionNames[1] ? `${data[i].functionNames[1].name}` : '';
        }
        if (data[i].children && data[i].children.length > 0) {
          data[i].children = _this.recursionForRewriteAuthorityTitle(context, data[i].children);
        }
      }
      return data;
    },
    /**
     * 遍历antFileList，筛除上传失败的项
     */
    getUploadErrorFile(obj) {
      let arr = [];
      arr = obj.fileList;
      for (let i = 0; i < obj.fileList.length; i++) {
        let item = obj.fileList[i];
        if (item.response && !String(item.response.status).startsWith('2')) {
          arr[i].status = constant.AD.FILE_STATUS.ERROR;
        }
      }
      return arr;
    },
    /**
     * 遍历antFileList，筛选成功的项
     */
    getUploadOkFile(list) {
      let filesArr = [];
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (item.response && String(item.response.status).startsWith('2')) {
          item.url = item.response.data;
          filesArr.push(item);
        }
      }
      return filesArr;
    },
    /**
     * 判断用户权限列表中是否有该权限
     * @param type 权限类型
     * @param marker 标识
     */
    getJurisdictionStatus(type, marker, functions) {
      for (let i = 0; i < functions.length; i++) {
        let item = functions[i];
        if (item.type === type && item.alias === marker) {
          return true;
        }
        if (item.children && item.children.length > 0) {
          if (context.$global.getJurisdictionStatus(type, marker, item.children)) {
            return true;
          } else {
            continue;
          }
        }
      }
      return false;
    },
    sceneChart: {
      init: function(context, cellsData) {
        // 注册边
        Graph.registerEdge(
          'dark-edge',
          {
            zIndex: -1,
            attrs: {
              line: {
                stroke: '#585858',
                strokeWidth: 3,
                sourceMarker: null,
                targetMarker: null,
              },
            },
          },
          true
        );
        context.sceneChart.graph = new Graph({
          container: document.getElementById('tChartContainer'),
          width: document.getElementById('tChartContainer').clientWidth,
          height: document.getElementById('tChartContainer').clientHeight,
          grid: { visible: true },
          background: '#f0f0f0',
          mousewheel: {
            enabled: true,
            factor: 1.1,
          },
          panning: {
            enabled: true,
            // modifiers: 'shift',
          },
          interacting: {
            nodeMovable: false,
          },
          async: true,
          frozen: true,
        });
        context.sceneChart.dagreLayout = new DagreLayout({
          type: 'dagre',
          rankdir: 'TB',
          align: 'DL',
          ranksep: 24,
          nodesep: 12,
          controlPoints: false,
          nodeSize: [context.sceneChart.baseFontSize * 20, context.sceneChart.baseFontSize * 10],
        });
        context.sceneChart.graph.freeze();
        if (cellsData) {
          cellsData.nodes.forEach(item => {
            if (item.parent) {
              context.sceneChart.graph.addNode(
                context.$global.sceneChart.createChildNode(context, {
                  id: item.id,
                  parent: item.parent,
                  children: item.children,
                  data: {
                    data: item.data.data,
                    isRoot: false,
                    active: false,
                  },
                  addClickCallback: (ev, parent) => context.$global.sceneChart.handleChildNodeAddClick(context, ev, parent),
                  delClickCallback: (ev, own) => context.$global.sceneChart.handleChildNodeDelClick(context, ev, own),
                  bodyClickCallback: (srcele, ev, own) => context.$global.sceneChart.handleChildNodeBodyClick(context, srcele, ev, own),
                })
              );
            } else {
              context.sceneChart.graph.addNode(
                context.$global.sceneChart.createRootNode(context, {
                  id: item.id,
                  parent: item.parent,
                  children: item.children,
                  data: {
                    data: item.data.data,
                    isRoot: true,
                    active: false,
                  },
                  addClickCallback: (ev, parent) => context.$global.sceneChart.handleRootNodeAddClick(context, ev, parent),
                  bodyClickCallback: (srcele, ev, own) => context.$global.sceneChart.handleRootNodeBodyClick(context, srcele, ev, own),
                })
              );
            }
          });
          cellsData.edges.forEach(item => {
            context.sceneChart.graph.addEdge(
              context.$global.sceneChart.createEdge({
                source: item.source.cell,
                target: item.target.cell,
              })
            );
          });
        } else {
          context.sceneChart.graph.addNode(
            context.$global.sceneChart.createRootNode(context, {
              data: {
                data: {
                  sendType: dataDictionary['015']['001'].CODE,
                },
                isRoot: true,
                active: false,
              },
              addClickCallback: (ev, parent) => context.$global.sceneChart.handleRootNodeAddClick(context, ev, parent),
              bodyClickCallback: (srcele, ev, own) => context.$global.sceneChart.handleRootNodeBodyClick(context, srcele, ev, own),
            })
          );
        }
        context.$global.sceneChart.layout(context);
        context.sceneChart.graph.unfreeze();
        setTimeout(() => {
          context.sceneChart.graph.centerContent();
          document
            .querySelector(`[data-cell-id="${context.sceneChart.graph.getRootNodes()[0].id}"]`)
            .querySelector('.body')
            .click();
        }, 0);
      },
      createRootNode: function(context, { id, parent, children, data, addClickCallback, bodyClickCallback }) {
        return {
          id: id || null,
          parent: parent || null,
          children: children || [],
          width: context.sceneChart.baseFontSize * 20,
          height: context.sceneChart.baseFontSize * 10,
          shape: 'html',
          data: data,
          html: function(_context) {
            const wrap = document.createElement('div');
            const cdata = _context.data.data;
            wrap.className = 'scene-tree';
            if (cdata.templateId && cdata.identifyKeywords && cdata.identifyKeywords.length > 0) {
              wrap.innerHTML = `
                <div class="root">
                  <div class="body">
                    <div class="icon"></div>
                    <div class="title">${cdata.templateName}</div>
                  </div>
                  <div class="add"></div>
                </div>
              `;
              wrap.querySelector('.add').onclick = function(ev) {
                addClickCallback(ev, _context);
              };
            } else {
              wrap.innerHTML = `
                <div class="root edit">
                  <div class="body">
                    <div class="icon"></div>
                  </div>
                </div>
              `;
            }
            if (_context.data.active) {
              wrap.querySelector('.body').classList.add('active');
            } else {
              wrap.querySelector('.body').classList.remove('active');
            }
            wrap.querySelector('.body').onclick = function(ev) {
              bodyClickCallback(this, ev, _context);
            };
            return wrap;
          }.bind(this),
        };
      },
      createChildNode: function(context, { id, parent, children, data, addClickCallback, delClickCallback, bodyClickCallback }) {
        return {
          id: id || null,
          parent: parent || null,
          children: children || [],
          width: context.sceneChart.baseFontSize * 20,
          height: context.sceneChart.baseFontSize * 10,
          shape: 'html',
          data: data,
          html: function(_context) {
            const wrap = document.createElement('div');
            const cdata = _context.data.data;
            wrap.className = 'scene-tree';
            if (cdata.templateId && cdata.identifyKeywords && cdata.identifyKeywords.length > 0) {
              wrap.innerHTML = `
                <div class="child">
                  <div class="body">
                    <div class="item keywords">
                      <div class="icon"></div>
                      <div class="text">${cdata.identifyKeywords}</div>
                    </div>
                    <div class="item template">
                      <div class="icon"></div>
                      <div class="text">${cdata.templateName}</div>
                    </div>
                  </div>
                  <div class="add"></div>
                  <div class="del"></div>
                </div>
              `;
              wrap.querySelector('.add').onclick = function(ev) {
                addClickCallback(ev, _context);
              };
            } else {
              wrap.innerHTML = `
                <div class="child edit">
                  <div class="body">
                    <div class="icon"></div>
                  </div>
                  <div class="del"></div>
                </div>
              `;
            }
            if (_context.data.active) {
              wrap.querySelector('.body').classList.add('active');
            } else {
              wrap.querySelector('.body').classList.remove('active');
            }
            wrap.querySelector('.del').onclick = function(ev) {
              delClickCallback(ev, _context);
            };
            wrap.querySelector('.body').onclick = function(ev) {
              bodyClickCallback(this, ev, _context);
            };
            return wrap;
          }.bind(this),
        };
      },
      createEdge: function({ source, target }) {
        return {
          source,
          target,
          shape: 'dark-edge',
          router: {
            name: 'manhattan',
            args: {
              startDirections: ['bottom'],
              endDirections: ['top'],
            },
          },
        };
      },
      layout: function(context) {
        context.sceneChart.graph.fromJSON(
          context.sceneChart.dagreLayout.layout({
            nodes: context.sceneChart.graph.getNodes().map(item => item.toJSON()),
            edges: context.sceneChart.graph.getEdges().map(item => {
              return {
                shape: item.shape,
                source: item.source.cell,
                target: item.target.cell,
                router: item.router,
              };
            }),
          })
        );
      },
      addChildNode: function(context, ev, parent) {
        context.sceneChart.graph.freeze();
        let newNode = context.sceneChart.graph.addNode(
          context.$global.sceneChart.createChildNode(context, {
            data: {
              data: { sendType: dataDictionary['015']['001'].CODE },
              active: false,
            },
            addClickCallback: (ev, _context) => context.$global.sceneChart.handleChildNodeAddClick(context, ev, _context),
            delClickCallback: (ev, own) => context.$global.sceneChart.handleChildNodeDelClick(context, ev, own),
            bodyClickCallback: (srcele, ev, own) => context.$global.sceneChart.handleChildNodeBodyClick(context, srcele, ev, own),
          })
        );
        let newEdge = context.sceneChart.graph.addEdge(
          context.$global.sceneChart.createEdge({
            source: parent.id,
            target: newNode.id,
          })
        );
        parent.addChild(newNode, true); // 设置子节点
        parent.addChild(newEdge, true); // 设置子边
        context.$global.sceneChart.layout(context);
        context.sceneChart.graph.unfreeze();
        // 计算子节点
        if (context.sceneChart.activeNode.id === parent.id) {
          const childrenNode = parent.getChildren().filter(item => item.isNode());
          if (childrenNode) {
            context.nodeForm.childrenData = childrenNode.map(item => item.data.data);
          }
        }
      },
      handleRootNodeAddClick: function(context, ev, parent) {
        if (context.sceneChart.graph.getNodes().length >= 1000) {
          context.$message.warning('场景不能超过1000个节点');
          return false;
        }
        if (parent.getChildren() && parent.getChildren().length >= 100) {
          context.$message.warning('节点不能超过100个子节点');
          return false;
        }
        context.$global.sceneChart.addChildNode(context, ev, parent);
      },
      handleChildNodeAddClick: function(context, ev, parent) {
        if (context.sceneChart.graph.getNodes().length >= 1000) {
          context.$message.warning('场景不能超过1000个节点');
          return false;
        }
        if (parent.getChildren() && parent.getChildren().length >= 100) {
          context.$message.warning('节点不能超过100个子节点');
          return false;
        }
        context.$global.sceneChart.addChildNode(context, ev, parent);
      },
      handleChildNodeDelClick: function(context, ev, own) {
        context.$confirm({
          title: '删除节点',
          content: '删除节点会导致其子节点一并删除，确定要删除当前节点吗？',
          onOk() {
            return new Promise(resolve => {
              let descendants = own.getDescendants(true).map(item => item.id);
              descendants.push(own.id);
              context.sceneChart.lastActiveNodeId = null;
              context.sceneChart.activeNode = null;
              context.sceneChart.graph.freeze();
              context.sceneChart.graph.removeCells(descendants);
              context.$global.sceneChart.layout(context);
              context.sceneChart.graph.unfreeze();
              resolve();
            }).catch(err => err);
          },
          onCancel() {},
        });
      },
      nodeBodyClick(context, srcele, ev, own) {
        const parentNode = own.getParent();
        const childrenNode = own.getChildren();
        context.nodeForm.parentData = null;
        context.nodeForm.childrenData = [];
        if (parentNode) {
          context.nodeForm.parentData = parentNode.data.data;
        }
        if (childrenNode) {
          context.nodeForm.childrenData = childrenNode.map(item => item.data.data);
        }
        context.nodeForm.data.templateId = own.data.data.templateId || null;
        context.nodeForm.data.templateName = own.data.data.templateName || null;
        context.nodeForm.data.sendType = own.data.data.sendType || null;
        context.nodeForm.data.identifyKeywords = own.data.data.identifyKeywords || null;
        // 显示高亮
        context.sceneChart.graph.freeze();
        context.sceneChart.activeNode = context.sceneChart.graph.getCell(own.id);
        if (context.sceneChart.lastActiveNodeId && context.sceneChart.lastActiveNodeId !== own.id) {
          const a = context.sceneChart.graph.getCell(context.sceneChart.lastActiveNodeId);
          a.data.active = false;
          a.hide().show();
        }
        own.data.active = true;
        context.sceneChart.activeNode.hide().show();
        context.sceneChart.lastActiveNodeId = own.id;
        context.sceneChart.graph.unfreeze();
      },
      handleChildNodeBodyClick: function(context, srcele, ev, own) {
        context.$global.sceneChart.nodeBodyClick(context, srcele, ev, own);
      },
      handleRootNodeBodyClick: function(context, srcele, ev, own) {
        context.$global.sceneChart.nodeBodyClick(context, srcele, ev, own);
      },
    },
  };
};
export default vglobal;
