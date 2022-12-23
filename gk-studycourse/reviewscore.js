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
          showMsg("进行下一个评阅", "info", "top", 3000);
          $(
            ".submission.left.examinee-list .icon-student-right-narrow"
          ).click();
        }
      }, 1000);
    } else if (
      /course\/(\d+)\/learning-activity/.test(window.location.pathname)
    ) {
      setInterval(() => {
        if ($("#InkContent").length === 0) {
          $("exam-score-list div.operator-wrapper").append(
            `<span id="InkContent" style="display: inline-flex;min-width: 500px;align-items: center;">分数：
          <input style="width:20%" autocomplete="off" spellcheck="false" type="text" placeholder="85" name="start_score" class="ivu-input ivu-input-default">
          <input style="width:20%" autocomplete="off" spellcheck="false" type="text" placeholder="98" name="end_score" class="ivu-input ivu-input-default">&nbsp;
          <button class='button' id="SubmitScore">修改</button></span>`
          );
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
  let arr = Array.from($(question_body).find("ol>li:not(:first)"));
  let total_score = 0;
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    await ((item, i) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let score = $(item)
            .find(".subject-point> span:nth-child(2)>span:first")
            .text();
          let score_input = $(item).find(
            ".subject-score.ng-scope input[name='score']"
          );
          total_score += score;
          if (score !== 0) {
            $(score_input).trigger("input");
            $(score_input).val(score);
            $(score_input).trigger("change");
            $(score_input).trigger("blur");
          }
          resolve();
        }, randomNumBoth(1, 2) * 1000);
      });
    })(item, i);
  }
}
async function reviewScore() {
  // 打分
  showMsg("开始打分", "info", "top", 2000);
  let min_score = 85,
    max_score = 98;
  if (
    $.isNumeric($("input[name='start_score']").val().trim()) &&
    $.isNumeric($("input[name='end_score']").val().trim())
  ) {
    min_score = parseFloat($("input[name='start_score']").val().trim());
    max_score = parseFloat($("input[name='end_score']").val().trim());
  }
  let page_size = $(".ivu-page-total")?.text()?.match(/\d+/)?.[0] || 500;
  let exam_id = window.location.hash.match(/\d+/)[0];
  let { items: items, total: total } = await fetch(
    `https://lms.ouchn.cn/api/exam/${exam_id}/scores?page=1&page_size=${page_size}&conditions=%7B%22org_ids%22:[],%22department_ids%22:[],%22section_ids%22:[],%22klass_ids%22:[],%22grade_ids%22:[],%22submit_status%22:[%22submitted%22],%22mark_status%22:null,%22keyword%22:%22%22,%22sort_by%22:%7B%22predicate%22:%22id%22,%22reverse%22:false%7D%7D`
  ).then((res) => res.json());
  let putHeader = {
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
    body: '{"final_score":100}',
    method: "PUT",
    mode: "cors",
    credentials: "include",
  };
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.submit_time !== "") {
      let hopeScore = randomNumBoth(min_score, max_score);
      putHeader.body = JSON.stringify({ final_score: hopeScore });
      let { message: message } = await fetch(
        `https://lms.ouchn.cn/api/exam-scores/${item.id}`,
        putHeader
      ).then((res) => res.json());
      console.log(
        "姓名",
        item["created_by"]["name"],
        "课程\t",
        item["section"]["name"].substring(1, 5),
        "分数\t",
        hopeScore,
        "修改分数结果\t",
        message
      );
    }
  }
  showMsg(`总计${total}人打分完成`, "success", "top", 3000);
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
