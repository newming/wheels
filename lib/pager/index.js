class Pager {
  constructor(options) {
    let defaultOptions = {
      element: null,
      buttonCount: 10,
      currentPage: 1,
      totalPage: 1,
      pageQuery: '', // 'page' url 上的 query string
      templates: {
        number: '<span>%page%</span>',
        prev: '<button class=prev>上一页</button>',
        next: '<button class=next>下一页</button>',
        first: '<button class=first>首页</button>',
        last: '<button class=last>末页</button>'
      },
    }
    this.options = Object.assign({}, defaultOptions, options)
    this.domRefs = {}
    this.currentPage = parseInt(this.options.currentPage, 10) || 1
    this.checkOptions().initHtml().bindEvents()
  }
  checkOptions() {
    if (!this.options.element) {
      throw new Error('element is required')
    }
    return this
  }
  bindEvents() {
    dom.on(this.options.element, 'click', 'ol[data-role="pageNumbers"]>li', (e, el) => {
      this.goToPage(parseInt(el.dataset.page, 10))
    })
    this.domRefs.first.addEventListener('click', () => {
      this.goToPage(1)
    })
    this.domRefs.last.addEventListener('click', () => {
      this.goToPage(this.options.totalPage)
    })
    this.domRefs.prev.addEventListener('click', () => {
      this.goToPage(this.currentPage - 1)
    })
    this.domRefs.next.addEventListener('click', () => {
      this.goToPage(this.currentPage + 1)
    })
  }
  goToPage(page) {
    if (!page || page > this.options.totalPage || page === this.currentPage) {
      return
    }
    if (this.options.pageQuery) {
      bom.queryString.set(this.options.pageQuery, page)
    }
    this.currentPage = page
    // 分发事件
    this.options.element.dispatchEvent(new CustomEvent('pageChange', { detail: { page } }))
    this.rerender()
  }
  rerender() {
    this._checkButtons()
    let newNumbers = this._createNumbers()
    let oldNumbers = this.domRefs.numbers
    oldNumbers.parentNode.replaceChild(newNumbers, oldNumbers)
    this.domRefs.numbers = newNumbers
  }
  initHtml() {
    let pager = (this.domRefs.pager = document.createElement('nav'))
    // 创建共用的四个按钮
    this.domRefs.first = dom.create(this.options.templates.first)
    this.domRefs.prev = dom.create(this.options.templates.prev)
    this.domRefs.next = dom.create(this.options.templates.next)
    this.domRefs.last = dom.create(this.options.templates.last)
    // 检测这四个按钮的样式及是否可用
    this._checkButtons()
    // 创建数字按钮
    this.domRefs.numbers = this._createNumbers()
    // 添加节点 注意顺序
    pager.appendChild(this.domRefs.first)
    pager.appendChild(this.domRefs.prev)
    pager.appendChild(this.domRefs.numbers)
    pager.appendChild(this.domRefs.next)
    pager.appendChild(this.domRefs.last)
    this.options.element.appendChild(pager)
    return this
  }
  _checkButtons() {
    // 检测按钮样式，可用不可用
    if (this.currentPage === 1) {
      this.domRefs.first.setAttribute('disabled', '')
      this.domRefs.prev.setAttribute('disabled', '')
    } else {
      this.domRefs.first.removeAttribute('disabled')
      this.domRefs.prev.removeAttribute('disabled')
    }
    if (this.currentPage === this.options.totalPage) {
      this.domRefs.next.setAttribute('disabled', '')
      this.domRefs.last.setAttribute('disabled', '')
    } else {
      this.domRefs.next.removeAttribute('disabled')
      this.domRefs.last.removeAttribute('disabled')
    }
  }
  _createNumbers() {
    let currentPage = this.currentPage
    let { buttonCount, totalPage } = this.options
    let start1 = Math.max(currentPage - Math.round(buttonCount / 2), 1) // 开始的显示的数字按钮，结束处不准确
    let end1 = Math.min(start1 + buttonCount - 1, totalPage) // 结束的显示的数字按钮

    let end2 = Math.min(currentPage + Math.round(buttonCount / 2) - 1, totalPage) // 结束的计算方式二，开始处不准确，例如 1
    let start2 = Math.max(end2 - buttonCount + 1, 1)

    let start = Math.min(start1, start2) // 拿到准确的开始位置
    let end = Math.max(end1, end2)

    let ol = dom.create('<ol data-role="pageNumbers"></ol>')
    let numbers = []
    for (var i = start; i <= end; i++) {
      let li = dom.create(`<li data-page="${i}">${this.options.templates.number.replace('%page%', i)}</li>`)
      if (i === currentPage) {
        li.classList.add('current')
      }
      ol.appendChild(li)
    }
    return ol
  }
}
