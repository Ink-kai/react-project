// ==UserScript==
// @name         自动评阅
// @namespace    https://ink-kai.github.io/
// @license      MIT
// @version      1.0
// @description  自动评阅
// @author       Ink
// @match        https://lms.ouchn.cn/*
// @require     https://cdn.jsdelivr.net/npm/sweetalert2@8
// ==/UserScript==

(function () {
  "use strict";
  window.onload = async function () {
    let href = window.location.href;
    let getHeader = {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "sec-ch-ua":
          '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
      },
      referrer: "https://lms.ouchn.cn/course/30000006796/learning-activity",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    };
    if (
      /https:\/\/lms.ouchn.cn\/exam(.*)(?=subjects)(.*)(?=examinee)/.test(href)
    ) {
      let comment = null;
      $(".hd.clearfix>div:first").after(
        `<div id="InkContent" style="position: fixed;top: 1px;left: 400px;">
        <button class='button' id="stopcomment">暂停</button>
        &nbsp;
        <button class='button' id="startcomment">开始</button>
        </div>`
      );
      $("div#InkContent>#stopcomment").on("click", function () {
        clearInterval(comment);
      });
      $("div#InkContent>#startcomment").on("click", function () {
        comment = setInterval(async () => {
          let total_score = $(".score-list .score-area.ng-binding").text();
          let not = $("span[ng-bind='submissionHasMarkedCount']").text();
          let count = $("span[ng-bind='allSubmissionCount']").text();
          if (parseInt(total_score) !== 100) {
            await commentScore();
          } else if (parseInt(not) === parseInt(count)) {
            showMsg("评阅完成", "info", "top", 3000);
            clearInterval(comment);
          } else {
            showMsg("进行下一个评阅", "info", "top", 3000);
            $(
              ".submission.left.examinee-list .icon-student-right-narrow"
            ).click();
          }
        }, 1000);
      });
      // 批改
      comment = setInterval(async () => {
        let total_score = $(".score-list .score-area.ng-binding").text();
        let not = $("span[ng-bind='submissionHasMarkedCount']").text();
        let count = $("span[ng-bind='allSubmissionCount']").text();
        if (parseInt(total_score) !== 100) {
          await commentScore();
        } else if (parseInt(not) === parseInt(count)) {
          showMsg("评阅完成", "info", "top", 3000);
          clearInterval(comment);
        } else {
          showMsg("进行下一个评阅", "info", "top", 1000);
          $(
            ".submission.left.examinee-list .icon-student-right-narrow"
          ).click();
        }
      }, 1000);
    } else if (
      /course\/(\d+)\/learning-activity/.test(window.location.pathname)
    ) {
      setInterval(() => {
        if (
          $("#InkContent").length === 0 &&
          $(".filter-area.columns.large-32").length > 0
        ) {
          $(".filter-area.columns.large-32").append(
            `<span id="InkContent" style="display:flex;align-items: center;top: 8px;position: relative;left: 15px;">分数：
          <input style="width:10%" autocomplete="off" spellcheck="false" type="text" placeholder="85" name="start_score" class="ivu-input ivu-input-default">
          <input style="width:10%" autocomplete="off" spellcheck="false" type="text" placeholder="98" name="end_score" class="ivu-input ivu-input-default">&nbsp;
          <button class='button' id="outSubmitScore">最终成绩修改</button>&nbsp;<button class='button' id="SubmitScore">批改</button></span>`
          );
          $("#outSubmitScore").on("click", function () {
            outReviewScore();
          });
          $("#SubmitScore").on("click", function () {
            reviewScore();
          });
        }
      }, 500);
    }
  };
})();

async function commentScore() {
  let question_body = $(".paper-content.card.ng-scope");
  let arr = Array.from($(question_body).find("ol>li[id*='subject']"));
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    let score = $(item)
      .find(".subject-point> span:nth-child(2)>span:first")
      .text();
    let score_input = $(item).find(
      ".subject-score.ng-scope input[name='score']"
    );
    if (score !== 0 && $(score_input).length > 0) {
      await ((score) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            $(score_input).trigger("input");
            $(score_input).val(score);
            $(score_input).trigger("change");
            $(score_input).trigger("blur");
            resolve();
          }, randomNumBoth(1, 2) * 1000);
        });
      })(score);
    }
  }
}

