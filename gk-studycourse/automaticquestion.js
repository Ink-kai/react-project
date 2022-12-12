var question_content = $("ol.subjects-jit-display>li:not(.text)");
let score = 0;
$.each(question_content, async function (i, item) {
  var question = $(item)
    .find(
      ".subject-head .pre-wrap.subject-description.simditor-viewer.mathjax-process>p"
    )
    .text();
  var type = item.classList[item.classList.length - 1];
  type = type.split("_")[0];
  type = type === "true" ? "true_or_false" : type;
  question = question.replace(/[\—|\-|（|）|\s)]*/, "");
  // 搜索答题接口
  let { code: code,message:message,result: result } = await fetch(
    // `http://127.0.0.1:6007/v1/GetAnswer?name=${question}&type=${type}`
    `https://gkrj.37it.cn/v1/GetAnswer?name=${question}`
  ).then((res) => res.json());
  if (code === 200 && result?.length > 0) {
    let answer = result?.[0]?.Answer.trim();
    switch (type) {
      // 单选
      case "single":
        let s_question_score = $(item)
          .find(".summary-sub-title span[ng-bind='subject.getPoint()']")
          .text();
        let s_body = $(item).find(".subject-body>ol>li");
        $.each(s_body, (i, li) => {
          let txt = $(li).find(".option-content>span").text();
          if (txt === answer) {
            $(li).find("input").click();
          }
        });
        score += parseInt(s_question_score);
        break;
      // 多选
      case "multiple":
        // answer?.result[0].Answer;
        break;
      // 判断
      case "true_or_false":
        let t_question_score = $(item)
          .find(".summary-sub-title span[ng-bind='subject.getPoint()']")
          .text();
        let t_body = $(item).find(".subject-body>ol>li");
        $.each(t_body, (i, li) => {
          let txt = $(li).find(".option-content>span").text();
          if (txt === answer) {
            $(li).find("input").click();
          }
        });
        score += t_question_score;
        score += parseInt(t_question_score);
        // answer?.result[0].Answer;
        break;
      // 单选
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
    let question_index=$(item).find('.summary-title span[ng-bind="getSubjectIndex(subject, $index)"]').text()
    // 找不到答案
    console.log(`第${question_index}题\t${message}`);
  }
});
