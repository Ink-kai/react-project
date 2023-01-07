
Date.prototype.format = function (format) {
  var o = {
    "M+": this.getMonth() + 1, //month
    "d+": this.getDate(), //day
    "h+": this.getHours(), //hour
    "m+": this.getMinutes(), //minute
    "s+": this.getSeconds(), //second
    "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
    S: this.getMilliseconds(), //millisecond
  };
  if (/(y+)/.test(format))
    format = format.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(format))
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return format;
};
let courseArr = [];
let myCourse = {},
  header = {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      "sec-ch-ua":
        '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    referrer: "https://lms.ouchn.cn/user/courses",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  },
  summaryHeader = {};
summary = {};
// 试探题库数
let { total: total } = await fetch(
  `https://lms.ouchn.cn/api/my-courses?conditions=%7B%22status%22:%5B%22ongoing%22%5D,%22keyword%22:%22%22%7D&fields=id,name,course_code,department(id,name),grade(id,name),klass(id,name),course_type,cover,small_cover,start_date,end_date,is_started,is_closed,academic_year_id,semester_id,credit,compulsory,second_name,display_name,created_user(id,name),org(is_enterprise_or_organization),org_id,public_scope,course_attributes(teaching_class_name,copy_status,tip,data),audit_status,audit_remark,can_withdraw_course,imported_from,allow_clone,is_instructor,is_team_teaching,academic_year(id,name),semester(id,name),instructors(id,name,email,avatar_small_url),is_master,is_child,has_synchronized,master_course(name)&
  page=1&page_size=1`,
  header
).then((res) => res.json());
console.log("总数：", total);
let page = 100;
if (Math.floor(total / page) > 1) {
  for (let i = 0; i <= Math.floor(total / page); i++) {
    await ((i) => {
      return new Promise((resolve, reject) => {
        fetch(
          `https://lms.ouchn.cn/api/my-courses?conditions=%7B%22status%22:%5B%22ongoing%22%5D,%22keyword%22:%22%22%7D&fields=id,name,course_code,department(id,name),grade(id,name),klass(id,name),course_type,cover,small_cover,start_date,end_date,is_started,is_closed,academic_year_id,semester_id,credit,compulsory,second_name,display_name,created_user(id,name),org(is_enterprise_or_organization),org_id,public_scope,course_attributes(teaching_class_name,copy_status,tip,data),audit_status,audit_remark,can_withdraw_course,imported_from,allow_clone,is_instructor,is_team_teaching,academic_year(id,name),semester(id,name),instructors(id,name,email,avatar_small_url),is_master,is_child,has_synchronized,master_course(name)&
      page=${i}&page_size=100`,
          header
        )
          .then((res) => res.json())
          .then(({ courses: courses }) => {
            courseArr = courseArr.concat(courses);
            resolve();
          });
      });
    })(i);
  }
} else {
  fetch(
    `https://lms.ouchn.cn/api/my-courses?conditions=%7B%22status%22:%5B%22ongoing%22%5D,%22keyword%22:%22%22%7D&fields=id,name,course_code,department(id,name),grade(id,name),klass(id,name),course_type,cover,small_cover,start_date,end_date,is_started,is_closed,academic_year_id,semester_id,credit,compulsory,second_name,display_name,created_user(id,name),org(is_enterprise_or_organization),org_id,public_scope,course_attributes(teaching_class_name,copy_status,tip,data),audit_status,audit_remark,can_withdraw_course,imported_from,allow_clone,is_instructor,is_team_teaching,academic_year(id,name),semester(id,name),instructors(id,name,email,avatar_small_url),is_master,is_child,has_synchronized,master_course(name)&
      page=1&page_size=${page}`,
    header
  )
    .then((res) => res.json())
    .then(({ courses: courses }) => {
      courseArr = courseArr.concat(courses);
    });
}
console.log("课程总计：", courseArr.length);
if (courseArr ?? "" !== "") {
  for (const course of courseArr) {
    await ((course) => {
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          header["referrer"] = `https://lms.ouchn.cn/course/${course.id}/ng`;
          // 获取课程中所有考试题库 libs：题库信息  total：题库数
          let { subject_libs: subject_libs } = await fetch(
            `https://lms.ouchn.cn/api/course/${course.id}/subject-libs?keyword=&lib_type=all&page=1&page_size=1000&parent_id=0&predicate=id&reverse=true`,
            header
          ).then((res) => res.json());
          if ((subject_libs ?? "" !== "") && subject_libs?.length > 0) {
            subject_libs.map(async (lib, i) => {
              header["referrer"] = `https://lms.ouchn.cn/course/${lib.id}/ng`;
              let { subjects: subjects } = await fetch(
                `https://lms.ouchn.cn/api/subject-libs/${lib.id}`,
                header
              ).then((res) => res.json());
              subjects.map(async (item) => {
                let answer = "";
                if (item.options?.length > 0) {
                  answer = generateAnswer(item.options);
                }
                summary = {
                  Id: item.id,
                  Name:
                    delHtmlTag(item.description) === ""
                      ? item.description
                          ?.match(/[(a-zA-Z)|(0-9)|\u4E00-\u9FA5]+/g)
                          ?.join("")
                      : delHtmlTag(item.description)
                          ?.match(/[(a-zA-Z)|(0-9)|\u4E00-\u9FA5]+/g)
                          ?.join(""),
                  Answer:
                    answer ?? "" === ""
                      ? delHtmlTag(answer)
                          ?.match(/[(a-zA-Z)|(0-9)|\u4E00-\u9FA5]+/g)
                          ?.join("")
                      : "",
                  Point: item.point,
                  Type: item.type,
                  Updated_at: new Date().format("yyyy-MM-dd hh:mm:ss"),
                  Level: item.difficulty_level,
                  Course: course.display_name,
                  Source: globalData.user.name + "/" + globalData.user.mobile,
                };
                let { message: msg } = await fetch(
                  `https://gkrj.37it.cn/v1/subjectSummary`,
                  // `http://127.0.0.1:6007/v1/subjectSummary`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(summary),
                  }
                ).then(res=>res.json())
                console.log(msg);
              });
              /*
        论述题/简答题 以下type没有答案
        short_answer

        id                  题目编号
        description         题目
        correct_answers     正确答案
        options             单项选择题/判断题 Array
            content         内容
            is_answer       正确答案
        point               分数
        difficulty_level    题目难度
        last_updated_at     题目上传时间
        type                题型
         */
            });
          }
          resolve();
        }, 1500);
      });
    })(course);
  }
}

function delHtmlTag(str) {
  return str.replace(/<[^>]+>/g, "").replace(/s/g, ""); //去掉所有的html标记
}
function generateAnswer(arr) {
  let tmp = "";
  arr.map((item) => {
    item.is_answer === true ? (tmp += item.content) : "";
  });
  return tmp;
}