// ==UserScript==
// @name         自动评阅
// @namespace    https://ink-kai.github.io/
// @license      MIT
// @version      2.0
// @title  自动评阅
// @description  最终成绩修改 按照状态“已提交、未批改”
// @description  批改 按照状态“已提交、未批改”
// @description  发帖评分 按照状态“已提交、未批改”
// @description  学生评阅 含有“此题未答”、“已答”提示、已经给分的不再给分
// @author       Ink
// @match        https://lms.ouchn.cn/*
// @require     https://cdn.jsdelivr.net/npm/sweetalert2@8
// ==/UserScript==

class Score {
  constructor(min_score, max_score) {
    this.max_score = max_score;
    this.min_score = min_score;
    if (parseFloat(max_score === "" ? 0 : max_score) === 0) {
      this.max_score = 98;
    }
    if (parseFloat(min_score === "" ? 0 : min_score) === 0) {
      this.min_score = 85;
    }
  }

  async commentScore() {
    let question_body = $(".paper-content.card.ng-scope");
    let arr = Array.from(
      $(question_body).find("ol>li[id*='subject']:not(.text)")
    );
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      let score = $(item)
        .find(".subject-point> span:nth-child(2)>span:first")
        .text();
      let notExpre = $(item).find(
        "div.summary-title span.answer-message.tc-tag.error.ng-scope"
      ).length;
      let score_input = $(item).find(
        ".subject-score.ng-scope input[name='score']"
      );
      // 存在“分值”输入框&&“分值”输入框为0||不包含“错误提示”
      if (
        $(score_input).length === 1 &&
        parseFloat($(score_input).val() === "" ? 0 : $(score_input).val()) ===
          0 &&
        notExpre === 0
      ) {
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
  comment() {
    setInterval(async () => {
      let total_score = $(".score-list .score-area.ng-binding").text();
      let not = $("span[ng-bind='submissionHasMarkedCount']").text();
      let count = $("span[ng-bind='allSubmissionCount']").text();
      let Condition = $(
        "div.subject-score.ng-scope input[name='score']"
      ).filter((i, item) => {
        return (
          (item.value === "" ? 0 : parseFloat(item.value)) === 0 &&
          item.localName === "input" &&
          $(item)
            .parent()
            .parent()
            .parent()
            .find("div.subject-head>.summary-title>span.answer-error.ng-scope")
            .find('span[ng-if="answerState == -1"]').length === 0
        );
      });
      let nextLink = $(
        ".submission.left.examinee-list .icon-student-right-narrow.clickable"
      );
      let page_totalScore = $(`span.actual-score.ng-scope>span`)
        .text()
        .split("分")
        .reduce(getCountScore);
      if (Condition.length > 0) {
        await this.commentScore();
      } else if (
        (Condition.length === 0 ||
          parseFloat(page_totalScore) === parseFloat(total_score)) &&
        nextLink.length === 1
      ) {
        showMsg("进行下一个评阅", "info", "top", 1000);
        $(nextLink).click();
      } else if (parseFloat(not) === parseFloat(count)) {
        showMsg("评阅完成", "info", "top", 3000);
        clearInterval(comment);
      }
    }, 1000);
  }
  giveScore() {
    setInterval(() => {
      if (
        $("#InkContent").length === 0 &&
        $(".filter-area.columns.large-32").length > 0 &&
        $(
          ".activity-detail-tabs.homework.clearfix>span.tab-title.left.active:contains('作业批改')"
        ).length === 1
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
  pageScore() {
    // 页面评分
    setInterval(() => {
      if (
        $("#InkContent").length === 0 &&
        $(".filter-area.columns.large-32").length > 0 &&
        $("span.tab-title.left:contains('评分')")[0].className.includes(
          "active"
        )
      ) {
        $(".filter-area.columns.large-32").append(
          `<span id="InkContent" style="display:flex;align-items: center;top: 8px;position: relative;left: 15px;">分数：
          <input style="width:10%" autocomplete="off" spellcheck="false" type="text" placeholder="85" name="start_score" class="ivu-input ivu-input-default">
          <input style="width:10%" autocomplete="off" spellcheck="false" type="text" placeholder="98" name="end_score" class="ivu-input ivu-input-default">&nbsp;
          <button class='button' id="pageReviewScore">评分</button></span>`
        );
        $("#pageReviewScore").on("click", function () {
          pageReviewScore();
        });
      }
    }, 500);
  }
}
(function () {
  "use strict";
  window.onload = async function () {
    let score = new Score();
    let href = window.location.href;
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
        clearInterval(score.comment);
      });
      $("div#InkContent>#startcomment").on("click", function () {
        comment = score.comment();
      });
      score.comment();
    } else if (
      /course\/(\d+)\/learning-activity/.test(window.location.pathname)
    ) {
      score.giveScore();
    } else if (
      /course\/(\d+).*\/forum\/topic-categor/.test(window.location.href)
    ) {
      score.pageScore();
    }
  };
})();

async function outReviewScore() {
  // 打分
  showMsg("开始打分", "info", "top", 2000);
  let exam_id = window.location.hash.match(/\d+/)[0];
  let max_score = 98,
    min_score = 85;
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
  if (
    $.isNumeric($("input[name='start_score']").val().trim()) &&
    $.isNumeric($("input[name='end_score']").val().trim())
  ) {
    min_score = parseFloat($("input[name='start_score']").val().trim());
    max_score = parseFloat($("input[name='end_score']").val().trim());
  }
  let { total: total } = await fetch(
    `https://lms.ouchn.cn/api/homework/${exam_id}/submission-list?conditions=%7B%22org_id%22:null,%22department_ids%22:%5B%5D,%22grade_ids%22:%5B%5D,%22class_ids%22:%5B%5D,%22status%22:%22submitted%22,%22marked%22:%22unmarked%22,%22keyword%22:%22%22,%22learning_center%22:true%7D&page=1&page_size=1`,
    homeworkHeader
  ).then((res) => res.json());
  if (total > 0) {
    let { submissions: submissions } = await fetch(
      `https://lms.ouchn.cn/api/homework/${exam_id}/submission-list?conditions=%7B%22org_id%22:null,%22department_ids%22:%5B%5D,%22grade_ids%22:%5B%5D,%22class_ids%22:%5B%5D,%22status%22:%22submitted%22,%22marked%22:%22unmarked%22,%22keyword%22:%22%22,%22learning_center%22:true%7D&page=1&page_size=${total}`,
      homeworkHeader
    ).then((res) => res.json());
    submissions.forEach(async (item) => {
      let score = randomNumBoth(min_score, max_score);
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
    });
  } else {
    showMsg(`程序异常`, "error", "top", 3000);
  }
  showMsg(`总计${total}人打分完成`, "success", "top", 3000);
  setTimeout(() => {
    window.location.reload();
  }, 3000);
}

async function reviewScore() {
  // 打分
  showMsg("开始批改", "info", "top", 2000);
  let exam_id = window.location.hash.match(/\d+/)[0];

  let max_score = 98,
    min_score = 85;
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
  if (
    $.isNumeric($("input[name='start_score']").val().trim()) &&
    $.isNumeric($("input[name='end_score']").val().trim())
  ) {
    min_score = parseFloat($("input[name='start_score']").val().trim());
    max_score = parseFloat($("input[name='end_score']").val().trim());
  }
  let { total: first_total } = await fetch(
    `https://lms.ouchn.cn/api/homework/${exam_id}/submission-list?conditions=%7B%22org_id%22:null,%22department_ids%22:%5B%5D,%22grade_ids%22:%5B%5D,%22class_ids%22:%5B%5D,%22status%22:%22submitted%22,%22marked%22:%22unmarked%22,%22keyword%22:%22%22,%22learning_center%22:true%7D&page=1&page_size=1`,
    homeworkHeader
  ).then((res) => res.json());
  if (first_total > 0) {
    let { submissions: submissions, total: total } = await fetch(
      `https://lms.ouchn.cn/api/homework/${exam_id}/submission-list?conditions=%7B%22org_id%22:null,%22department_ids%22:%5B%5D,%22grade_ids%22:%5B%5D,%22class_ids%22:%5B%5D,%22status%22:%22submitted%22,%22marked%22:%22unmarked%22,%22keyword%22:%22%22,%22learning_center%22:true%7D&page=1&page_size=${first_total}`,
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
      console.log(`${item.student.name}\t批改\t${final_score}`);
    }
    showMsg(`总计${total}人批改完成`, "success", "top", 3000);
  } else {
    showMsg(`程序异常`, "error", "top", 3000);
  }
}
async function pageReviewScore() {
  let min_score = 85,
    max_score = 98;
  if (
    $.isNumeric($("input[name='start_score']").val().trim()) &&
    $.isNumeric($("input[name='end_score']").val().trim())
  ) {
    min_score = parseFloat($("input[name='start_score']").val().trim());
    max_score = parseFloat($("input[name='end_score']").val().trim());
  }
  let exam_id = window.location.href.match(/\d+/)[0];
  let enrollmentHeader = {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "sec-ch-ua":
        '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    referrer: "https://lms.ouchn.cn/course/20000008202/ng",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  };
  let allStudentInfo = [];
  let { total: total } = await fetch(
    `https://lms.ouchn.cn/api/course/${exam_id}/enrollments?conditions=%7B%22org_id%22:null,%22department_ids%22:%5B%5D,%22grade_ids%22:%5B%5D,%22class_ids%22:%5B%5D,%22section_ids%22:%5B%5D,%22keyword%22:%22%22,%22group_id%22:null,%22learning_center%22:true,%22role_names%22:%5B%22student%22%5D%7D&fields=id,user(id,email,name,nickname,user_no,comment,grade(id,name),klass(id,name,code),department(id,name,code),org(id,name)),roles,retake_status,seat_number,group_ids&page=1&page_size=1`,
    enrollmentHeader
  ).then((res) => res.json());
  if (total > 0) {
    let { enrollments: enrollments } = await fetch(
      `https://lms.ouchn.cn/api/course/${exam_id}/enrollments?conditions=%7B%22org_id%22:null,%22department_ids%22:%5B%5D,%22grade_ids%22:%5B%5D,%22class_ids%22:%5B%5D,%22section_ids%22:%5B%5D,%22keyword%22:%22%22,%22group_id%22:null,%22learning_center%22:true,%22role_names%22:%5B%22student%22%5D%7D&fields=id,user(id,email,name,nickname,user_no,comment,grade(id,name),klass(id,name,code),department(id,name,code),org(id,name)),roles,retake_status,seat_number,group_ids&page=1&page_size=${total}`,
      enrollmentHeader
    ).then((res) => res.json());
    enrollments.forEach((item) => {
      allStudentInfo.push(item.user);
    });
    // 筛选“发帖数”为0
    Array.from($(".list-item.large-32.columns.ng-scope")).forEach((item, i) => {
      let data = $(item)
        .find(".large-5.column>span.ng-binding")
        .text()
        .split("")[0];
      let score_input = $(item).find("input[type='text']");
      if (
        parseFloat(data) > 0 &&
        ($(score_input).val() === "" ? 0 : parseFloat($(score_input).val())) ===
          0
      ) {
        let studentNo = $(item)
          .find(".large-3.column.user-no.truncate-text>span")
          .text()
          .trim();
        allStudentInfo.forEach((student, i) => {
          if (student.user_no.includes(studentNo)) {
            let score = randomNumBoth(min_score, max_score);
            allStudentInfo.splice(i, 1);
            $(score_input).trigger("input");
            $(score_input).val(score);
            $(score_input).trigger("change");
            $(score_input).trigger("blur");
          }
        });
      }
    });
  } else {
    showMsg(`程序异常`, "error", "top", 3000);
  }
}
function giveForumscores(url, body) {
  return fetch(url, {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9",
      "cache-control": "no-cache",
      "content-type": "application/json;charset=UTF-8",
      pragma: "no-cache",
      "sec-ch-ua":
        '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    referrer: "https://lms.ouchn.cn/course/20000008202/ng",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: JSON.stringify(body),
    method: "PUT",
    mode: "cors",
    credentials: "include",
  });
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
function getCountScore(previous, current, index, array) {
  if (current.length == 0) {
    current = 0;
  }
  return parseFloat(previous) + parseFloat(current);
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
