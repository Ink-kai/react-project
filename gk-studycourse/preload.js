
window.onload = function () {
    const $ = require("./jquery.min.js")
    const Swal = require("./sweetalert2@8.js")
    const gkStudyCourse = require("./gkStudyCourse.js")
    const href = window.location.href
    $(document.body).append(`<template id="my-template">
    <swal-title>
      Save changes to "Untitled 1" before closing?
    </swal-title>
    <swal-icon type="warning" color="red"></swal-icon>
    <swal-button type="confirm">
      Save As
    </swal-button>
    <swal-button type="cancel">
      Cancel
    </swal-button>
    <swal-button type="deny">
      Close without Saving
    </swal-button>
    <swal-param name="allowEscapeKey" value="false" />
    <swal-param
      name="customClass"
      value='{ "popup": "my-popup" }' />
    <swal-function-param
      name="didOpen"
      value="popup => console.log(popup)" />
  </template>`)
    $.each($("body div.wrapper>script"), (i, item) => {
        eval($(item).html().replace("var ", "window."))
    })
    // 核心类
    const gk = new gkStudyCourse($, Swal, window)
    /* 课程页面 */
    if (/lms.ouchn.cn\/course\/(\d+)\/ng#/.test(href)) {
        gk.DisposeCoursePage()
    } else if (/learning-activity\/full-screen\#/.test(href)) {
        gk.ResolvePaste()
    }
}