async function outReviewScore() {
  // 打分
  showMsg("开始打分", "info", "top", 2000);
  let exam_id = window.location.hash.match(/\d+/)[0];

  let getHeader = {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "content-type": "application/json; charset=UTF-8",
      "sec-ch-ua":
        '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: "https://lms.ouchn.cn/course/30000006796/learning-activity",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "POST",
    mode: "cors",
    credentials: "include",
  };
  let body = {
    org_id: globalData.course.orgId,
    user_id: globalData.user.id,
    course_id: globalData.course.id,
    enrollment_role: "student_manager",
    is_teacher: true,
    activity_id: exam_id,
    activity_type: "homework",
    activity_name: null,
    module: null,
    action: "update_final_score",
    ts: new Date().getTime(),
    user_agent: window.navigator.userAgent,
    mode: "normal",
    channel: "web",
    target_info: {},
    master_course_id: globalData.course.id,
    org_name: globalData.user.orgName,
    org_code: globalData.user.orgCode,
    user_no: globalData.user.userNo,
    user_name: globalData.user.name,
    course_code: globalData.course.courseCode,
    course_name: globalData.course.name,
    dep_id: globalData.dept.id,
    dep_name: globalData.dept.name,
    dep_code: globalData.dept.code,
  };
  let homeworkHeader = {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "sec-ch-ua":
        '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    referrer: "https://lms.ouchn.cn/course/30000006796/learning-activity",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  };
  let min_score = 85,
    max_score = 98;
  if (
    $.isNumeric($("input[name='start_score']").val().trim()) &&
    $.isNumeric($("input[name='end_score']").val().trim())
  ) {
    min_score = parseFloat($("input[name='start_score']").val().trim());
    max_score = parseFloat($("input[name='end_score']").val().trim());
  }
  let { total: total } = await fetch(
    `https://lms.ouchn.cn/api/homework/${exam_id}/submission-list?conditions=%7B%22org_id%22:null,%22department_ids%22:%5B%5D,%22grade_ids%22:%5B%5D,%22class_ids%22:%5B%5D,%22status%22:%22all%22,%22marked%22:%22all%22,%22keyword%22:%22%22,%22learning_center%22:true%7D&page=1&page_size=1`,
    homeworkHeader
  ).then((res) => res.json());
  if (total > 0) {
    let { submissions: submissions } = await fetch(
      `https://lms.ouchn.cn/api/homework/${exam_id}/submission-list?conditions=%7B%22org_id%22:null,%22department_ids%22:%5B%5D,%22grade_ids%22:%5B%5D,%22class_ids%22:%5B%5D,%22status%22:%22all%22,%22marked%22:%22all%22,%22keyword%22:%22%22,%22learning_center%22:true%7D&page=1&page_size=${total}`,
      homeworkHeader
    ).then((res) => res.json());
    submissions.forEach(async (item) => {
      let score = randomNumBoth(min_score, max_score);
      let id = item.submission.id;
      let { message: message, submission: submission } = await giveScore(
        `https://lms.ouchn.cn/api/course/activities/${exam_id}/score`,
        {
          student_id: item.student.id,
          score: score,
        }
      ).then((res) => res.json());
      console.log(
        `${submission.created_by.name}\t打分\t${score}\t结果:${message}`
      );
      // getHeader.body = JSON.stringify(body);
      // statistics(getHeader);
    });
  } else {
    showMsg(`程序异常`, "error", "top", 3000);
  }
  showMsg(`总计${total}人打分完成`, "success", "top", 3000);
  window.location.reload();
}

async function reviewScore() {
  // 打分
  showMsg("开始批改", "info", "top", 2000);
  let exam_id = window.location.hash.match(/\d+/)[0];

  let getHeader = {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "content-type": "application/json; charset=UTF-8",
      "sec-ch-ua":
        '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
    },
    referrer: "https://lms.ouchn.cn/course/30000006796/learning-activity",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "POST",
    mode: "cors",
    credentials: "include",
  };
  let body = {
    org_id: globalData.course.orgId,
    user_id: globalData.user.id,
    course_id: globalData.course.id,
    enrollment_role: "student_manager",
    is_teacher: true,
    activity_id: exam_id,
    activity_type: "homework",
    activity_name: null,
    module: null,
    action: "give_score",
    ts: new Date().getTime(),
    user_agent: window.navigator.userAgent,
    mode: "normal",
    channel: "web",
    target_info: { type: "personal", is_student: true },
    master_course_id: globalData.course.id,
    org_name: globalData.user.orgName,
    org_code: globalData.user.orgCode,
    user_no: globalData.user.userNo,
    user_name: globalData.user.name,
    course_code: globalData.course.courseCode,
    course_name: globalData.course.name,
    dep_id: globalData.dept.id,
    dep_name: globalData.dept.name,
    dep_code: globalData.dept.code,
  };
  let homeworkHeader = {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "sec-ch-ua":
        '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    referrer: "https://lms.ouchn.cn/course/30000006796/learning-activity",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  };
  let min_score = 85,
    max_score = 98;
  if (
    $.isNumeric($("input[name='start_score']").val().trim()) &&
    $.isNumeric($("input[name='end_score']").val().trim())
  ) {
    min_score = parseFloat($("input[name='start_score']").val().trim());
    max_score = parseFloat($("input[name='end_score']").val().trim());
  }
  let { total: first_total } = await fetch(
    `https://lms.ouchn.cn/api/homework/${exam_id}/submission-list?conditions=%7B%22org_id%22:null,%22department_ids%22:%5B%5D,%22grade_ids%22:%5B%5D,%22class_ids%22:%5B%5D,%22status%22:%22all%22,%22marked%22:%22all%22,%22keyword%22:%22%22,%22learning_center%22:true%7D&page=1&page_size=1`,
    homeworkHeader
  ).then((res) => res.json());
  if (first_total > 0) {
    let { submissions: submissions, total: total } = await fetch(
      `https://lms.ouchn.cn/api/homework/${exam_id}/submission-list?conditions=%7B%22org_id%22:null,%22department_ids%22:%5B%5D,%22grade_ids%22:%5B%5D,%22class_ids%22:%5B%5D,%22status%22:%22submitted%22,%22marked%22:%22all%22,%22keyword%22:%22%22,%22learning_center%22:true%7D&page=1&page_size=${first_total}`,
      homeworkHeader
    ).then((res) => res.json());
    for (let i = 0; i < submissions.length; i++) {
      const item = submissions[i];
      let score = randomNumBoth(min_score, max_score);
      let id = item.submission.id;
      let { final_score: final_score } = await givesocreInterface(
        `https://lms.ouchn.cn/api/course/activities/${exam_id}/submission/score?fields=id,score,instructor_comment,rubric_score,final_score`,
        {
          score: score,
          reviewer_comment: null,
          uploads: [],
          id: id,
          student_id: item.student.id,
        }
      );
      // await ((item, body, getHeader) => {
      //   return new Promise((resolve, reject) => {
      //     setTimeout(async () => {
      //       body.target_info["id"] = item.student.id;
      //       getHeader.body = JSON.stringify(body);
      //       await fetch(
      //         "https://lms.ouchn.cn/statistics/api/learning-activity",
      //         getHeader
      //       );
      //       resolve();
      //       console.log("延时");
      //     }, randomNumBoth(1, 3) * 1000);
      //   });
      // })(item, body, getHeader);
      console.log(`${item.student.name}\t批改\t${final_score}`);
    }
    showMsg(`总计${total}人批改完成`, "success", "top", 3000);
  } else {
    showMsg(`程序异常`, "error", "top", 3000);
  }
  // window.location.reload();
}
function givesocreInterface(url, body) {
  return fetch(url, {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "content-type": "application/json;charset=UTF-8",
      "sec-ch-ua":
        '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    referrer: "https://lms.ouchn.cn/course/30000006852/learning-activity",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: JSON.stringify(body),
    method: "PUT",
    mode: "cors",
    credentials: "include",
  }).then((res) => res.json());
}
function giveScore(url, body) {
  return fetch(url, {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "content-type": "application/json;charset=UTF-8",
      "sec-ch-ua":
        '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    referrer: "https://lms.ouchn.cn/course/30000006796/learning-activity",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: JSON.stringify(body),
    method: "PUT",
    mode: "cors",
    credentials: "include",
  });
}
function statistics(headers) {
  return fetch(
    "https://lms.ouchn.cn/statistics/api/learning-activity",
    headers
  );
}
function randomNumBoth(Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  var num = Min + Math.round(Rand * Range); //四舍五入
  return num;
}
function showMsg(title, type = "success", position = "top", timer = 2000) {
  Swal.fire({
    toast: true,
    position: position,
    type: type,
    title: title,
    showConfirmButton: false,
    timer: timer,
  });
}
