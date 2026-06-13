export default defineAppConfig({
  pages: [
    'pages/goal-board/index',
    'pages/breakdown/index',
    'pages/today/index',
    'pages/review/index',
    'pages/stats/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '季度目标',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#9CA3AF',
    selectedColor: '#5B8DEF',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/goal-board/index',
        text: '目标看板'
      },
      {
        pagePath: 'pages/breakdown/index',
        text: '拆解计划'
      },
      {
        pagePath: 'pages/today/index',
        text: '今日行动'
      },
      {
        pagePath: 'pages/review/index',
        text: '复盘记录'
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计'
      }
    ]
  }
})
