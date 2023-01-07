var question_content = $("ol.subjects-jit-display>li:not(.text)");
let score = 0;
// 未答题有答案导航
let answerQuestion_html = `<div id='answerQuestion' style='
width: 210px;height:200px;text-align:end;
position: fixed;top: 80px;left: 5px;
font-size:24px;font-weight:bold;
'><div name="title" style="text-align:left;font-size:16px;margin-bottom:10px;border-bottom-style:dashed">未答题有答案导航(可跳转)</div>
<ul style="height: 550px;overflow-y: auto;"><li hidden></li></ul></div>`;
// 未答题导航
let nullQuestion_html = `<div id='nullQuestion' style='
width: 210px;height:200px;text-align:end;
position: fixed;top: 80px;right: 5px;
font-size:24px;font-weight:bold;
'><div name="title" style="text-align:left;font-size:16px;margin-bottom:10px;border-bottom-style:dashed">未答题无答案导航(可跳转)</div>
<ul style="height: 550px;overflow-y: auto;"><li hidden></li></ul></div>`;
// 创建无效题目录导航
if ($("#nullQuestion").length == 0) {
  $(".exam-area-content").before(answerQuestion_html);
  $(".exam-area-content").before(nullQuestion_html);
}
scrollToLocation("nullQuestion", "ul>li");
$.each(question_content, async function (i, item) {
  var question = $(item)
    .find(
      ".subject-head .pre-wrap.subject-description.simditor-viewer.mathjax-process>p"
    )
    .text();
  var type = item.classList[item.classList.length - 1];
  type = type.split("_")[0];
  type = type === "true" ? "true_or_false" : type;
  /*
  [\u4E00-\u9FA5]+  多个中文
  */
  let question_keyword;
  question = question.match(/[(a-zA-Z)|\u4E00-\u9FA5]+/g)?.join("-");
  if (!/\w*/.test(question)) {
    let question_word_count = 0;
    question.map((item) => {
      if (item.length > question_word_count) {
        question_word_count = item.length;
        question_keyword = item;
      }
    });
  } else {
    question_keyword = question;
  }
  let question_index = $(item)
    .find('.summary-title span[ng-bind="getSubjectIndex(subject, $index)"]')
    .text();
  let nullArr = [];
  let answer = "";
  // 搜索答题接口
  await fetch(`https://gkrj.37it.cn/v1/GetAnswer?name=${question_keyword}`)
    .then((res) => res.json())
    .then(({ code, result, message }) => {
      if (code === 200 && result?.length > 0) {
        // 答案拼接
        result.map((item) => {
          answer = answer.concat(" ", item.Answer.trim());
        });
        switch (type) {
          // 单选
          case "single":
            answerQuestion(item, answer, score, question_index, nullQuestion);
            break;
          // 多选
          case "multiple":
            answerQuestion(item, answer, score, question_index, nullQuestion);
            break;
          // 判断
          case "true_or_false":
            answerQuestion(item, answer, score, question_index, nullQuestion);
            // answer?.result[0].Answer;
            break;
          // 完形
          case "fill":
            // answer?.result[0].Answer;
            break;
          // 简答
          case "short":
            // answer?.result[0].Answer;
            break;
          // 文本
          case "text":
            // answer?.result[0].Answer;
            break;
          // 综合
          case "analysis":
            // answer?.result[0].Answer;
            break;
          // 匹配
          case "match":
            // answer?.result[0].Answer;
            break;
          // 随机
          case "random":
            // answer?.result[0].Answer;
            break;
          // 完形填空
          case "cloze":
            // answer?.result[0].Answer;
            break;
        }
      } else {
        $.each($("#nullQuestion>ul>li"), (i, item) => {
          nullArr.push($(item).text());
        });
        if (!nullArr.includes(`第${question_index}题`)) {
          $(item)
            .find(".summary-title")
            .attr("id", "answer" + question_index);
          $("#nullQuestion>ul").append(
            `<li onclick="document.querySelector('${
              "#answer" + question_index
            }').scrollIntoView({behavior: 'smooth',block: 'center',inline: 'nearest',});">第${question_index}题</a></li>`
          );
        }
      }
    });
});
customFetch(
  `https://lms.ouchn.cn/api/exams/${
    /(\d+)/.exec(window.location.href)[1]
  }/left_time`,
  {
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
    referrer: "https://lms.ouchn.cn/exam/20000067558/subjects",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  }
);
function customFetch(url, header) {
  return fetch(url, header);
}
// 通用答题方法
function answerQuestion(item, answer, score, question_index, nullQuestion) {
  let isChecked = false;
  let question_score = $(item)
    .find(".summary-sub-title span[ng-bind='subject.getPoint()']")
    .text();
  let s_body = $(item).find(".subject-body>ol>li");
  $.each(s_body, (i, li) => {
    let txt = $(li).find(".option-content>span").text();
    if (answer.includes(txt.trim())) {
      let input = $(li).find("input");
      $(input).prop("checked") === true ? "" : $(input).click();
      isChecked = true;
    }
  });
  let li = `<li onclick="document.querySelector('${
    "#answer" + question_index
  }').scrollIntoView({behavior: 'smooth',block: 'center',inline: 'nearest',});">第${question_index}题</a></li>`;

  let answerArr = [];
  $.each($("#nullQuestion>ul>li"), (item, i) => {
    answerArr.push($(item).text());
  });
  if ($(item).find("[name='ink-Answer'").length == 0 && isChecked === false) {
    $(item)
      .find(".summary-title")
      .append(
        `<span id=${
          "answer" + question_index
        } name="ink-Answer" style="font-weight:bolder;color:red;width:300px">推荐答案：${answer.trim()}</span>`
      );
    if (!answerArr.includes(`第${question_index}题`)) {
      $("#answerQuestion>ul").append(li);
    }
  }
  score += parseInt(question_score);
}
// 滑动定位
function scrollToLocation(element, chilren) {
  var mainContainer = $(`${"#" + element}`),
    scrollToContainer = mainContainer.find(`${chilren + ":last"}`);
  //动画效果
  mainContainer.animate(
    {
      scrollTop:
        scrollToContainer.offset().top -
        mainContainer.offset().top +
        mainContainer.scrollTop(),
    },
    2000
  );
}
