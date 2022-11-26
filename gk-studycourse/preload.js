window.onload = function () {
  
  const $ = require("./jquery.min.js")
  const Swal = require("./sweetalert2@8.js")
  const gkStudyCourse = require("./gkStudyCourse.js")
  const href = window.location.href
  $.each($("body div.wrapper>script"), (i, item) => {
    eval($(item).html().replace("var ", "window."))
  })
  const gk = new gkStudyCourse($, Swal, window)
  if (/lms.ouchn.cn\/course\/(\d+)\/ng#/.test(href)) {
    /* 课程页面 */
    gk.DisposeCoursePage()
  } else if (/learning-activity\/full-screen\#/.test(href)) {
    /* 大作业 */
    gk.ResolvePaste()
  }
}